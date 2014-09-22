import { async } from 'quiver-promise'
import { httpFilter } from 'quiver-component'
import { emptyStreamable } from 'quiver-stream-util'

import crypto from 'crypto'

var algorithm = 'sha1'
var checksumField = 'checksum-sha1'

var checksumBuffer = buffer =>
  crypto.createHash(algorithm)
    .update(buffer)
    .digest('hex')

var etagStreamable = async(function*(streamable) {
  if(streamable.etag) 
    return streamable.etag

  if(streamable[checksumField]) 
    return streamable[checksumField]

  if(!streamable.toBuffer) 
    return null

  var buffer = yield streamable.toBuffer()

  var etag = checksumBuffer(buffer)

  streamable.etag = etag
  streamable[checksumField] = etag

  return etag
})

export var etagFilter = httpFilter(
(config, handler) =>
  async(function*(requestHead, requestStreamable) {
    var noneMatch = requestHead.getHeader('if-none-match')

    var response = yield handler(
      requestHead, requestStreamable)

    var [responseHead, responseStreamable] = response

    if(responseHead.statusCode != 200) return response

    var etag = yield etagStreamable(responseStreamable)
    if(!etag) return response

    var etagField = '"' + etag + '"'
    
    if(noneMatch && noneMatch == etagField) {
      responseHead.statusCode = 304
      responseHead.statusMessage = 'Not Modified'

      return [responseHead, emptyStreamable()]
    }

    responseHead.setHeader('etag', etagField)
    return [responseHead, responseStreamable]
  }))