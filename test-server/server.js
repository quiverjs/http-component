import 'traceur'

import { startServer } from 'quiver-http'

import {
  router,
  simpleHandler
} from 'quiver-component'

import {
  fileHandler,
  singleFileHandler
} from 'quiver-file-component'

import {
  buffersToStream
} from 'quiver-stream-util'

import {
  byteRangeFilter,
  requestLoggerFilter,
  httpCompressFilter,
  chunkedResponseFilter
} from '../lib/http-component.js'

import { formHandler } from './multipart.js'
import { authHandler } from './auth.js'

var rangeHandler = fileHandler()
  .addMiddleware(byteRangeFilter())

var compressHandler = fileHandler()
  .addMiddleware(httpCompressFilter())

var chunkHandler = simpleHandler(
  args => 
    buffersToStream([
      'Hello world. ',
      'This content is chunked ',
      'manually in Quiver.'
    ]),
  'void', 'stream')
  .addMiddleware(chunkedResponseFilter())

var main = router()
  .addStaticRoute(singleFileHandler(), '/form')
  .addStaticRoute(formHandler, '/submit')
  .addStaticRoute(authHandler, '/auth')
  .addParamRoute(chunkHandler, '/chunk')
  .addParamRoute(rangeHandler, '/range/:restpath')
  .addParamRoute(compressHandler, '/compress/:restpath')
  .addMiddleware(requestLoggerFilter())

var config = {
  dirPath: 'test-content',
  filePath: 'test-content/form.html'
}

startServer(main, config)
.then(server => {
  console.log('HTTP test server running at port 8080...')
})
.catch(err => {
  console.log('error starting server:', err.stack)
})