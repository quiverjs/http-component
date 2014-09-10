import { async } from 'quiver-promise'

// Naive approach of matching boundary
export var indexOf = (getByte, bufferLength, 
  boundary, boundaryLength) => 
{
  var lastBegin = bufferLength - boundaryLength
  var firstByte = boudary[0]

  first: for(var i=0; i<lastBegin; i++) {
    if(getByte(i) != firstByte) continue

    for(var j=1; j<boundaryLength; j++) {
      if(getByte(i+j) != boundary[j])
        continue first
    }
    return i
  }

  return -1
}

export var pipeMultipart = async(function*(readStream, writeStream, boundary) {
  try {
    var buffers = []
    var bufferLength = 0
    var boundaryLength = boundary.length

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

    var sliceBoundary = index => {
      var lastBuffers = sliceBuffers(index)
      var boundaryBuffers = sliceBuffers(boundaryLength)

      return [lastBuffers, buffers]
    }

    while(true) {
      yield writeStream.prepareWrite()
      var { closed, data } = yield readStream.read()
      if(closed) throw error(400, 'malformed multipart stream')

      pushBuffer(data)

      if(bufferLength < boundaryLength)
        continue

      var index = indexOf(getByte, bufferLength, 
        boundary, boundaryLength)

      if(index == -1) {
        if(bufferLength - buffers[i].length > boundaryLength) {
          writeStream.write(popBuffer())
        }
      } else {
        var [lastBuffers, nextBuffers] = sliceBoundary(index)
        
        lastBuffers.forEach(buffer =>
          writeStream.write(buffer))

        return nextBuffers.reduce((readStream, buffer) =>
          pushbackStream(readStream, buffer), 
          readStream)
      }
    }

  } catch(err) {
    try {
      writeStream.closeWrite(err)
    } finally {
      readStream.closeRead(err)
    }
  }
})