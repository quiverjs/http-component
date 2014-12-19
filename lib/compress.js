import { error } from 'quiver-core/error'
import { async } from 'quiver-core/promise'
import { httpFilter } from 'quiver-core/component'
import { compressStreamable } from 'quiver-stream-component'
import { parseSubheaders } from './header'

var acceptRegex = /^\s*([a-zA-Z]+|\*)(?:\s*;q=(\d(?:\.\d)?))?\s*$/

var validEncoding = ['gzip', 'identity', '*']

export var selectAcceptEncoding = header => {
  var fields = { }

  header.split(',')
    .forEach(field => {
      var matches = acceptRegex.exec(field)

      if(!matches)
        throw error(400, 'Invalid Accept-Encoding header')

      var encoding = matches[1]
      var qvalue = matches[2] ? parseFloat(matches[2]) : 1
      var accepted = (qvalue > 0)

      if(validEncoding.indexOf(encoding) != -1)
        fields[encoding] = accepted
    })

  if(fields.gzip || 
    (fields['*'] && fields.gzip !== false)) 
  {
    return 'gzip'
  }

  if(fields.identity || 
    (fields['*'] !== false && fields.identity !== false))
  {
    return 'identity'
  }

  throw error(415, 'No acceptable encoding')
}

export var httpCompressFilter = httpFilter(
(config, handler) => {
  var { httpCompressionThreshold=1024 } = config

  return async(function*(requestHead, requestStreamable) {
    var acceptEncoding = requestHead.getHeader(
      'accept-encoding')

    var response = yield handler(
      requestHead, requestStreamable)

    if(!acceptEncoding) return response

    var encoding = selectAcceptEncoding(acceptEncoding)

    if(encoding != 'gzip') return response

    var [responseHead, responseStreamable] = response

    if(responseHead.getHeader('content-encoding'))
      return response

    var contentLength = responseHead.getHeader('content-length')

    if(contentLength && 
      parseInt(contentLength) < httpCompressionThreshold)
    {
      return response
    }

    var compressedStreamable = yield compressStreamable('gzip',
      responseStreamable)

    responseHead.setHeader('content-encoding', 'gzip')
    responseHead.removeHeader('content-length')

    return [responseHead, compressedStreamable]
  })
})

export var makeHttpCompressFilter = 
  httpCompressFilter.factory()