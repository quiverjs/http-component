import { async } from 'quiver/promise'
import { httpFilter } from 'quiver/component'
import { streamToStreamable } from 'quiver/stream-util'
import { streamToChunkedStream } from 'quiver-stream-component'

export const chunkedResponseFilter = httpFilter(
(config, handler) =>
  async(function*(requestHead, requestStreamable) {
    const response = yield handler(
      requestHead, requestStreamable)

    const [responseHead, responseStreamable] = response

    if(responseHead.getHeader('content-length') ||
       responseHead.getHeader('transfer-encoding'))
    {
      return response
    }

    const readStream = yield responseStreamable.toStream()
    const chunkedStream = streamToChunkedStream(readStream)
    const chunkedStreamable = streamToStreamable(chunkedStream)

    responseHead.setHeader('transfer-encoding', 'chunked')

    return [responseHead, chunkedStreamable]
  }))

export const makeChunkedResponseFilter = 
  chunkedResponseFilter.factory()