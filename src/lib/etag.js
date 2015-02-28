import { async } from 'quiver-core/promise'
import { httpFilter } from 'quiver-core/component'
import { emptyStreamable } from 'quiver-core/stream-util'

import crypto from 'crypto'

let algorithm = 'sha1'
let checksumField = 'checksum-sha1'

let checksumBuffer = buffer =>
  crypto.createHash(algorithm)
    .update(buffer)
    .digest('hex')

let etagStreamable = async(function*(streamable) {
  if(streamable.etag) 
    return streamable.etag

  if(streamable[checksumField]) 
    return streamable[checksumField]

  if(!streamable.toBuffer) 
    return null

  let buffer = yield streamable.toBuffer()

  let etag = checksumBuffer(buffer)

  streamable.etag = etag
  streamable[checksumField] = etag

  return etag
})

export let etagFilter = httpFilter(
(config, handler) =>
  async(function*(requestHead, requestStreamable) {
    let noneMatch = requestHead.getHeader('if-none-match')

    let response = yield handler(
      requestHead, requestStreamable)

    let [responseHead, responseStreamable] = response

    if(responseHead.statusCode != 200) return response

    let etag = yield etagStreamable(responseStreamable)
    if(!etag) return response

    let etagField = '"' + etag + '"'
    
    if(noneMatch && noneMatch == etagField) {
      responseHead.statusCode = 304
      responseHead.statusMessage = 'Not Modified'

      return [responseHead, emptyStreamable()]
    }

    responseHead.setHeader('etag', etagField)
    return [responseHead, responseStreamable]
  }))

export let makeEtagFilter = etagFilter.factory()