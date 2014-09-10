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
  createChannel,
  emptyStreamable,
  streamableToJson,
  streamToStreamable,
} from 'quiver-stream-util'

import {
  extractStreamHead
} from 'quiver-stream-component'

import { pipeMultipart } from './pipe-multipart.js'
import { extractHttpHeaders } from './header.js'

var multipartType = /^multipart\/form-data/
var boundaryRegex = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i

var parseBoundary = contentType => {
  var matches = boundaryRegex.exec(contentType)
  var boundary = matches[1] || matches[2]
  if(!boundary) throw errror(400, 'no boundary specified')

  var startBoundary = new Buffer('--' + boundary)
  var endBoundary = new Buffer('--' + boundary + '--')

  return [startBoundary, endBoundary]
}

var handlePartStream = 
(serializerHandler, readStream, boundary) => {
  var {
    readStream: partStream,
    writeStream
  } = createChannel()

  var p1 = pipeMultipart(readStream, writeStream, boundary)
  var p2 = serializeHandler({}, partStream)
    .then(streamableToJson)

  return Promise.all([p1, p2])
}

var serializeMultipart = async(
function*(serializerHandler, readStream, boundaries) {
  var [startBoundary, endBoundary] = boundaries

  while(true) {
    var [, readStream] = yield extractStreamHead(
      readStream, startBoundary)

    var [headers, readStream] = yield extractHttpHeaders(
      readStream)

    var [readStream, serialized] = yield handlePartStream(
      serializerHandler, readStream, endBoundary)
  }
})

export var multipartSerializeFilter = (serializeHandler) => {
  return streamFilter((config, handler) => {
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
}