import { error } from 'quiver/error'
import { async } from 'quiver/promise'

import { httpFilter } from 'quiver/component'

import {
  createChannel,
  streamToStreamable
} from 'quiver/stream-util'

const byteRangePattern = /^bytes=(\d+)-(\d*)$/i

const parseRange = function(header) {
  const matches = header.match(byteRangePattern)
  if(!matches) return [0, -1]
  
  const start = parseInt(matches[1])
  const end = parseInt(matches[2])+1
  if(isNaN(end)) end = -1
  
  return [start, end]
}

const pipeByteRange = async(
function*(readStream, writeStream, start, end) {
  try {
    let currentPos = 0

    const { closed: writeClosed } = yield writeStream.prepareWrite()
    if(writeClosed) return readStream.closeRead()

    while(true) {
      let { closed, data } = yield readStream.read()
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

      const { closed: writeClosed } = yield writeStream.prepareWrite()
      if(writeClosed) return readStream.closeRead()
    }

  } catch(err) {
    try {
      writeStream.closeWrite(err)
    } finally {
      readStream.closeRead(err)
    }
  }
})

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
  } = config

  return async(function*(requestHead, requestStreamable) {
    const rangeHeader = requestHead.getHeader('range')

    const response = yield handler(requestHead, requestStreamable)

    const [
      responseHead, responseStreamable
    ] = response

    if(responseHead.statusCode != 200) 
      return response

    if(responseHead.getHeader('content-range')) 
      return response

    const {
      toByteRangeStream,
      contentLength
    } = responseStreamable

    if(!contentLength) return response

    if(toByteRangeStream) {
      responseHead.setHeader('accept-ranges', 'bytes')
    }

    if(!rangeHeader) return response

    const [start, end] = parseRange(rangeHeader)
    if(end==-1) end = contentLength
    if(start==0 && end==contentLength) return response

    if(end > contentLength) throw error(416,
      'Requested Range Not Satisfiable')

    let rangeStream
    if(toByteRangeStream) {
      rangeStream = yield responseStreamable
        .toByteRangeStream(start, end)

    } else {
      const readStream = yield responseStreamable.toStream()
      rangeStream = byteRangeStream(readStream, start, end)
    }

    const rangeStreamable = streamToStreamable(rangeStream)
    const contentRange = 'bytes ' + start + '-' + (end-1) + 
      '/' + contentLength

    responseHead.statusCode = 206
    responseHead.statusMessage = 'Partial Content'

    responseHead.setHeader('content-range', contentRange)
    responseHead.setHeader('content-length', ''+(end-start))

    return [responseHead, rangeStreamable]
  })
})

export const makeByteRangeFilter = byteRangeFilter.factory()