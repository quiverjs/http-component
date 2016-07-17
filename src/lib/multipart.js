import { error } from 'quiver-core/util/error'
import {
  streamFilter,
  abstractHandler,
} from 'quiver-core/component/constructor'

import { inputHandlers } from 'quiver-core/component/method'
import { simpleHandlerLoader } from 'quiver-core/component/util'

import {
  streamToText,
  emptyStreamable,
  streamableToJson,
  streamableToText,
} from 'quiver-core/stream-util'

import {
  parseSubheaders
} from './header'

import {
  extractAllMultipart
} from './multipart-stream'

const multipartType = /^multipart\/form-data/

const parseBoundary = contentType => {
  const [, { boundary }] = parseSubheaders(contentType)
  if(!boundary) throw error(400, 'no boundary specified')

  return boundary
}

const formatStreamable = streamable => {
  if(streamable.contentType == 'application/json') {
    return streamableToJson(streamable)
  } else {
    return streamableToText(streamable)
  }
}

const parseMultipartHeaders = headers => {
  const dispositionHeader = headers['content-disposition']

  if(!dispositionHeader) throw error(400,
    'missing Content-Disposition header')

  const [disposition, dispositionHeaders] = parseSubheaders(
    dispositionHeader)

  const contentTypeHeader = headers['content-type']

  let contentType, contentTypeHeaders

  if(contentTypeHeader) {
    ;[contentType, contentTypeHeaders] = parseSubheaders(
      contentTypeHeader)

  } else {
    contentType = 'text/plain'
    contentTypeHeaders = {}
  }

  return {
    disposition,
    dispositionHeaders,
    contentType,
    contentTypeHeaders
  }
}

const serializeMultipart = async (serializerHandler, readStream, boundary) => {
  const formData = { }
  const serializedParts = {}

  const mixedPartHandler = name =>
  async (headers, partStream) => {
    const {
      disposition,
      dispositionHeaders,
      contentType,
      contentTypeHeaders
    } = parseMultipartHeaders(headers)

    if(disposition != 'file')
      throw error(400, 'Invalid Content-Disposition')

    const { filename } =  dispositionHeaders

    if(!filename)
      throw error(400, 'Missing upload file name')

    return serializerHandler({
      name, filename, contentType
    }, partStream)
    .then(formatStreamable)
  }

  const handlePartStream = async (headers, partStream) => {
    const {
      disposition,
      dispositionHeaders,
      contentType,
      contentTypeHeaders
    } = parseMultipartHeaders(headers)

    if(disposition != 'form-data')
      throw error(400, 'Invalid Content-Disposition')

    const { name, filename } = dispositionHeaders

    if(!name)
      throw error(400, 'Missing name field in Content-Disposition')

    if(formData[name])
      throw error(400, 'duplicate multipart field')

    if(contentType=='multipart/mixed') {
      const boundary = contentTypeHeaders['boundary']

      if(!boundary)
        throw error(400, 'Missing multipart boundary')

      serializedParts[name] = await extractAllMultipart(
        partStream, boundary, mixedPartHandler(name))

    } else {
      if(filename) {
        const serialized = await serializerHandler(
          { name, filename, contentType }, partStream)
          .then(formatStreamable)

        const field = serializedParts[name]

        if(!field) {
          serializedParts[name] = serialized
        } else if(Array.isArray(field)) {
          field.push(serialized)
        } else {
          serializedParts[name] = [field, serialized]
        }

      } else {
        formData[name] = await streamToText(partStream)
      }
    }
  }

  await extractAllMultipart(readStream,
    boundary, handlePartStream)

  return [formData, serializedParts]
}

const serializerHandler = abstractHandler('serializerHandler')
  .setLoader(simpleHandlerLoader('stream', 'streamable'))

export const multipartSerializeFilter = streamFilter((config, handler) => {
  const serializerHandler = config.get('serializerHandler')

  return async (args, streamable) => {
    const requestHead = args.get('requestHead')
    const { contentType } = streamable

    if(!contentType || !multipartType.test(contentType))
    {
      return handler(args, streamable)
    }

    if(requestHead && requestHead.method != 'POST')
      throw error(405, 'Method Not Allowed')

    const boundary = parseBoundary(contentType)

    const readStream = await streamable.toStream()

    const [ formData, serializedParts ]
      = await serializeMultipart(
        serializerHandler, readStream, boundary)

    const inArgs = args
      .set('formData', formData)
      .set('serializedParts', serializedParts)

    return handler(inArgs, emptyStreamable())
  }
})
::inputHandlers({ serializerHandler })

export const makeMultipartSerializeFilter =
  multipartSerializeFilter.export()
