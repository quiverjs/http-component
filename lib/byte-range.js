import { error } from 'quiver-error'
import { async } from 'quiver-promise'

import { httpFilter } from 'quiver-component'

import {
  createChannel,
  streamToStreamable
} from 'quiver-stream-util'

var byteRangePattern = /^bytes=(\d+)-(\d*)$/i

var parseRange = function(header) {
  var matches = header.match(byteRangePattern)
  if(!matches) return [0, -1]
  
  var start = parseInt(matches[1])
  var end = parseInt(matches[2])+1
  if(isNaN(end)) end = -1
  
  return [start, end]
}

var pipeByteRange = async(
function*(readStream, writeStream, start, end) {
  try {
    var currentPos = 0

    var { closed } = yield writeStream.prepareWrite()
    if(closed) return readStream.closeRead()

    while(true) {
      var { closed, data } = yield readStream.read()
      if(closed) return writeStream.closeWrite(
        error(400, 'read stream closed prematurely before end'))

      if(!Buffer.isBuffer(data))
        data = new Buffer(data)

      var nextPos = currentPos + data.length

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

      var { closed } = yield writeStream.prepareWrite()
      if(closed) return readStream.closeRead()
    }

  } catch(err) {
    try {
      writeStream.closeWrite(err)
    } finally {
      readStream.closeRead(err)
    }
  }
})

export var byteRangeStream = (readStream, start, end) => {
  var {
    readStream: resultStream,
    writeStream
  } = createChannel()

  pipeByteRange(readStream, writeStream, start, end)
  return resultStream
}

export var byteRangeFilter = httpFilter(
(config, handler) => {
  var { 
    convertNonRangeStream=false 
  } = config

  return async(function*(requestHead, requestStreamable) {
    var rangeHeader = requestHead.getHeader('range')

    var response = yield handler(requestHead, requestStreamable)

    var [
      responseHead, responseStreamable
    ] = response

    if(responseHead.statusCode != 200) 
      return response

    if(responseHead.getHeader('content-range')) 
      return response

    var {
      toByteRangeStream,
      contentLength
    } = responseStreamable

    if(!contentLength) return response

    if(toByteRangeStream) {
      responseHead.setHeader('accept-ranges', 'bytes')
    }

    if(!rangeHeader) return response

    var [start, end] = parseRange(rangeHeader)
    if(end==-1) end = contentLength
    if(start==0 && end==contentLength) return response

    if(end > contentLength) throw error(416,
      'Requested Range Not Satisfiable')

    if(toByteRangeStream) {
      var rangeStream = yield responseStreamable
        .toByteRangeStream(start, end)

    } else {
      var readStream = yield responseStreamable.toStream()
      var rangeStream = byteRangeStream(readStream, start, end)

    }

    var rangeStreamable = streamToStreamable(rangeStream)
    var contentRange = 'bytes ' + start + '-' + (end-1) + 
      '/' + contentLength

    responseHead.statusCode = 206
    responseHead.statusMessage = 'Partial Content'

    responseHead.setHeader('content-range', contentRange)
    responseHead.setHeader('content-length', ''+(end-start))

    return [responseHead, rangeStreamable]
  })
})