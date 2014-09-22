import { error } from 'quiver-error'
import { async } from 'quiver-promise'

import { httpFilter } from 'quiver-component'

import {
  streamToStreamable
} from 'quiver-stream-util'

var byteRangePattern = /^bytes=(\d+)-(\d*)$/i

var parseRange = function(header) {
  var matches = header.match(pattern)
  if(!matches) return [0, -1]
  
  var start = parseInt(matches[1])
  var end = parseInt(matches[2])+1
  if(isNaN(end)) end = -1
  
  return [start, end]
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

    if(responseHead.statusCode != 200) return response

    var {
      toByteRangeStream,
      contentLength
    } = responseStreamable

    var isRangeStreamable = toByteRangeStream && contentLength

    if(isRangeStreamable) {
      responseHead.setHeader('accept-ranges', 'bytes')
    }

    if(rangeHeader && isRangeStreamable) {
      var [start, end] = parseRange(rangeHeader)
      if(start==0 && end==-1) return response

      if(end==-1) end = contentLength
      if(end > contentLength) throw error(416,
        'Requested Range Not Satisfiable')

      var rangeStream = yield responseStreamable
        .toByteRangeStream(start, end)

      var rangeStreamable = streamToStreamable(rangeStream)
      var contentRange = 'bytes ' + start + '-' + (end-1) + 
        '/' + contentLength

      responseHead.statusCode = 206
      responseHead.statusMessage = 'Partial Content'

      responseHead.setHeader('content-range', contentRange)
      responseHead.setHeader('content-length', contentLength)

      return [responseHead, rangeStreamable]

    } else {
      // TODO: Adapt non-range streamable
      return response
    }
  })
})