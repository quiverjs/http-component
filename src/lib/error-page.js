import http from 'http'
import { ResponseHead } from 'quiver-core/http-head'
import { httpFilter } from 'quiver-core/component/constructor'
import { textToStreamable } from 'quiver-core/stream-util'

const statusTable = http.STATUS_CODES

export const basicErrorPageFilter = httpFilter(
(config, handler) => {
  const { env='development' } = config
  const devMode = env === 'development'

  return (requestHead, streamable) =>
    handler(requestHead, streamable)
    .catch(err => {
      const errorCode = err.code || 500
      const statusMessage = statusTable[errorCode] || 'Unknown'

      const errorTrace = devMode ?
        `<pre>${err.stack}</pre>` : ''

      const errorPage =
`<h1>${errorCode} ${statusMessage}</h1>
${errorTrace}`

      const responseStreamable = textToStreamable(errorPage)

      const responseHead = new ResponseHead({
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

export const makeBasicErrorPageFilter = basicErrorPageFilter.export()
