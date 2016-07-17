import { error } from 'quiver-core/util/error'
import { streamFilter } from 'quiver-core/component/constructor'
import {
  streamableToText, emptyStreamable
} from 'quiver-core/stream-util'

import { parse as parseQuery }  from 'querystring'

const streamableToFormData = streamable =>
  streamableToText(streamable).then(parseQuery)

export const formDataFilter = streamFilter(
(config, handler) =>
  async (args, streamable) => {
    const requestHead = args.get('requestHead')
    if(requestHead && requestHead.method != 'POST')
      throw error(405, 'Method Not Allowed')

    const { contentType } = streamable
    if(contentType && contentType !=
      'application/x-www-form-urlencoded')
    {
      return handler(args, streamable)
    }

    const formData = await streamableToFormData(streamable)

    const inArgs = args.set('formData', formData)

    return handler(inArgs, emptyStreamable())
  })

export const makeFormDataFilter = formDataFilter.export()
