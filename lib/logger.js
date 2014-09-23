import fs from 'fs'
import { httpFilter } from 'quiver-component'
import { async, promisify } from 'quiver-promise'
import { nodeToQuiverWriteStream } from 'quiver-stream-util'

var commonLogFormatter = info => {
  var {
    requestHead,
    responseHead,
    responseTime='-'
  } = info

  var { 
    url='/',
    method = 'GET',
    httpVersion = '1.1',
    headers: requestHeaders
  } = requestHead

  var { 
    userId = '-',
    clientAddress = '-',
  } = requestHead.args

  var {
    statusCode = 200,
    headers: responseHeaders
  } = responseHead

  var referer = requestHeaders['referer'] || 
    requestHeaders['referrer'] || '-'

  var contentLength = responseHeaders['content-length'] || '-'

  var userAgent = responseHeaders['user-agent'] || '-'

  var date = new Date().toUTCString()

  return `${clientAddress} - ${userId} [${date}] "${method} ${url} HTTP/${httpVersion}" ${statusCode} ${responseTime}`
}

var requestLoggerFilter = (logFormatter=commonLogFormatter) =>
  httpFilter((config, handler) => {
    var { logFile } = config
    
    var nodeWriteStream = logFile ? 
      fs.createWriteStream(logFile) : process.stdout

    var writeStream = nodeToQuiverWriteStream(nodeWriteStream)

    return async(function*(requestHead, requestStreamable) {
      var startTime = process.hrtime()

      var response = yield handler(requestHead, requestStreamable)
      var [responseHead] = response

      var diff = process.hrtime(startTime)
      var requestTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3)

      var log = logFormatter({
        requestHead, 
        responseHead,
        requestTime
      })

      writeStream.write(log + '\n')

      return response
    })
  })