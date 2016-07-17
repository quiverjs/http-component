import { error } from 'quiver-core/util/error'
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
export const createBufferQueue = boundaryLength => {
  const buffers = []
  let bufferLength = 0

  const getByte = (index) => {
    let currentIndex = 0

    for(let i=0; i<buffers.length; i++) {
      const buffer = buffers[i]
      const end = currentIndex + buffer.length
      if(end > index) {
        return buffer[index-currentIndex]
      } else {
        currentIndex = end
      }
    }

    throw new Error('out of range')
  }

  const pushBuffer = buffer => {
    if(!Buffer.isBuffer(buffer))
      buffer = new Buffer(buffer)

    buffers.push(buffer)
    bufferLength += buffer.length
  }

  const popBuffer = () => {
    const buffer = buffers.shift()
    bufferLength -= buffer.length
    return buffer
  }

  const unshiftBuffer = buffer => {
    buffers.unshift(buffer)
    bufferLength += buffer.length
  }

  const sliceBuffers = index => {
    const buffer = popBuffer()
    const length = buffer.length

    if(length == index)
      return [buffer]

    if(length < index)
      return [buffer, ...sliceBuffers(index-length)]

    if(length > index) {
      unshiftBuffer(buffer.slice(index))
      return [buffer.slice(0, index)]
    }
  }

  const canPop = () => {
    return ((bufferLength - buffers[0].length) > boundaryLength)
  }

  const indexOf = boundary =>  {
    const lastBegin = bufferLength - boundaryLength
    const firstByte = boundary[0]

    first: for(let i=0; i<=lastBegin; i++) {
      if(getByte(i) != firstByte) continue

      for(let j=1; j<boundaryLength; j++) {
        if(getByte(i+j) != boundary[j])
          continue first
      }
      return i
    }

    return -1
  }

  const sliceBoundary = index => {
    const lastBuffers = sliceBuffers(index)
    const boundaryBuffers = sliceBuffers(boundaryLength)

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

export const pipeMultipart = async (readStream, writeStream, boundary) => {
  try {
    if(!Buffer.isBuffer(boundary)) boundary = new Buffer(boundary)
    const boundaryLength = boundary.length

    const bufferQueue = createBufferQueue(boundaryLength)

    await writeStream.prepareWrite()

    while(true) {
      const { closed, data } = await readStream.read()
      if(closed) throw error(400, 'malformed multipart stream')

      bufferQueue.pushBuffer(data)

      if(bufferQueue.length < boundaryLength)
        continue

      const index = bufferQueue.indexOf(boundary)

      if(index == -1) {
        if(bufferQueue.canPop()) {
          writeStream.write(bufferQueue.popBuffer())
          await writeStream.prepareWrite()
        }
      } else {
        const [lastBuffers, nextBuffers] = bufferQueue.sliceBoundary(index)

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
}

export const handleMultipart = (wholeStream, boundary, partHandler) => {
  const {
    readStream: partStream,
    writeStream
  } = createChannel()

  const handlePart = async () => {
    try {
      return await partHandler(partStream)
    } catch(err) {
      partStream.closeRead(err)
      throw err
    }
  }

  return Promise.all([
    handlePart(),
    pipeMultipart(wholeStream, writeStream, boundary)
  ])
}

const newLineBuffer = new Buffer('\r\n')

export const extractMultipart = async (readStream, startBoundary, partHandler) => {
  let headers, partContent, endBuffer

  ;[headers, readStream] = await extractHttpHeaders(
    readStream)

  ;[partContent, readStream] = await handleMultipart(
    readStream, startBoundary, partStream =>
      partHandler(headers, partStream))

  ;[endBuffer, readStream] = await extractFixedStreamHead(
    readStream, 2)

  const ending = endBuffer.toString()

  if(ending == '--') {
    return [partContent, readStream, true]
  }

  if(ending != '\r\n') {
    readStream = pushbackStream(readStream, [endBuffer])

    const [headBuffer, readStream] = await extractStreamHead(
      readStream, newLineBuffer)

    const ending = headBuffer.toString().trim()
    if(ending != '')
      throw error(400, 'Bad Request')
  }

  return [partContent, readStream, false]
}

export const extractAllMultipart = async (readStream, boundary, partHandler) => {
  try {
    const parts = []

    const firstBoundary = new Buffer('--' + boundary + '\r\n')
    const startBoundary = new Buffer('\r\n--' + boundary)

    // eat the first boundary
    ;[head, readStream] = await extractStreamHead(
      readStream, firstBoundary)

    while(true) {
      let partContent, ended

      ;[partContent, readStream, ended]
        = await extractMultipart(readStream,
            startBoundary, partHandler)

      parts.push(partContent)
      if(ended) return parts
    }
  } catch(err) {
    readStream.closeRead(err)
    throw err
  }
}
