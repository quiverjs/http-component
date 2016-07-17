import test from 'tape'
import { asyncTest } from 'quiver-core/util/tape'

import { RequestHead } from 'quiver-core/http-head'

import { simpleHandler } from 'quiver-core/component/constructor'

import {
  createConfig, httpHandlerLoader, loadHandler
} from 'quiver-core/component/util'

import {
  emptyStreamable, buffersToStream, streamableToText
} from 'quiver-core/stream-util'

import {
  chunkedResponseFilter
} from '../lib/chunked'

test('chunked http filter test', assert => {
  assert::asyncTest('basic chunked test', async assert => {
    const testBuffers = [
      'hello',
      'javascript definitely rocks'
    ]

    const testChunkedContent = '5\r\nhello\r\n' +
        '1b\r\njavascript definitely rocks\r\n' +
        '0\r\n\r\n'

    const component = simpleHandler(
      args => buffersToStream(testBuffers),
      {
        inputType: 'empty',
        outputType: 'stream'
      })
    .addMiddleware(chunkedResponseFilter)
    .setLoader(httpHandlerLoader)

    const handler = await loadHandler(createConfig(), component)

    const [responseHead, responseStreamable] =
      await handler(new RequestHead(), emptyStreamable())

    assert.equal(
      responseHead.getHeader('transfer-encoding'),
      'chunked')

    assert.equal(
      await streamableToText(responseStreamable),
      testChunkedContent)
  })

  assert::asyncTest('skip when content-length set', async assert => {
    const testContent = 'Hello World'

    const component = simpleHandler(
      args => testContent,
      {
        inputType: 'empty',
        outputType: 'text'
      })
    .addMiddleware(chunkedResponseFilter)
    .setLoader(httpHandlerLoader)

    const handler = await loadHandler(createConfig(), component)

    const [responseHead, responseStreamable] =
      await handler(new RequestHead(), emptyStreamable())

    assert.notOk(responseHead.getHeader('transfer-encoding'))

    assert.equal(
      responseHead.getHeader('content-length'),
      `${testContent.length}`)

    assert.equal(
      await streamableToText(responseStreamable),
      testContent)

    assert.end()
  })
})
