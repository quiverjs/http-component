import 'quiver-core/traceur'

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
  byteRangeStream,
  byteRangeFilter
} from '../lib/byte-range'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
let should = chai.should()

describe('byte range test', () => {
  let testContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
  let expectedSlice = 'dolor sit amet'
  let start = 12
  let end = 26

  let testRangeStream = readStream => {
    let rangeStream = byteRangeStream(readStream, start, end)

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
    let component = simpleHandler(
      args => {
        let streamable = buffersToStreamable([
          'Lorem ip', 'sum dol',
          'or sit a', 'met, consectetur',
          ' adipiscing elit.'
        ])

        streamable.contentLength = testContent.length
        return streamable
      }, 'void', 'streamable')
    .middleware(byteRangeFilter)
    .setLoader(loadHttpHandler)

    let handler = yield component.loadHandler({})

    var [responseHead, responseStreamable] = 
      yield handler(new RequestHead(), emptyStreamable())

    responseHead.statusCode.should.equal(200)

    responseHead.getHeader('content-length')
      .should.equal(''+testContent.length)

    should.not.exist(responseHead.getHeader(
      'accept-ranges'))

    yield streamableToText(responseStreamable)
      .should.eventually.equal(testContent)

    var requestHead = new RequestHead({
      headers: {
        range: 'bytes=' + start + '-' + (end-1)
      }
    })

    var [responseHead, responseStreamable] = 
      yield handler(requestHead, emptyStreamable())

    responseHead.statusCode.should.equal(206)

    responseHead.getHeader('content-length')
      .should.equal(''+expectedSlice.length)

    responseHead.getHeader('content-range')
      .should.equal('bytes ' + start + '-' + 
        (end-1) + '/' + testContent.length)

    yield streamableToText(responseStreamable)
      .should.eventually.equal(expectedSlice)

    var requestHead = new RequestHead({
      headers: {
        range: 'bytes=' + start + '-' + 
          (testContent.length+10)
      }
    })

    try {
      var [responseHead, responseStreamable] = 
        yield handler(requestHead, emptyStreamable())

      throw new Error('should not reach')
    } catch(err) {
      err.errorCode.should.equal(416)
    }
  }))
})