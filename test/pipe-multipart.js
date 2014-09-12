import 'traceur'

import { async } from 'quiver-promise'

import {
  streamToText,
  createChannel,
  buffersToStream,
} from 'quiver-stream-util'

import { 
  pipeMultipart, handleMultipart
} from '../lib/pipe-multipart.js'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
var should = chai.should()

describe('pipe multipart test', () => {
  it('simple boundary', async(function*() {
    var boundary = new Buffer('--boundary--')

    var testBoundary = async(function*(testBuffers) {
      var wholeStream = buffersToStream(testBuffers)

      var [partContent, restStream] = yield handleMultipart(
        wholeStream, boundary, streamToText)

      partContent.should.equal('hello')

      yield streamToText(restStream)
        .should.eventually.equal('goodbye')
    })

    yield testBoundary([
      'hello',
      '--boundary--',
      'goodbye'
    ])

    yield testBoundary([
      'hello--b',
      'oundar',
      'y--goodbye'
    ])

    yield testBoundary([
      'he', 'll',
      'o--boundary--g',
      'ood', 'bye'
    ])

    yield testBoundary([
      'he', 'll',
      'o--b', 'oun', 'dary--g',
      'ood', 'bye'
    ])
  }))
})