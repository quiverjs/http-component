import { error } from 'quiver/error'
import { async } from 'quiver/promise'
import { httpFilter } from 'quiver/component'
import { compressStreamable } from 'quiver-stream-component'
import { parseSubheaders } from './header'

const acceptRegex = /^\s*([a-zA-Z]+|\*)(?:\s*;q=(\d(?:\.\d)?))?\s*$/

const validEncoding = ['gzip', 'identity', '*']

export const selectAcceptEncoding = header => {
  const fields = { }

  header.split(',')
    .forEach(field => {
      const matches = acceptRegex.exec(field)

      if(!matches)
        throw error(400, 'Invalid Accept-Encoding header')

      const encoding = matches[1]
      const qvalue = matches[2] ? parseFloat(matches[2]) : 1
      const accepted = (qvalue > 0)

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

export const httpCompressFilter = httpFilter(
(config, handler) => {
  const { httpCompressionThreshold=1024 } = config

  return async(function*(requestHead, requestStreamable) {
    const acceptEncoding = requestHead.getHeader(
      'accept-encoding')

    const response = yield handler(
      requestHead, requestStreamable)

    if(!acceptEncoding) return response

    const encoding = selectAcceptEncoding(acceptEncoding)

    if(encoding != 'gzip') return response

    const [responseHead, responseStreamable] = response

    if(responseHead.getHeader('content-encoding'))
      return response

    const contentLength = responseHead.getHeader('content-length')

    if(contentLength && 
      parseInt(contentLength) < httpCompressionThreshold)
    {
      return response
    }

    const compressedStreamable = yield compressStreamable('gzip',
      responseStreamable)

    responseHead.setHeader('content-encoding', 'gzip')
    responseHead.removeHeader('content-length')

    return [responseHead, compressedStreamable]
  })
})

export const makeHttpCompressFilter = 
  httpCompressFilter.factory()