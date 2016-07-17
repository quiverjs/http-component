import { httpFilter } from 'quiver-core/component/constructor'
import {
  closeStreamable, emptyStreamable
} from 'quiver-core/stream-util'

export const headRequestFilter = httpFilter(
(config, handler) =>
  async (requestHead, requestStreamable) => {
    const { method='GET' } = requestHead

    if(method != 'HEAD') return handler(
      requestHead, requestStreamable)

    const inRequestHead = requestHead.setMethod('GET')

    const response = await handler(inRequestHead, requestStreamable)

    const [responseHead, responseStreamable] = response

    closeStreamable(responseStreamable)

    return [responseHead, emptyStreamable()]
  })

export const makeHeadRequestFilter = headRequestFilter.export()
