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
  extractHttpHeaders, parseSubheaders 
} from './header.js'

import { handleMultipart } from './pipe-multipart.js'

var multipartType = /^multipart\/form-data/
var boundaryRegex = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i

var parseBoundary = contentType => {
  var [, { boundary }] = parseSubheaders(contentType)
  if(!boundary) throw errror(400, 'no boundary specified')

  return boundary
}

var newLine = new Buffer('\r\n')

var endBoundary = async(function*(readStream) {
  var [headBuffer, readStream] = yield extractStreamHead(
    readStream, newLine)

  var ending = headBuffer.toString().trim()

  if(ending == '') return [false, readStream]
  if(ending = '--') return [true, readStream]

  throw error(400, 'Bad Request')
})

var serializeMultipart = async(
function*(serializerHandler, readStream, boundary) {
  readStream = pushbackStream(readStream)

  var startBoundary = new Buffer('\r\n--' + boundary)

  var formData = { }
  var serializedStreams = []

  console.log('extracting stream head')
  var [head, readStream] = yield extractStreamHead(
    readStream, startBoundary)
  console.log('head:', head.toString())

  try {
    while(true) {
      var [ended, readStream] = yield endBoundary(readStream)
      if(ended) return [formData, serializedStreams]

      console.log('extracting headers')
      var [headers, readStream] = yield extractHttpHeaders(
        readStream)

      console.log('handling multipart stream', headers)

      var dispositionHeader = headers['content-disposition']
      if(!dispositionHeader) throw error(400, 
        'missing Content-Disposition header')

      var [disposition, { name, filename }] = parseSubheaders(
        dispositionHeader)

      console.log('disposition:', disposition, name, filename)

      if(disposition == 'form-data') {
        if(filename) {
          console.log('streaming multipart file', filename)
          
          var [serialized, readStream] = yield handleMultipart(
            readStream, startBoundary, partStream => 
              serializerHandler({}, streamToStreamable(partStream))
                .then(streamableToJson))

          console.log('serialized result:', serialized)

          serializedStreams.push(serialized)

        } else {
          var [value, readStream] = yield handleMultipart(
            readStream, startBoundary, streamToText)

          console.log('multipart form:', name, value)

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
      //console.log('filtering multipart', args, streamable)

      if(!contentType || !multipartType.test(contentType))
      {
        return handler(args, streamable)
      }

      if(requestHead && requestHead.method != 'POST')
        throw error(405, 'Method Not Allowed')

      var boundary = parseBoundary(contentType)
      console.log('boundary:', boundary)

      var readStream = yield streamable.toStream()

      var [ formData, serializedStreams ]
        = yield serializeMultipart(
          serializerHandler, readStream, boundary)

      args.formData = formData
      args.serializedStreams = serializedStreams

      return handler(args, emptyStreamable())
    })
  })
  .addMiddleware(inputHandlerMiddleware(
    serializerHandler, 'serializerHandler', {
      loader: loadStreamHandler
    }))