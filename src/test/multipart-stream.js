import { async } from 'quiver-core/promise'

import {
  streamToText,
  createChannel,
  buffersToStream,
} from 'quiver-core/stream-util'

import { 
  pipeMultipart, handleMultipart
} from '../lib/multipart-stream'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const should = chai.should()

describe('multipart stream test', () => {
  it('simple boundary', async(function*() {
    const boundary = new Buffer('--boundary--')

    const testBoundary = async(
    function*(testBuffers, expectedContent, restContent) {
      const wholeStream = buffersToStream(testBuffers)

      const [partContent, restStream] = yield handleMultipart(
        wholeStream, boundary, streamToText)

      partContent.should.equal(expectedContent)

      yield streamToText(restStream)
        .should.eventually.equal(restContent)
    })

    yield testBoundary([
      'hello',
      '--boundary--',
      'goodbye'
    ], 'hello', 'goodbye')

    yield testBoundary([
      'hello--b',
      'oundar',
      'y--goodbye'
    ], 'hello', 'goodbye')

    yield testBoundary([
      'he', 'll',
      'o--boundary--g',
      'ood', 'bye'
    ], 'hello', 'goodbye')

    yield testBoundary([
      'he', 'll',
      'o--b', 'oun', 'dary--g',
      'ood', 'bye'
    ], 'hello', 'goodbye')

    yield testBoundary([
      '--boundary--',
      'goodbye'
    ], '', 'goodbye')

    yield testBoundary([
      '--b', 'oundar', 'y--go',
      'odbye'
    ], '', 'goodbye')

    yield testBoundary([
      'hello',
      '--boundary--',
    ], 'hello', '')
    
    yield testBoundary([
      'hel',
      'lo--b', 'ound', 'ary--',
    ], 'hello', '')
  }))
})