import http from 'http'
import { ResponseHead } from 'quiver-core/http'
import { httpFilter } from 'quiver-core/component'
import { textToStreamable } from 'quiver-core/stream-util'

var statusTable = http.STATUS_CODES

export var basicErrorPageFilter = httpFilter(
(config, handler) => {
  var { env='development' } = config
  var devMode = env == 'development'

  return (requestHead, streamable) =>
    handler(requestHead, streamable)
    .catch(err => {
      var errorCode = err.errorCode || 500
      var statusMessage = statusTable[errorCode] || 'Unknown'

      var errorTrace = devMode ? 
        `<pre>${err.stack}</pre>` : ''

      var errorPage = 
`<h1>${errorCode} ${statusMessage}</h1>
${errorTrace}`

      var responseStreamable = textToStreamable(errorPage)

      var responseHead = new ResponseHead({
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

export var makeBasicErrorPageFilter = basicErrorPageFilter
  .factory()