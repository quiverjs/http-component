import { error } from 'quiver-core/error'
import { streamFilter } from 'quiver-core/component'
import { async, reject } from 'quiver-core/promise'
import { 
  streamableToText,
  emptyStreamable
} from 'quiver-core/stream-util'

import querystring from 'querystring'
const { parse: parseQuery } = querystring

const streamableToFormData = streamable =>
  streamableToText(streamable).then(parseQuery)

export const formDataFilter = streamFilter(
(config, handler) =>
  (args, streamable) => {
    if(args.requestHead && args.requestHead.method != 'POST')
      return reject(error(405, 'Method Not Allowed'))

    const { contentType } = streamable
    if(contentType && contentType != 
      'application/x-www-form-urlencoded')
    {
      return handler(args, streamable)
    }

    return streamableToFormData(streamable)
    .then(formData => {
      args.formData = formData

      return handler(args, emptyStreamable())
    })
  })

export const makeFormDataFilter = formDataFilter.factory()