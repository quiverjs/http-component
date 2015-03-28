import { error } from 'quiver/error'
import { 
  async, createPromise, timeout 
} from 'quiver/promise'

import { 
  streamFilter,
  abstractHandler,
  simpleHandlerLoader,
  inputHandlerMiddleware,
} from 'quiver/component'

import {
  pipeStream,
  streamToText,
  createChannel,
  pushbackStream,
  emptyStreamable,
  streamableToJson,
  streamableToText,
  streamToStreamable,
} from 'quiver/stream-util'

import {
  extractStreamHead
} from 'quiver-stream-component'

import { 
  parseSubheaders 
} from './header'

import { 
  extractAllMultipart 
} from './multipart-stream'

const multipartType = /^multipart\/form-data/

const parseBoundary = contentType => {
  const [, { boundary }] = parseSubheaders(contentType)
  if(!boundary) throw errror(400, 'no boundary specified')

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
    ;([contentType, contentTypeHeaders]) = parseSubheaders(
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

const serializeMultipart = async(
function*(serializerHandler, readStream, boundary) {
  const formData = { }
  const serializedParts = {}

  const mixedPartHandler = name =>
  async(function*(headers, partStream) {
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
  })

  const handlePartStream = async(
  function*(headers, partStream) {
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

      serializedParts[name] = yield extractAllMultipart(
        partStream, boundary, mixedPartHandler(name))

    } else {
      if(filename) {
        const serialized = yield serializerHandler(
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
        formData[name] = yield streamToText(partStream)
      }
    }
  })

  yield extractAllMultipart(readStream, 
    boundary, handlePartStream)

  return [formData, serializedParts]
})

const serializerHandler = abstractHandler('serializerHandler')
  .setLoader(simpleHandlerLoader('stream', 'streamable'))

export const multipartSerializeFilter =
streamFilter((config, handler) => {
  const { serializerHandler } = config

  return async(function*(args, streamable) {
    const { requestHead } = args
    const { contentType } = streamable

    if(!contentType || !multipartType.test(contentType))
    {
      return handler(args, streamable)
    }

    if(requestHead && requestHead.method != 'POST')
      throw error(405, 'Method Not Allowed')

    const boundary = parseBoundary(contentType)

    const readStream = yield streamable.toStream()

    const [ formData, serializedParts ]
      = yield serializeMultipart(
        serializerHandler, readStream, boundary)

    args.formData = formData
    args.serializedParts = serializedParts

    return handler(args, emptyStreamable())
  })
})
.inputHandlers({ serializerHandler })

export const makeMultipartSerializeFilter = 
  multipartSerializeFilter.factory()