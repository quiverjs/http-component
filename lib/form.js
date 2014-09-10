import { error } from 'quiver-error'
import { streamFilter } from 'quiver-component'
import { async, reject } from 'quiver-promise'
import { 
  streamableToText,
  emptyStreamable
} from 'quiver-stream-util'

import querystring from 'querystring'
var { parse: parseQuery } = querystring

var streamableToFormData = streamable =>
  streamableToText(streamable).then(parseQuery)

export var formDataFilter = streamFilter(
(config, handler) =>
  (args, streamable) => {
    if(args.requestHead && args.requestHead.method != 'POST')
      return reject(error(405, 'Method Not Allowed'))

    var { contentType } = streamable
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