import { error } from 'quiver-error'
import { async } from 'quiver-promise'
import { 
  createChannel, pushbackStream 
} from 'quiver-stream-util'

// Naive approach of matching boundary
export var indexOf = (getByte, bufferLength, 
  boundary, boundaryLength) => 
{
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

  var sliceBoundary = index => {
    var lastBuffers = sliceBuffers(index)
    var boundaryBuffers = sliceBuffers(boundaryLength)

    return [lastBuffers, buffers]
  }

  return {
    getByte, pushBuffer, popBuffer, unshiftBuffer,
    sliceBuffers, sliceBoundary, canPop,

    get length() {
      return bufferLength
    }
  }
}

export var pipeMultipart = async(function*(readStream, writeStream, boundary) {
  try {
    if(!Buffer.isBuffer(boundary)) boundary = new Buffer(boundary)
    var boundaryLength = boundary.length

    var bufferQueue = createBufferQueue(boundaryLength)

    while(true) {
      // yield writeStream.prepareWrite()
      var { closed, data } = yield readStream.read()
      if(closed) throw error(400, 'malformed multipart stream')

      bufferQueue.pushBuffer(data)

      if(bufferQueue.length < boundaryLength)
        continue

      var index = indexOf(
        bufferQueue.getByte, bufferQueue.length, 
        boundary, boundaryLength)

      if(index == -1) {
        if(bufferQueue.canPop()) {
          writeStream.write(bufferQueue.popBuffer())
        }
      } else {
        var [lastBuffers, nextBuffers] = bufferQueue.sliceBoundary(index)
        
        lastBuffers.forEach(buffer =>
          writeStream.write(buffer))

        writeStream.closeWrite()

        return pushbackStream(readStream, nextBuffers)
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