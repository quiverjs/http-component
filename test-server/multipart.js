import {
  simpleHandler
} from 'quiver-component'

import {
  checksumHandler
} from 'quiver-stream-component'

import {
  multipartSerializeFilter
} from '../lib/multipart.js'

export var formHandler = simpleHandler(
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