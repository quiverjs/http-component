import http from 'http'
import { ResponseHead } from 'quiver-core/http-head'
import { errorToStatusCode } from 'quiver-util/error'
import { textToStreamable } from 'quiver-core/stream-util'
import { httpFilter } from 'quiver-core/component/constructor'

const statusTable = http.STATUS_CODES

export const basicErrorPageFilter = httpFilter(
(config, handler) => {
  const { env='development' } = config
  const devMode = env === 'development'

  return (requestHead, streamable) =>
    handler(requestHead, streamable)
    .catch(err => {
      const statusCode = errorToStatusCode(err)
      const statusMessage = statusTable[statusCode] || 'Unknown'
      const errorMessage = err.message || ''

      const errorTrace = devMode ?
        `${err.stack}` : ''

      const errorPage = `<!doctype html>
<html>
  <body>
    <h1>${statusCode} ${statusMessage}</h1>
    <p>${errorMessage}</p>
    <code>${errorTrace}</code>
  </body>
</html>`

      const responseStreamable = textToStreamable(errorPage)

      const responseHead = new ResponseHead()
        .setStatus(statusCode)
        .setHeader('content-type', 'text/html')
        .setHeader('content-length', `${responseStreamable.contentLength}`)

      return [responseHead, responseStreamable]
    })
})

export const makeBasicErrorPageFilter = basicErrorPageFilter.export()
