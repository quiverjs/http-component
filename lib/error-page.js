import http from 'http'
import { ResponseHead } from 'quiver-http'
import { httpFilter } from 'quiver-component'
import { textToStreamable } from 'quiver-stream-util'

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

      var responseHead = new ResponseHead({
        statusCode: errorCode
      })

      var responseStreamable = textToStreamable(errorPage)

      return [responseHead, responseStreamable]
    })
})

export var makeBasicErrorPageFilter = basicErrorPageFilter
  .privatizedConstructor()