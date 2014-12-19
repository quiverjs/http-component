import { error } from 'quiver-core/error'
import { async } from 'quiver-core/promise'
import { 
  createChannel, pushbackStream 
} from 'quiver-core/stream-util'

import {
  extractStreamHead, extractFixedStreamHead
} from 'quiver-stream-component'

import { 
  extractHttpHeaders, 
} from './header'

// Naive approach of matching boundary
// TODO: Implement Boyer–Moore string search algorithm
export 

var createBufferQueue = boundaryLength => {
  var buffers = []
  var bufferLength = 0

  var getByte = (index) => {
    var currentIndex = 0
    for(var i=0; i<buffers.length; i++) {
      var buffer = buffers[i]
      var end = currentIndex + buffer.length
      if(end > index) {
        return buffer[index-currentIndex]
      } else {
        currentIndex = end
      }
    }

    throw new Error('out of range')
  }

  var pushBuffer = buffer => {
    if(!Buffer.isBuffer(buffer)) 
      buffer = new Buffer(buffer)

    buffers.push(buffer)
    bufferLength += buffer.length
  }

  var popBuffer = () => {
    var buffer = buffers.shift()
    bufferLength -= buffer.length
    return buffer
  }

  var unshiftBuffer = buffer => {
    buffers.unshift(buffer)
    bufferLength += buffer.length
  }

  var sliceBuffers = index => {
    var buffer = popBuffer()
    var length = buffer.length

    if(length == index)
      return [buffer]

    if(length < index)
      return [buffer, ...sliceBuffers(index-length)]

    if(length > index) {
      unshiftBuffer(buffer.slice(index))
      return [buffer.slice(0, index)]
    }
  }

  var canPop = () => {
    return ((bufferLength - buffers[0].length) > boundaryLength)
  }

  var indexOf = boundary =>  {
    var lastBegin = bufferLength - boundaryLength
    var firstByte = boundary[0]

    first: for(var i=0; i<=lastBegin; i++) {
      if(getByte(i) != firstByte) continue

      for(var j=1; j<boundaryLength; j++) {
        if(getByte(i+j) != boundary[j])
          continue first
      }
      return i
    }

    return -1
  }

  var sliceBoundary = index => {
    var lastBuffers = sliceBuffers(index)
    var boundaryBuffers = sliceBuffers(boundaryLength)

    return [lastBuffers, buffers]
  }

  return {
    getByte, pushBuffer, popBuffer, unshiftBuffer,
    sliceBuffers, sliceBoundary, canPop, indexOf,

    get length() {
      return bufferLength
    }
  }
}

export var pipeMultipart = async(
function*(readStream, writeStream, boundary) {
  try {
    if(!Buffer.isBuffer(boundary)) boundary = new Buffer(boundary)
    var boundaryLength = boundary.length

    var bufferQueue = createBufferQueue(boundaryLength)

    yield writeStream.prepareWrite()

    while(true) {
      var { closed, data } = yield readStream.read()
      if(closed) throw error(400, 'malformed multipart stream')

      bufferQueue.pushBuffer(data)

      if(bufferQueue.length < boundaryLength)
        continue

      var index = bufferQueue.indexOf(boundary)

      if(index == -1) {
        if(bufferQueue.canPop()) {
          writeStream.write(bufferQueue.popBuffer())
          yield writeStream.prepareWrite()
        }
      } else {
        var [lastBuffers, nextBuffers] = bufferQueue.sliceBoundary(index)

        lastBuffers.forEach(buffer =>
          writeStream.write(buffer))

        writeStream.closeWrite()
        readStream = pushbackStream(readStream, nextBuffers)

        return readStream
      }
    }
  } catch(err) {
    try {
      writeStream.closeWrite(err)
    } finally {
      readStream.closeRead(err)
    }

    throw err
  }
})

export var handleMultipart = (wholeStream, boundary, partHandler) => {
  var {
    readStream: partStream, 
    writeStream
  } = createChannel()

  var handlePart = async(function*() {
    try {
      return yield partHandler(partStream)
    } catch(err) {
      partStream.closeRead(err)
      throw err
    }
  })

  return Promise.all([
    handlePart(),
    pipeMultipart(wholeStream, writeStream, boundary)
  ])
}

var newLineBuffer = new Buffer('\r\n')

export var extractMultipart = async(
function*(readStream, startBoundary, partHandler) {
  var [headers, readStream] = yield extractHttpHeaders(
    readStream)

  var [partContent, readStream] = yield handleMultipart(
    readStream, startBoundary, partStream =>
      partHandler(headers, partStream))

  var [endBuffer, readStream] = yield extractFixedStreamHead(
    readStream, 2)

  var ending = endBuffer.toString()

  if(ending == '--') {
    return [partContent, readStream, true]
  }

  if(ending != '\r\n') {
    readStream = pushbackStream(readStream, [endBuffer])

    var [headBuffer, readStream] = yield extractStreamHead(
      readStream, newLineBuffer)

    var ending = headBuffer.toString().trim()
    if(ending != '')
      throw error(400, 'Bad Request')
  }

  return [partContent, readStream, false]
})

export var extractAllMultipart = async(
function*(readStream, boundary, partHandler) {
  try {
    var parts = []

    var firstBoundary = new Buffer('--' + boundary + '\r\n')
    var startBoundary = new Buffer('\r\n--' + boundary)

    // eat the first boundary
    var [head, readStream] = yield extractStreamHead(
      readStream, firstBoundary)

    while(true) {
      var [partContent, readStream, ended] 
        = yield extractMultipart(readStream, 
            startBoundary, partHandler)

      parts.push(partContent)
      if(ended) return parts
    }
  } catch(err) {
    readStream.closeRead(err)
    throw err
  }
})