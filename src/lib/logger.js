import fs from 'fs'
import { httpFilter } from 'quiver-core/component'
import { async, promisify } from 'quiver-core/promise'
import { nodeToQuiverWriteStream } from 'quiver-core/stream-util'

const commonLogFormatter = info => {
  const {
    requestHead,
    responseHead,
    responseTime='-'
  } = info

  const { 
    url='/',
    method = 'GET',
    httpVersion = '1.1',
    headers: requestHeaders
  } = requestHead

  const { 
    userId = '-',
    clientAddress = '-',
  } = requestHead.args

  const {
    statusCode = 200,
    headers: responseHeaders
  } = responseHead

  const referer = requestHeaders['referer'] || 
    requestHeaders['referrer'] || '-'

  const contentLength = responseHeaders['content-length'] || '-'

  const userAgent = responseHeaders['user-agent'] || '-'

  const date = new Date().toUTCString()

  return `${clientAddress} - ${userId} [${date}] "${method} ${url} HTTP/${httpVersion}" ${statusCode} ${responseTime}`
}

export const requestLoggerFilter = httpFilter(
(config, handler) => {
  const { 
    logFile,
    logFormatter=commonLogFormatter 
  } = config
  
  const nodeWriteStream = logFile ? 
    fs.createWriteStream(logFile) : process.stdout

  const writeStream = nodeToQuiverWriteStream(nodeWriteStream)

  return async(function*(requestHead, requestStreamable) {
    const startTime = process.hrtime()

    const response = yield handler(requestHead, requestStreamable)
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
  })
})

export const makeRequestLoggerFilter = requestLoggerFilter.factory()