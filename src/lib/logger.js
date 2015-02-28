import fs from 'fs'
import { httpFilter } from 'quiver-core/component'
import { async, promisify } from 'quiver-core/promise'
import { nodeToQuiverWriteStream } from 'quiver-core/stream-util'

let commonLogFormatter = info => {
  let {
    requestHead,
    responseHead,
    responseTime='-'
  } = info

  let { 
    url='/',
    method = 'GET',
    httpVersion = '1.1',
    headers: requestHeaders
  } = requestHead

  let { 
    userId = '-',
    clientAddress = '-',
  } = requestHead.args

  let {
    statusCode = 200,
    headers: responseHeaders
  } = responseHead

  let referer = requestHeaders['referer'] || 
    requestHeaders['referrer'] || '-'

  let contentLength = responseHeaders['content-length'] || '-'

  let userAgent = responseHeaders['user-agent'] || '-'

  let date = new Date().toUTCString()

  return `${clientAddress} - ${userId} [${date}] "${method} ${url} HTTP/${httpVersion}" ${statusCode} ${responseTime}`
}

export let requestLoggerFilter = httpFilter(
(config, handler) => {
  let { 
    logFile,
    logFormatter=commonLogFormatter 
  } = config
  
  let nodeWriteStream = logFile ? 
    fs.createWriteStream(logFile) : process.stdout

  let writeStream = nodeToQuiverWriteStream(nodeWriteStream)

  return async(function*(requestHead, requestStreamable) {
    let startTime = process.hrtime()

    let response = yield handler(requestHead, requestStreamable)
    let [responseHead] = response

    let diff = process.hrtime(startTime)
    let responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3)

    let log = logFormatter({
      requestHead, 
      responseHead,
      responseTime
    })

    writeStream.write(log + '\n')

    return response
  })
})

export let makeRequestLoggerFilter = requestLoggerFilter.factory()