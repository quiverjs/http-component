import { error } from 'quiver-core/error'
import { async } from 'quiver-core/promise'

import { httpFilter } from 'quiver-core/component'

import {
  createChannel,
  streamToStreamable
} from 'quiver-core/stream-util'

let byteRangePattern = /^bytes=(\d+)-(\d*)$/i

let parseRange = function(header) {
  let matches = header.match(byteRangePattern)
  if(!matches) return [0, -1]
  
  let start = parseInt(matches[1])
  let end = parseInt(matches[2])+1
  if(isNaN(end)) end = -1
  
  return [start, end]
}

let pipeByteRange = async(
function*(readStream, writeStream, start, end) {
  try {
    let currentPos = 0

    let { closed: writeClosed } = yield writeStream.prepareWrite()
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

      let { closed: writeClosed } = yield writeStream.prepareWrite()
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

export let byteRangeStream = (readStream, start, end) => {
  let {
    readStream: resultStream,
    writeStream
  } = createChannel()

  pipeByteRange(readStream, writeStream, start, end)
  return resultStream
}

export let byteRangeFilter = httpFilter(
(config, handler) => {
  let { 
    convertNonRangeStream=false 
  } = config

  return async(function*(requestHead, requestStreamable) {
    let rangeHeader = requestHead.getHeader('range')

    let response = yield handler(requestHead, requestStreamable)

    let [
      responseHead, responseStreamable
    ] = response

    if(responseHead.statusCode != 200) 
      return response

    if(responseHead.getHeader('content-range')) 
      return response

    let {
      toByteRangeStream,
      contentLength
    } = responseStreamable

    if(!contentLength) return response

    if(toByteRangeStream) {
      responseHead.setHeader('accept-ranges', 'bytes')
    }

    if(!rangeHeader) return response

    let [start, end] = parseRange(rangeHeader)
    if(end==-1) end = contentLength
    if(start==0 && end==contentLength) return response

    if(end > contentLength) throw error(416,
      'Requested Range Not Satisfiable')

    let rangeStream
    if(toByteRangeStream) {
      rangeStream = yield responseStreamable
        .toByteRangeStream(start, end)

    } else {
      let readStream = yield responseStreamable.toStream()
      rangeStream = byteRangeStream(readStream, start, end)
    }

    let rangeStreamable = streamToStreamable(rangeStream)
    let contentRange = 'bytes ' + start + '-' + (end-1) + 
      '/' + contentLength

    responseHead.statusCode = 206
    responseHead.statusMessage = 'Partial Content'

    responseHead.setHeader('content-range', contentRange)
    responseHead.setHeader('content-length', ''+(end-start))

    return [responseHead, rangeStreamable]
  })
})

export let makeByteRangeFilter = byteRangeFilter.factory()