import { error } from 'quiver-core/error'
import { async } from 'quiver-core/promise'
import { httpFilter } from 'quiver-core/component'
import { compressStreamable } from 'quiver-stream-component'
import { parseSubheaders } from './header'

let acceptRegex = /^\s*([a-zA-Z]+|\*)(?:\s*;q=(\d(?:\.\d)?))?\s*$/

let validEncoding = ['gzip', 'identity', '*']

export let selectAcceptEncoding = header => {
  let fields = { }

  header.split(',')
    .forEach(field => {
      let matches = acceptRegex.exec(field)

      if(!matches)
        throw error(400, 'Invalid Accept-Encoding header')

      let encoding = matches[1]
      let qvalue = matches[2] ? parseFloat(matches[2]) : 1
      let accepted = (qvalue > 0)

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

export let httpCompressFilter = httpFilter(
(config, handler) => {
  let { httpCompressionThreshold=1024 } = config

  return async(function*(requestHead, requestStreamable) {
    let acceptEncoding = requestHead.getHeader(
      'accept-encoding')

    let response = yield handler(
      requestHead, requestStreamable)

    if(!acceptEncoding) return response

    let encoding = selectAcceptEncoding(acceptEncoding)

    if(encoding != 'gzip') return response

    let [responseHead, responseStreamable] = response

    if(responseHead.getHeader('content-encoding'))
      return response

    let contentLength = responseHead.getHeader('content-length')

    if(contentLength && 
      parseInt(contentLength) < httpCompressionThreshold)
    {
      return response
    }

    let compressedStreamable = yield compressStreamable('gzip',
      responseStreamable)

    responseHead.setHeader('content-encoding', 'gzip')
    responseHead.removeHeader('content-length')

    return [responseHead, compressedStreamable]
  })
})

export let makeHttpCompressFilter = 
  httpCompressFilter.factory()