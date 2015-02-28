import { async } from 'quiver-core/promise'
import { httpFilter } from 'quiver-core/component'
import { streamToStreamable } from 'quiver-core/stream-util'
import { streamToChunkedStream } from 'quiver-stream-component'

export let chunkedResponseFilter = httpFilter(
(config, handler) =>
  async(function*(requestHead, requestStreamable) {
    let response = yield handler(
      requestHead, requestStreamable)

    let [responseHead, responseStreamable] = response

    if(responseHead.getHeader('content-length') ||
       responseHead.getHeader('transfer-encoding'))
    {
      return response
    }

    let readStream = yield responseStreamable.toStream()
    let chunkedStream = streamToChunkedStream(readStream)
    let chunkedStreamable = streamToStreamable(chunkedStream)

    responseHead.setHeader('transfer-encoding', 'chunked')

    return [responseHead, chunkedStreamable]
  }))

export let makeChunkedResponseFilter = 
  chunkedResponseFilter.factory()