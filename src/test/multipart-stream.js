import test from 'tape'
import { asyncTest } from 'quiver-core/util/tape'

import {
  streamToText,
  buffersToStream,
} from 'quiver-core/stream-util'

import { handleMultipart } from '../lib/multipart-stream'

test('multipart stream test', assert => {
  assert::asyncTest('simple boundary', async assert => {
    const boundary = new Buffer('--boundary--')

    const testBoundary = async (testBuffers, expectedContent, restContent) => {
      const wholeStream = buffersToStream(testBuffers)

      const [partContent, restStream] = await handleMultipart(
        wholeStream, boundary, streamToText)

      assert.equal(partContent, expectedContent)

      assert.equal(await streamToText(restStream), restContent)
    }

    await testBoundary([
      'hello',
      '--boundary--',
      'goodbye'
    ], 'hello', 'goodbye')

    await testBoundary([
      'hello--b',
      'oundar',
      'y--goodbye'
    ], 'hello', 'goodbye')

    await testBoundary([
      'he', 'll',
      'o--boundary--g',
      'ood', 'bye'
    ], 'hello', 'goodbye')

    await testBoundary([
      'he', 'll',
      'o--b', 'oun', 'dary--g',
      'ood', 'bye'
    ], 'hello', 'goodbye')

    await testBoundary([
      '--boundary--',
      'goodbye'
    ], '', 'goodbye')

    await testBoundary([
      '--b', 'oundar', 'y--go',
      'odbye'
    ], '', 'goodbye')

    await testBoundary([
      'hello',
      '--boundary--',
    ], 'hello', '')

    await testBoundary([
      'hel',
      'lo--b', 'ound', 'ary--',
    ], 'hello', '')

    assert.end()
  })
})
