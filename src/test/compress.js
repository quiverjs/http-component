import test from 'tape'
import { asyncTest, rejected } from 'quiver-core/util/tape'

import fs from 'fs'
import zlib from 'zlib'
import { promisify } from 'quiver-core/util/promise'
import { RequestHead } from 'quiver-core/http-head'

import { simpleHandler, streamToHttpHandler } from 'quiver-core/component/constructor'

import {
  createConfig, httpHandlerLoader, loadHandler
} from 'quiver-core/component/util'

import {
  emptyStreamable,
  streamableToText,
  streamableToBuffer,
} from 'quiver-core/stream-util'

import {
  httpCompressFilter,
  selectAcceptEncoding
} from '../lib/compress'

const gzip = promisify(zlib.gzip)

const testContent = fs.readFileSync(
  'test-content/ipsum.txt').toString()

test('http compress test', assert => {
  assert.test('accept-encoding test', assert => {
    assert.equal(selectAcceptEncoding('gzip'), 'gzip')
    assert.equal(selectAcceptEncoding('identity'), 'identity')
    assert.equal(selectAcceptEncoding('gzip;q=0'), 'identity')
    assert.equal(selectAcceptEncoding('*'), 'gzip')
    assert.equal(selectAcceptEncoding('gzip, *;q=0'), 'gzip')
    assert.equal(selectAcceptEncoding('identity;q=0.5, *;q=0'), 'identity')
    assert.equal(selectAcceptEncoding('identity;q=0, *'), 'gzip')
    assert.equal(selectAcceptEncoding('gzip;q=0, *;q=1.0'), 'identity')

    assert.throws(() =>
      selectAcceptEncoding('identity;q=0')
    )

    assert.throws(() =>
      selectAcceptEncoding('*;q=0')
    )

    assert.end()
  })

  assert::asyncTest('basic test', async assert => {
    const compressed = await gzip(testContent)

    const component = streamToHttpHandler(simpleHandler(
      args => testContent,
      {
        inputType: 'empty',
        outputType: 'text'
      }))
    .addMiddleware(httpCompressFilter)
    .setLoader(httpHandlerLoader)

    const handler = await loadHandler(createConfig(), component)

    let [responseHead, responseStreamable] =
      await handler(new RequestHead(), emptyStreamable())

    assert.notOk(responseHead.getHeader('content-encoding'))

    assert.equal(
      await streamableToText(responseStreamable),
      testContent)

    let requestHead = new RequestHead()
      .setHeader('accept-encoding', 'gzip')

    ;[responseHead, responseStreamable] =
      await handler(requestHead, emptyStreamable())

    assert.equal(responseHead.getHeader('content-encoding'), 'gzip',
      'response should be gzip compressed')

    const buffer = await streamableToBuffer(responseStreamable)

    assert.equal(Buffer.compare(
      buffer, compressed), 0)

    requestHead = new RequestHead()
      .setHeader('accept-encoding', 'gzip;q=0, identity;q=0.5, *;q=0')

    ;[responseHead, responseStreamable] =
      await handler(requestHead, emptyStreamable())

    assert.notOk(responseHead.getHeader('content-encoding'))

    assert.equal(
      await streamableToText(responseStreamable),
      testContent)

    requestHead = new RequestHead()
      .setHeader('accept-encoding', 'identity;q=0')

    await assert::rejected(handler(requestHead, emptyStreamable()))

    assert.end()
  })
})
