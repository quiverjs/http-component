import { async } from 'quiver-core/promise'
import { httpFilter } from 'quiver-core/component'
import { emptyStreamable } from 'quiver-core/stream-util'

import crypto from 'crypto'

const algorithm = 'sha1'
const checksumField = 'checksum-sha1'

const checksumBuffer = buffer =>
  crypto.createHash(algorithm)
    .update(buffer)
    .digest('hex')

const etagStreamable = async(function*(streamable) {
  if(streamable.etag) 
    return streamable.etag

  if(streamable[checksumField]) 
    return streamable[checksumField]

  if(!streamable.toBuffer) 
    return null

  const buffer = yield streamable.toBuffer()

  const etag = checksumBuffer(buffer)

  streamable.etag = etag
  streamable[checksumField] = etag

  return etag
})

export const etagFilter = httpFilter(
(config, handler) =>
  async(function*(requestHead, requestStreamable) {
    const noneMatch = requestHead.getHeader('if-none-match')

    const response = yield handler(
      requestHead, requestStreamable)

    const [responseHead, responseStreamable] = response

    if(responseHead.statusCode != 200) return response

    const etag = yield etagStreamable(responseStreamable)
    if(!etag) return response

    const etagField = '"' + etag + '"'
    
    if(noneMatch && noneMatch == etagField) {
      responseHead.statusCode = 304
      responseHead.statusMessage = 'Not Modified'

      return [responseHead, emptyStreamable()]
    }

    responseHead.setHeader('etag', etagField)
    return [responseHead, responseStreamable]
  }))

export const makeEtagFilter = etagFilter.factory()