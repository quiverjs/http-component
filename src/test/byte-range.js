import test from 'tape'
import { asyncTest } from 'quiver-core/util/tape'

import { RequestHead } from 'quiver-core/http-head'
import { simpleHandler, streamToHttpHandler } from 'quiver-core/component/constructor'
import { createConfig, loadHandler, httpHandlerLoader } from 'quiver-core/component/util'

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

test('byte range test', assert => {
  const testContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
  const expectedSlice = 'dolor sit amet'
  const start = 12
  const end = 26

  const rangeEquals = async function(readStream) {
    const rangeStream = byteRangeStream(readStream, start, end)

    const textResult = await streamToText(rangeStream)
    this.equal(textResult, expectedSlice)
  }

  assert::asyncTest('basic range test', async assert => {
    await assert::rangeEquals(textToStream(testContent))

    // sliced buffers
    await assert::rangeEquals(buffersToStream([
      'Lorem ip', 'sum dol',
      'or sit a', 'met, consectetur',
      ' adipiscing elit.'
    ]))

    // exact start
    await assert::rangeEquals(buffersToStream([
      'Lorem ', 'ipsum ', 'dolor sit',
      ' amet, consec', 'tetur adipiscing elit.'
    ]))

    // exact end
    await assert::rangeEquals(buffersToStream([
      'Lorem ip', 'sum dol',
      'or sit ', 'amet',
      ', consectetur ', 'adipiscing elit.'
    ]))

    // exact start end
    await assert::rangeEquals(buffersToStream([
      'Lorem ', 'ipsum ', 'dolor sit',
      ' amet', ', consectetur ',
      'adipiscing elit.'
    ]))

    // overflow
    await assert::rangeEquals(buffersToStream([
      'Lorem ', 'ipsum dolor sit amet, consec',
      'tetur adip', 'iscing elit.'
    ]))

    assert.end()
  })

  assert::asyncTest('test range filter', async assert => {
    const component = streamToHttpHandler(simpleHandler(
      args => {
        const streamable = buffersToStreamable([
          'Lorem ip', 'sum dol',
          'or sit a', 'met, consectetur',
          ' adipiscing elit.'
        ])

        streamable.contentLength = testContent.length
        return streamable
      }, {
        inputType: 'empty',
        outputType: 'streamable'
      }))
    .addMiddleware(byteRangeFilter)
    .setLoader(httpHandlerLoader)

    const handler = await loadHandler(createConfig(), component)

    let [responseHead, responseStreamable] =
      await handler(new RequestHead(), emptyStreamable())

    assert.equal(responseHead.status, '200')

    assert.equal(
      responseHead.getHeader('content-length'),
      `${testContent.length}`)

    assert.notOk(responseHead.getHeader('accept-ranges'))

    assert.equal(await streamableToText(responseStreamable), testContent,
      'should receive full content')

    let requestHead = new RequestHead()
      .setHeader('range', `bytes=${start}-${end-1}`)

    ;[responseHead, responseStreamable] =
      await handler(requestHead, emptyStreamable())

    assert.equal(responseHead.status, '206')

    assert.equal(
      responseHead.getHeader('content-length'),
      `${expectedSlice.length}`)

    assert.equal(
      responseHead.getHeader('content-range'),
      `bytes ${start}-${end-1}/${testContent.length}`)

    assert.equal(
      await streamableToText(responseStreamable),
      expectedSlice)

    requestHead = new RequestHead()
      .setHeader('range', `bytes=${start}-${testContent.length+10}`)

    try {
      ;[responseHead, responseStreamable] =
        await handler(requestHead, emptyStreamable())

      throw new Error('should not reach')
    } catch(err) {
      assert.equal(err.code, 416)
    }

    assert.end()
  })
})
