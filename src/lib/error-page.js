import http from 'http'
import { ResponseHead } from 'quiver-core/http'
import { httpFilter } from 'quiver-core/component'
import { textToStreamable } from 'quiver-core/stream-util'

let statusTable = http.STATUS_CODES

export let basicErrorPageFilter = httpFilter(
(config, handler) => {
  let { env='development' } = config
  let devMode = env == 'development'

  return (requestHead, streamable) =>
    handler(requestHead, streamable)
    .catch(err => {
      let errorCode = err.errorCode || 500
      let statusMessage = statusTable[errorCode] || 'Unknown'

      let errorTrace = devMode ? 
        `<pre>${err.stack}</pre>` : ''

      let errorPage = 
`<h1>${errorCode} ${statusMessage}</h1>
${errorTrace}`

      let responseStreamable = textToStreamable(errorPage)

      let responseHead = new ResponseHead({
        statusCode: errorCode,
        headers: {
          'content-type': 'text/html',
          'content-length': ''+
            responseStreamable.contentLength
        }
      })

      return [responseHead, responseStreamable]
    })
})

export let makeBasicErrorPageFilter = basicErrorPageFilter
  .factory()