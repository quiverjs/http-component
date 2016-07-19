import { extract } from 'quiver-core/util/immutable'
import { implement, overrideConfig } from 'quiver-core/component/method'
import { simpleHandler, streamToHttpHandler } from 'quiver-core/component/constructor'
import { checksumHandler } from 'quiver-stream-component'

import {
  multipartSerializeFilter
} from '../lib'

const serializerHandler = checksumHandler()
  ::overrideConfig({
    checksumAlgorithm: 'sha1'
  })

const multipartFilter = multipartSerializeFilter()

multipartFilter::implement({ serializerHandler })

export const formHandler = simpleHandler(
  args => {
    const {
      formData, serializedParts
    } = args::extract()

    return `
You have submitted the following form data:

${ JSON.stringify(formData) }

and your uploaded files have following SHA1 checksum:

${ JSON.stringify(serializedParts) }`

  }, {
    inputType: 'empty',
    outputType: 'text'
  })
  .addMiddleware(multipartFilter)
