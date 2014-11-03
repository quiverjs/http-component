import 'traceur'

import { async } from 'quiver-promise'

import {
  streamToText,
  createChannel,
  buffersToStream,
} from 'quiver-stream-util'

import { 
  pipeMultipart, handleMultipart
} from '../lib/multipart-stream'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
var should = chai.should()

describe('multipart stream test', () => {
  it('simple boundary', async(function*() {
    var boundary = new Buffer('--boundary--')

    var testBoundary = async(
    function*(testBuffers, partContent, restContent) {
      var wholeStream = buffersToStream(testBuffers)

      var [partContent, restStream] = yield handleMultipart(
        wholeStream, boundary, streamToText)

      partContent.should.equal(partContent)

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