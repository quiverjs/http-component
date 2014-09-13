import 'traceur'

import { startServer } from 'quiver-http'

import {
  router,
  simpleHandler
} from 'quiver-component'

import {
  singleFileHandler
} from 'quiver-file-component'

import {
  checksumHandler
} from 'quiver-stream-component'

import {
  multipartSerializeFilter
} from '../lib/multipart.js'

var handleForm = simpleHandler(
  args => {
    var {
      formData, serializedParts
    } = args

    return `
You have submitted the following form data:

${ JSON.stringify(formData) }

and your uploaded files have following SHA1 checksum:

${ JSON.stringify(serializedParts) }`

  }, 'void', 'text')
.addMiddleware(multipartSerializeFilter(
  checksumHandler('sha1')))

var main = router()
  .addStaticRoute(singleFileHandler(), '/')
  .addStaticRoute(handleForm, '/submit')

var config = {
  filePath: './test-content/form.html'
}

startServer(main, config)
.then(server => {
  console.log('Multipart form server running at port 8080...')
})
.catch(err => {
  console.log('error starting server:', err.stack)
})