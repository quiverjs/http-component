import { error } from 'quiver-error'
import { 
  async, createPromise, timeout 
} from 'quiver-promise'

import { 
  streamFilter,
  loadStreamHandler,
  inputHandlerMiddleware,
} from 'quiver-component'

import {
  pipeStream,
  streamToText,
  createChannel,
  pushbackStream,
  emptyStreamable,
  streamableToJson,
  streamToStreamable,
} from 'quiver-stream-util'

import {
  extractStreamHead
} from 'quiver-stream-component'

import { 
  parseSubheaders 
} from './header.js'

import { 
  extractMultipart 
} from './pipe-multipart.js'

var multipartType = /^multipart\/form-data/
var boundaryRegex = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i

var parseBoundary = contentType => {
  var [, { boundary }] = parseSubheaders(contentType)
  if(!boundary) throw errror(400, 'no boundary specified')

  return boundary
}

var parseMultipartHeaders = headers => {
  var dispositionHeader = headers['content-disposition']

  if(!dispositionHeader) throw error(400, 
    'missing Content-Disposition header')

  var [disposition, dispositionHeaders] = parseSubheaders(
    dispositionHeader)

  if(disposition != 'form-data')
    throw error(400, 'Invalid Content-Disposition')

  var contentTypeHeader = headers['content-type'] || 'text/plain'

  var [contentType, contentTypeHeaders] = parseSubheaders(
    contentTypeHeader)

  return {
    disposition,
    dispositionHeaders,
    contentType,
    contentTypeHeaders
  }
}

var serializeMultipart = async(
function*(serializerHandler, readStream, boundary) {
  var beginBoundary = new Buffer('\r\n--' + boundary + '\r\n')
  var startBoundary = new Buffer('\r\n--' + boundary)

  var formData = { }
  var serializedParts = {}

  var [head, readStream] = yield extractStreamHead(
    readStream, beginBoundary)

  try {
    while(true) {
      var [, readStream, ended] = yield extractMultipart(
        readStream, startBoundary, async(
        function*(headers, partStream) {
          var {
            dispositionHeaders,
            contentType,
            contentTypeHeaders
          } = parseMultipartHeaders(headers)

          var { name, filename } = dispositionHeaders

          if(!name)
            throw error(400, 'Missing name field in Content-Disposition')

          if(formData[name]) 
            throw error(400, 'duplicate multipart field')

          if(contentType=='multipart/mixed') {
            throw error(501, 'Not Implemented')

          } else {
            if(filename) {
              var serialized = yield serializerHandler(
                { name, filename }, 
                streamToStreamable(partStream))
                .then(streamableToJson)

              serializedParts[name] = serialized

            } else {
              formData[name] = yield streamToText(partStream)
            }
          }
        }))

      if(ended) {
        readStream.closeRead()
        return [formData, serializedParts]
      }

    }
  } catch(err) {
    readStream.closeRead(err)
    throw err
  }
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
      loader: loadStreamHandler
    }))