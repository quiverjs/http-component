import { httpFilter } from 'quiver/component'
import { 
  closeStreamable,
  emptyStreamable
} from 'quiver/stream-util'

export const headRequestFilter = httpFilter(
(config, handler) =>
  (requestHead, requestStreamable) => {
    const { method='GET' } = requestHead

    if(method != 'HEAD') return handler(
      requestHead, requestStreamable)

    requestHead.method = 'GET'

    return handler(requestHead, requestStreamable)
    .then(([responseHead, responseStreamable]) => {
      // Set method back to HEAD for upstream middleware
      requestHead.method = 'HEAD'
      
      closeStreamable(responseStreamable)

      return [responseHead, emptyStreamable()]
    })
  })

export const makeHeadRequestFilter = 
  headRequestFilter.factory()