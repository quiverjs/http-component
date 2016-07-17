import { startServer } from 'quiver-core/http'

import { createConfig } from 'quiver-core/component/util'
import { router, simpleHandler } from 'quiver-core/component/constructor'
import { fileHandler, singleFileHandler } from 'quiver-file-component/constructor'

import { buffersToStream } from 'quiver-core/stream-util'

import {
  byteRangeFilter,
  requestLoggerFilter,
  httpCompressFilter,
  headRequestFilter,
  chunkedResponseFilter,
  basicErrorPageFilter
} from '../lib'

import { formHandler } from './multipart.js'
import { adminHandler } from './auth.js'

const rangeHandler = fileHandler()
  .addMiddleware(byteRangeFilter())

const compressHandler = fileHandler()
  .addMiddleware(httpCompressFilter())

const chunkHandler = simpleHandler(
  args =>
    buffersToStream([
      'Hello world. ',
      'This content is chunked ',
      'manually in Quiver.'
    ])
  , {
    inputType: 'empty',
    outputType: 'stream'
  })
  .addMiddleware(chunkedResponseFilter())

const main = router()
  .addStaticRoute('/form', singleFileHandler())
  .addStaticRoute('/submit', formHandler)
  .addStaticRoute('/admin', adminHandler)
  .addParamRoute('/chunk', chunkHandler)
  .addParamRoute('/range/:restpath', rangeHandler)
  .addParamRoute('/compress/:restpath', compressHandler)
  .addMiddleware(headRequestFilter())
  .addMiddleware(basicErrorPageFilter())
  .addMiddleware(requestLoggerFilter())

const config = createConfig({
  dirPath: 'test-content',
  filePath: 'test-content/form.html'
})

startServer(config, main)
.then(server => {
  console.log('HTTP test server running at port 8080...')
})
.catch(err => {
  console.log('error starting server:', err.stack)
})
