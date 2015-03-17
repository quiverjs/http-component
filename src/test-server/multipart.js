import {
  simpleHandler
} from 'quiver-core/component'

import {
  checksumHandler
} from 'quiver-stream-component'

import {
  multipartSerializeFilter
} from '../lib/http-component.js'

const serializerHandler = checksumHandler()
  .configOverride({
    checksumAlgorithm: 'sha1'
  })

const multipartFilter = multipartSerializeFilter()
  .implement({ serializerHandler })

export const formHandler = simpleHandler(
  args => {
    const {
      formData, serializedParts
    } = args

    return `
You have submitted the following form data:

${ JSON.stringify(formData) }

and your uploaded files have following SHA1 checksum:

${ JSON.stringify(serializedParts) }`

  }, 'void', 'text')
  .middleware(multipartFilter)