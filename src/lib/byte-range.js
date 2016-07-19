import { error } from 'quiver-core/util/error'
import { extract } from 'quiver-core/util/immutable'
import { httpFilter } from 'quiver-core/component/constructor'

import {
  createChannel, streamToStreamable
} from 'quiver-core/stream-util'

const byteRangePattern = /^bytes=(\d+)-(\d*)$/i

const parseRange = header => {
  const matches = header.match(byteRangePattern)
  if(!matches) return [0, -1]

  const start = parseInt(matches[1])
  let end = parseInt(matches[2])+1
  if(isNaN(end)) end = -1

  return [start, end]
}

const pipeByteRange = async (readStream, writeStream, start, end) => {
  try {
    let currentPos = 0

    const { closed: writeClosed } = await writeStream.prepareWrite()
    if(writeClosed) return readStream.closeRead()

    while(true) {
      let { closed, data } = await readStream.read()
      if(closed) return writeStream.closeWrite(
        error(400, 'read stream closed prematurely before end'))

      if(!Buffer.isBuffer(data))
        data = new Buffer(data)

      let nextPos = currentPos + data.length

      if(currentPos < start) {
        if(nextPos <= start) {
          currentPos = nextPos
          continue
        }

        if(nextPos > start) {
          data = data.slice(start-currentPos)
          currentPos = start
        }
      }

      if(nextPos > end) {
        data = data.slice(0, end-currentPos)
        nextPos = end
      }

      writeStream.write(data)
      currentPos = nextPos

      if(currentPos == end) {
        return writeStream.closeWrite()
      }

      const { closed: writeClosed } = await writeStream.prepareWrite()
      if(writeClosed) return readStream.closeRead()
    }

  } catch(err) {
    try {
      writeStream.closeWrite(err)
    } finally {
      readStream.closeRead(err)
    }
  }
}

export const byteRangeStream = (readStream, start, end) => {
  const {
    readStream: resultStream,
    writeStream
  } = createChannel()

  pipeByteRange(readStream, writeStream, start, end)
  return resultStream
}

export const byteRangeFilter = httpFilter(
  (config, handler) => {
    const {
      convertNonRangeStream=false
    } = config::extract()

    return async (requestHead, requestStreamable) => {
      const rangeHeader = requestHead.getHeader('range')

      const response = await handler(requestHead, requestStreamable)

      let [
        responseHead, responseStreamable
      ] = response

      if(responseHead.status !== '200')
        return response

      if(responseHead.getHeader('content-range'))
        return response

      const {
        toByteRangeStream,
        contentLength
      } = responseStreamable

      if(!contentLength) return response

      if(toByteRangeStream) {
        responseHead = responseHead.setHeader('accept-ranges', 'bytes')
      }

      if(!rangeHeader) return response

      let [start, end] = parseRange(rangeHeader)
      if(end==-1) end = contentLength

      if(end > contentLength) throw error(416,
        'Requested Range Not Satisfiable')

      let rangeStream
      if(toByteRangeStream) {
        rangeStream = await responseStreamable
          .toByteRangeStream(start, end)

      } else {
        const readStream = await responseStreamable.toStream()
        rangeStream = byteRangeStream(readStream, start, end)
      }

      const rangeStreamable = streamToStreamable(rangeStream)
      const contentRange = 'bytes ' + start + '-' + (end-1) +
        '/' + contentLength

      responseHead = responseHead
        .setStatus(206)
        .setHeader('content-range', contentRange)
        .setHeader('content-length', ''+(end-start))

      return [responseHead, rangeStreamable]
    }
  })

export const makeByteRangeFilter = byteRangeFilter.export()
