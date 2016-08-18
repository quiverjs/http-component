import fs from 'fs'
import { extract } from 'quiver-core/util/immutable'
import { httpFilter } from 'quiver-core/component/constructor'
import { nodeToQuiverWriteStream } from 'quiver-core/stream-util'

const commonLogFormatter = info => {
  const {
    requestHead,
    responseHead,
    responseTime='-'
  } = info

  const {
    path='/',
    method = 'GET',
    httpVersion = '1.1',
  } = requestHead

  const {
    userId = '-',
    clientAddress = '-',
  } = requestHead.args

  const statusCode = responseHead.status || 200

  const referer = requestHead.getHeader('referer') ||
    requestHead.getHeader('referrer') || '-'

  const contentLength = responseHead.getHeader('content-length') || '-'

  const userAgent = responseHead.getHeader('user-agent') || '-'

  const date = new Date().toUTCString()

  return `${clientAddress} - ${userId} [${date}] "${method} ${path} HTTP/${httpVersion}" ${statusCode} ${responseTime}`
}

export const requestLoggerFilter = httpFilter(
(config, handler) => {
  const {
    logFile,
    logFormatter=commonLogFormatter
  } = config::extract()

  const nodeWriteStream = logFile ?
    fs.createWriteStream(logFile) : process.stdout

  const writeStream = nodeToQuiverWriteStream(nodeWriteStream)

  return async (requestHead, requestStreamable) => {
    const startTime = process.hrtime()

    const response = await handler(requestHead, requestStreamable)
    const [responseHead] = response

    const diff = process.hrtime(startTime)
    const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3)

    const log = logFormatter({
      requestHead,
      responseHead,
      responseTime
    })

    writeStream.write(log + '\n')

    return response
  }
})

export const makeRequestLoggerFilter = requestLoggerFilter.export()
