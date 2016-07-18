import { httpFilter } from 'quiver-core/component/constructor'
import { streamToStreamable } from 'quiver-core/stream-util'
import { streamToChunkedStream } from 'quiver-stream-component'

export const chunkedResponseFilter = httpFilter(
  (config, handler) =>
    async (requestHead, requestStreamable) => {
      const response = await handler(
        requestHead, requestStreamable)

      let [responseHead, responseStreamable] = response

      if(responseHead.getHeader('content-length') ||
         responseHead.getHeader('transfer-encoding'))
      {
        return response
      }

      const readStream = await responseStreamable.toStream()
      const chunkedStream = streamToChunkedStream(readStream)
      const chunkedStreamable = streamToStreamable(chunkedStream)

      responseHead = responseHead.setHeader('transfer-encoding', 'chunked')

      return [responseHead, chunkedStreamable]
    })

export const makeChunkedResponseFilter =
  chunkedResponseFilter.export()
