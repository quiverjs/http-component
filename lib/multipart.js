import { error } from 'quiver-error'
import { 
  async, createPromise, timeout 
} from 'quiver-promise'

import { 
  streamFilter,
  simpleHandlerLoader,
  streamHandlerLoader,
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
  extractHttpHeaders, parseSubheaders 
} from './header.js'

import { handleMultipart } from './pipe-multipart.js'

var multipartType = /^multipart\/form-data/
var boundaryRegex = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i

var parseBoundary = contentType => {
  var [, { boundary }] = parseSubheaders(contentType)
  if(!boundary) throw errror(400, 'no boundary specified')

  var startBoundary = new Buffer('\r\n--' + boundary + '\r\n')
  var endBoundary = new Buffer('\r\n--' + boundary + '--\r\n')

  return [startBoundary, endBoundary]
}

var serializeMultipart = async(
function*(serializerHandler, readStream, boundaries) {
  var [startBoundary, endBoundary] = boundaries

  readStream = pushbackStream(readStream)

  var formData = { }
  var serializedStreams = []

  while(true) {
    var { closed } = yield readStream.peak()
    if(closed) return [formData, serializedStreams]

    var [, readStream] = yield extractStreamHead(
      readStream, startBoundary)

    var [headers, readStream] = yield extractHttpHeaders(
      readStream)

    var dispositionHeader = headers['content-disposition']
    if(!dispositionHeader) throw error(400, 
      'missing Content-Disposition header')

    var [disposition, { name, filename }] = parseSubheaders(
      dispositionHeader)

    if(disposition == 'form-data') {
      if(filename) {
        var [serialized, readStream] = yield handleMultipart(
          readStream, boundary, partStream => 
            serializerHandler({}, streamToStreamable(partStream))
            .then(streamableToJson))

        serializedStreams.push(serialized)

      } else {
        var [value, readStream] = yield handleMultipart(
          readStream, boundary, streamToText)

        if(name) {
          if(formData[name]) throw error(400, 
            'repeated multipart field')

          formData[name] = value
        } 
      }
    } else if(disposition == 'file') {
      throw error(501, 'Not Implemented')
    } else {
      throw error(400, 'Bad Content-Disposition')
    }
  }
})

export var multipartSerializeFilter = (serializeHandler) =>
  streamFilter((config, handler) => {
    var serializerHandler = config.serializerHandler

    return async(function*(args, streamable) {
      var { requestHead } = args
      var { contentType } = streamable
      console.log('filtering multipart', args, streamable)

      if(!contentType || !multipartType.test(contentType))
      {
        return handler(args, streamable)
      }

      if(requestHead && requestHead.method != 'POST')
        throw error(405, 'Method Not Allowed')

      var boundaries = parseBoundary(contentType)

      var readStream = yield streamable.toStream()

      var { formData, serialized } = 
        yield serializeMultipart(
          serializerHandler, readStream, contentType)

      args.formData = formData
      args.serializedStreams = serializedStreams

      return handler(args, emptyStreamable())
    })
  })
  .addMiddleware(inputHandlerMiddleware(
    serializeHandler, 'serializerHandler', {
      handlerLoader: streamHandlerLoader
    }))