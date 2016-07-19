import { error } from 'quiver-core/util/error'
import { extract } from 'quiver-core/util/immutable'
import { httpFilter } from 'quiver-core/component/constructor'
import { compressStreamable } from 'quiver-stream-component'

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
  const { httpCompressionThreshold=1024 } = config::extract()

  return async (requestHead, requestStreamable) => {
    const acceptEncoding = requestHead.getHeader(
      'accept-encoding')

    const response = await handler(
      requestHead, requestStreamable)

    if(!acceptEncoding) return response

    const encoding = selectAcceptEncoding(acceptEncoding)

    if(encoding != 'gzip') return response

    let [responseHead, responseStreamable] = response

    if(responseHead.getHeader('content-encoding'))
      return response

    const contentLength = responseHead.getHeader('content-length')

    if(contentLength &&
      parseInt(contentLength) < httpCompressionThreshold)
    {
      return response
    }

    const compressedStreamable = await compressStreamable('gzip',
      responseStreamable)

    responseHead = responseHead
      .setHeader('content-encoding', 'gzip')
      .deleteHeader('content-length')

    return [responseHead, compressedStreamable]
  }
})

export const makeHttpCompressFilter =
  httpCompressFilter.export()
