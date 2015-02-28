import { error } from 'quiver-core/error'
import { 
  async, createPromise, timeout 
} from 'quiver-core/promise'

import { 
  streamFilter,
  abstractHandler,
  simpleHandlerLoader,
  inputHandlerMiddleware,
} from 'quiver-core/component'

import {
  pipeStream,
  streamToText,
  createChannel,
  pushbackStream,
  emptyStreamable,
  streamableToJson,
  streamableToText,
  streamToStreamable,
} from 'quiver-core/stream-util'

import {
  extractStreamHead
} from 'quiver-stream-component'

import { 
  parseSubheaders 
} from './header'

import { 
  extractAllMultipart 
} from './multipart-stream'

let multipartType = /^multipart\/form-data/

let parseBoundary = contentType => {
  let [, { boundary }] = parseSubheaders(contentType)
  if(!boundary) throw errror(400, 'no boundary specified')

  return boundary
}

let formatStreamable = streamable => {
  if(streamable.contentType == 'application/json') {
    return streamableToJson(streamable)
  } else {
    return streamableToText(streamable)
  }
}

let parseMultipartHeaders = headers => {
  let dispositionHeader = headers['content-disposition']

  if(!dispositionHeader) throw error(400, 
    'missing Content-Disposition header')

  let [disposition, dispositionHeaders] = parseSubheaders(
    dispositionHeader)

  let contentTypeHeader = headers['content-type']

  if(contentTypeHeader) {
    var [contentType, contentTypeHeaders] = parseSubheaders(
      contentTypeHeader)

  } else {
    var contentType = 'text/plain'
    var contentTypeHeaders = {}
  }

  return {
    disposition,
    dispositionHeaders,
    contentType,
    contentTypeHeaders
  }
}

let serializeMultipart = async(
function*(serializerHandler, readStream, boundary) {
  let formData = { }
  let serializedParts = {}

  let mixedPartHandler = name =>
  async(function*(headers, partStream) {
    let {
      disposition,
      dispositionHeaders,
      contentType,
      contentTypeHeaders
    } = parseMultipartHeaders(headers)

    if(disposition != 'file')
      throw error(400, 'Invalid Content-Disposition')

    let { filename } =  dispositionHeaders

    if(!filename)
      throw error(400, 'Missing upload file name')

    return serializerHandler({ 
      name, filename, contentType 
    }, partStream)
    .then(formatStreamable)
  })

  let handlePartStream = async(
  function*(headers, partStream) {
    let {
      disposition,
      dispositionHeaders,
      contentType,
      contentTypeHeaders
    } = parseMultipartHeaders(headers)

    if(disposition != 'form-data')
      throw error(400, 'Invalid Content-Disposition')

    let { name, filename } = dispositionHeaders

    if(!name)
      throw error(400, 'Missing name field in Content-Disposition')

    if(formData[name]) 
      throw error(400, 'duplicate multipart field')

    if(contentType=='multipart/mixed') {
      let boundary = contentTypeHeaders['boundary']

      if(!boundary)
        throw error(400, 'Missing multipart boundary')

      serializedParts[name] = yield extractAllMultipart(
        partStream, boundary, mixedPartHandler(name))

    } else {
      if(filename) {
        let serialized = yield serializerHandler(
          { name, filename, contentType }, partStream)
          .then(formatStreamable)

        let field = serializedParts[name]

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

let serializerHandler = abstractHandler('serializerHandler')
  .setLoader(simpleHandlerLoader('stream', 'streamable'))

export let multipartSerializeFilter =
streamFilter((config, handler) => {
  let { serializerHandler } = config

  return async(function*(args, streamable) {
    let { requestHead } = args
    let { contentType } = streamable

    if(!contentType || !multipartType.test(contentType))
    {
      return handler(args, streamable)
    }

    if(requestHead && requestHead.method != 'POST')
      throw error(405, 'Method Not Allowed')

    let boundary = parseBoundary(contentType)

    let readStream = yield streamable.toStream()

    let [ formData, serializedParts ]
      = yield serializeMultipart(
        serializerHandler, readStream, boundary)

    args.formData = formData
    args.serializedParts = serializedParts

    return handler(args, emptyStreamable())
  })
})
.inputHandlers({ serializerHandler })

export let makeMultipartSerializeFilter = 
  multipartSerializeFilter.factory()