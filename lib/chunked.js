import { async } from 'quiver-promise'
import { httpFilter } from 'quiver-component'
import { streamToStreamable } from 'quiver-stream-util'
import { streamToChunkedStream } from 'quiver-stream-component'

export var chunkedResponseFilter = httpFilter(
(config, handler) =>
  async(function*(requestHead, requestStreamable) {
    var response = yield handler(
      requestHead, requestStreamable)

    var [responseHead, responseStreamable] = response

    if(responseHead.getHeader('content-length') ||
       responseHead.getHeader('transfer-encoding'))
    {
      return response
    }

    var readStream = yield responseStreamable.toStream()
    var chunkedStream = streamToChunkedStream(readStream)
    var chunkedStreamable = streamToStreamable(chunkedStream)

    responseHead.setHeader('transfer-encoding', 'chunked')

    return [responseHead, chunkedStreamable]
  }))

export var makeChunkedResponseFilter = 
  chunkedResponseFilter.privatizedConstructor()