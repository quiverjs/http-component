import { async } from 'quiver-core/promise'
import { RequestHead } from 'quiver-core/http'

import { 
  simpleHandler,
  loadHttpHandler
} from 'quiver-core/component'

import {
  textToStream,
  streamToText,
  emptyStreamable,
  buffersToStream,
  streamableToText,
  buffersToStreamable,
} from 'quiver-core/stream-util'

import {
  chunkedResponseFilter
} from '../lib/chunked'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const should = chai.should()

describe('chunked http filter test', () => {
  it('basic chunked test', async(function*() {
    const testBuffers = [
      'hello',
      'javascript definitely rocks'
    ]

    const testChunkedContent = '5\r\nhello\r\n' +
        '1b\r\njavascript definitely rocks\r\n' +
        '0\r\n\r\n'

    const component = simpleHandler(
      args => buffersToStream(testBuffers),
      'void', 'stream')
    .middleware(chunkedResponseFilter)
    .setLoader(loadHttpHandler)

    const handler = yield component.loadHandler({})

    const [responseHead, responseStreamable] =
      yield handler(new RequestHead(), emptyStreamable())

    responseHead.getHeader('transfer-encoding')
      .should.equal('chunked')

    yield streamableToText(responseStreamable)
      .should.eventually.equal(testChunkedContent)
  }))

  it('skip when content-length set', async(function*() {
    const testContent = 'Hello World'

    const component = simpleHandler(
      args => testContent,
      'void', 'text')
    .middleware(chunkedResponseFilter)
    .setLoader(loadHttpHandler)

    const handler = yield component.loadHandler({})

    const [responseHead, responseStreamable] =
      yield handler(new RequestHead(), emptyStreamable())

    should.not.exist(responseHead.getHeader(
      'transfer-encoding'))

    responseHead.getHeader('content-length')
      .should.equal(''+testContent.length)

    yield streamableToText(responseStreamable)
      .should.eventually.equal(testContent)
  }))
})