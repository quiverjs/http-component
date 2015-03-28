import { async } from 'quiver/promise'
import { RequestHead } from 'quiver/http'

import { 
  simpleHandler,
  loadHttpHandler
} from 'quiver/component'

import {
  textToStream,
  streamToText,
  emptyStreamable,
  buffersToStream,
  streamableToText,
  buffersToStreamable,
} from 'quiver/stream-util'

import {
  byteRangeStream,
  byteRangeFilter
} from '../lib/byte-range'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const should = chai.should()

describe('byte range test', () => {
  const testContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
  const expectedSlice = 'dolor sit amet'
  const start = 12
  const end = 26

  const testRangeStream = readStream => {
    const rangeStream = byteRangeStream(readStream, start, end)

    return streamToText(rangeStream)
      .should.eventually.equal(expectedSlice)
  }

  it('basic range test', async(function*() {
    yield testRangeStream(textToStream(testContent))

    // sliced buffers
    yield testRangeStream(buffersToStream([
      'Lorem ip', 'sum dol',
      'or sit a', 'met, consectetur',
      ' adipiscing elit.'
    ]))

    // exact start
    yield testRangeStream(buffersToStream([
      'Lorem ', 'ipsum ', 'dolor sit',
      ' amet, consec', 'tetur adipiscing elit.'
    ]))

    // exact end
    yield testRangeStream(buffersToStream([
      'Lorem ip', 'sum dol',
      'or sit ', 'amet',
      ', consectetur ', 'adipiscing elit.'
    ]))

    // exact start end
    yield testRangeStream(buffersToStream([
      'Lorem ', 'ipsum ', 'dolor sit',
      ' amet', ', consectetur ', 
      'adipiscing elit.'
    ]))

    // overflow
    yield testRangeStream(buffersToStream([
      'Lorem ', 'ipsum dolor sit amet, consec',
      'tetur adip', 'iscing elit.'
    ]))
  }))

  it('test range filter', async(function*() {
    const component = simpleHandler(
      args => {
        const streamable = buffersToStreamable([
          'Lorem ip', 'sum dol',
          'or sit a', 'met, consectetur',
          ' adipiscing elit.'
        ])

        streamable.contentLength = testContent.length
        return streamable
      }, 'void', 'streamable')
    .middleware(byteRangeFilter)
    .setLoader(loadHttpHandler)

    const handler = yield component.loadHandler({})

    let [responseHead, responseStreamable] = 
      yield handler(new RequestHead(), emptyStreamable())

    responseHead.statusCode.should.equal(200)

    responseHead.getHeader('content-length')
      .should.equal(''+testContent.length)

    should.not.exist(responseHead.getHeader(
      'accept-ranges'))

    yield streamableToText(responseStreamable)
      .should.eventually.equal(testContent)

    let requestHead = new RequestHead({
      headers: {
        range: 'bytes=' + start + '-' + (end-1)
      }
    })

    ;[responseHead, responseStreamable] = 
      yield handler(requestHead, emptyStreamable())

    responseHead.statusCode.should.equal(206)

    responseHead.getHeader('content-length')
      .should.equal(''+expectedSlice.length)

    responseHead.getHeader('content-range')
      .should.equal('bytes ' + start + '-' + 
        (end-1) + '/' + testContent.length)

    yield streamableToText(responseStreamable)
      .should.eventually.equal(expectedSlice)

    requestHead = new RequestHead({
      headers: {
        range: 'bytes=' + start + '-' + 
          (testContent.length+10)
      }
    })

    try {
      ;[responseHead, responseStreamable] = 
        yield handler(requestHead, emptyStreamable())

      throw new Error('should not reach')
    } catch(err) {
      err.errorCode.should.equal(416)
    }
  }))
})