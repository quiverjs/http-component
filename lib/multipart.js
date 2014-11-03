import { error } from 'quiver-error'
import { 
  async, createPromise, timeout 
} from 'quiver-promise'

import { 
  streamFilter,
  simpleHandlerLoader,
  inputHandlerMiddleware,
} from 'quiver-component'

import {
  pipeStream,
  streamToText,
  createChannel,
  pushbackStream,
  emptyStreamable,
  streamableToJson,
  streamableToText,
  streamToStreamable,
} from 'quiver-stream-util'

import {
  extractStreamHead
} from 'quiver-stream-component'

import { 
  parseSubheaders 
} from './header'

import { 
  extractAllMultipart 
} from './multipart-stream'

var multipartType = /^multipart\/form-data/

var parseBoundary = contentType => {
  var [, { boundary }] = parseSubheaders(contentType)
  if(!boundary) throw errror(400, 'no boundary specified')

  return boundary
}

var formatStreamable = streamable => {
  if(streamable.contentType == 'application/json') {
    return streamableToJson(streamable)
  } else {
    return streamableToText(streamable)
  }
}

var parseMultipartHeaders = headers => {
  var dispositionHeader = headers['content-disposition']

  if(!dispositionHeader) throw error(400, 
    'missing Content-Disposition header')

  var [disposition, dispositionHeaders] = parseSubheaders(
    dispositionHeader)

  var contentTypeHeader = headers['content-type']

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

var serializeMultipart = async(
function*(serializerHandler, readStream, boundary) {
  var formData = { }
  var serializedParts = {}

  var mixedPartHandler = name =>
  async(function*(headers, partStream) {
    var {
      disposition,
      dispositionHeaders,
      contentType,
      contentTypeHeaders
    } = parseMultipartHeaders(headers)

    if(disposition != 'file')
      throw error(400, 'Invalid Content-Disposition')

    var { filename } =  dispositionHeaders

    if(!filename)
      throw error(400, 'Missing upload file name')

    return serializerHandler({ 
      name, filename, contentType 
    }, partStream)
    .then(formatStreamable)
  })

  var handlePartStream = async(
  function*(headers, partStream) {
    var {
      disposition,
      dispositionHeaders,
      contentType,
      contentTypeHeaders
    } = parseMultipartHeaders(headers)

    if(disposition != 'form-data')
      throw error(400, 'Invalid Content-Disposition')

    var { name, filename } = dispositionHeaders

    if(!name)
      throw error(400, 'Missing name field in Content-Disposition')

    if(formData[name]) 
      throw error(400, 'duplicate multipart field')

    if(contentType=='multipart/mixed') {
      var boundary = contentTypeHeaders['boundary']

      if(!boundary)
        throw error(400, 'Missing multipart boundary')

      serializedParts[name] = yield extractAllMultipart(
        partStream, boundary, mixedPartHandler(name))

    } else {
      if(filename) {
        var serialized = yield serializerHandler(
          { name, filename, contentType }, partStream)
          .then(formatStreamable)

        var field = serializedParts[name]

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

export var multipartSerializeFilter = (serializerHandler) =>
  streamFilter((config, handler) => {
    var serializerHandler = config.serializerHandler

    return async(function*(args, streamable) {
      var { requestHead } = args
      var { contentType } = streamable

      if(!contentType || !multipartType.test(contentType))
      {
        return handler(args, streamable)
      }

      if(requestHead && requestHead.method != 'POST')
        throw error(405, 'Method Not Allowed')

      var boundary = parseBoundary(contentType)

      var readStream = yield streamable.toStream()

      var [ formData, serializedParts ]
        = yield serializeMultipart(
          serializerHandler, readStream, boundary)

      args.formData = formData
      args.serializedParts = serializedParts

      return handler(args, emptyStreamable())
    })
  })
  .addMiddleware(inputHandlerMiddleware(
    serializerHandler, 'serializerHandler', {
      loader: simpleHandlerLoader('stream', 'streamable')
    }))