import { httpFilter } from 'quiver-core/component'
import { 
  closeStreamable,
  emptyStreamable
} from 'quiver-core/stream-util'

export let headRequestFilter = httpFilter(
(config, handler) =>
  (requestHead, requestStreamable) => {
    let { method='GET' } = requestHead

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

export let makeHeadRequestFilter = 
  headRequestFilter.factory()