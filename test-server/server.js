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

import { formHandler } from './multipart.js'
import { byteRangeFilter } from '../lib/byte-range.js'
import { httpCompressFilter } from '../lib/compress.js'

import { chunkedResponseFilter } from '../lib/chunked.js'

var rangeHandler = fileHandler()
  .addMiddleware(byteRangeFilter)

var compressHandler = fileHandler()
  .addMiddleware(httpCompressFilter)

var chunkHandler = simpleHandler(
  args => 
    buffersToStream([
      'Hello world. ',
      'This content is chunked ',
      'manually in Quiver.'
    ]),
  'void', 'stream')
  .addMiddleware(chunkedResponseFilter)

var main = router()
  .addStaticRoute(singleFileHandler(), '/form')
  .addStaticRoute(formHandler, '/submit')
  .addParamRoute(chunkHandler, '/chunk')
  .addParamRoute(rangeHandler, '/range/:restpath')
  .addParamRoute(compressHandler, '/compress/:restpath')

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