import {
  simpleHandler
} from 'quiver-core/component'

import {
  checksumHandler
} from 'quiver-stream-component'

import {
  multipartSerializeFilter
} from '../lib/http-component.js'

var serializerHandler = checksumHandler()
  .configOverride({
    checksumAlgorithm: 'sha1'
  })

var multipartFilter = multipartSerializeFilter()
  .implement({ serializerHandler })

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
  .middleware(multipartFilter)