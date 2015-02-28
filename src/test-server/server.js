import 'quiver-core/traceur'

import { startServer } from 'quiver-core/http'

import {
  router,
  simpleHandler
} from 'quiver-core/component'

import {
  fileHandler,
  singleFileHandler
} from 'quiver-file-component'

import {
  buffersToStream
} from 'quiver-core/stream-util'

import {
  byteRangeFilter,
  requestLoggerFilter,
  httpCompressFilter,
  headRequestFilter,
  chunkedResponseFilter,
  basicErrorPageFilter
} from '../lib/http-component.js'

import { formHandler } from './multipart.js'
import { adminHandler } from './auth.js'

let rangeHandler = fileHandler()
  .addMiddleware(byteRangeFilter())

let compressHandler = fileHandler()
  .addMiddleware(httpCompressFilter())

let chunkHandler = simpleHandler(
  args => 
    buffersToStream([
      'Hello world. ',
      'This content is chunked ',
      'manually in Quiver.'
    ]),
  'void', 'stream')
  .addMiddleware(chunkedResponseFilter())

let main = router()
  .staticRoute('/form', singleFileHandler())
  .staticRoute('/submit', formHandler)
  .staticRoute('/admin', adminHandler)
  .paramRoute('/chunk', chunkHandler)
  .paramRoute('/range/:restpath', rangeHandler)
  .paramRoute('/compress/:restpath', compressHandler)
  .middleware(headRequestFilter())
  .middleware(basicErrorPageFilter())
  .middleware(requestLoggerFilter())

let config = {
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