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

import { formHandler } from './multipart.js'
import { byteRangeFilter } from '../lib/byte-range.js'

var rangeHandler = fileHandler()
  .addMiddleware(byteRangeFilter)

var main = router()
  .addStaticRoute(singleFileHandler(), '/form')
  .addStaticRoute(formHandler, '/submit')
  .addParamRoute(rangeHandler, '/range/:restpath')

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