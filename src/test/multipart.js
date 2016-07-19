import test from 'tape'
import { asyncTest } from 'quiver-core/util/tape'
import { extract } from 'quiver-core/util/immutable'

import { simpleHandler } from 'quiver-core/component/constructor'

import { implement } from 'quiver-core/component/method'

import {
  createConfig, createArgs,
  loadHandler, streamHandlerLoader
} from 'quiver-core/component/util'

import {
  sizeWindowedStream, convertStreamable
} from 'quiver-stream-component'

import { fileStreamable } from 'quiver-core/file-stream'

import { multipartSerializeFilter } from '../lib/constructor'

test('multipart test', assert => {
  const sizeWindowStreamable = streamable =>
    convertStreamable(readStream =>
      sizeWindowedStream(readStream, 3, 5),
      streamable)

  assert::asyncTest('single file test', async assert => {
    const serializerHandler = simpleHandler(
      (args, text) => {
        assert.equal(args.get('name'), 'files')
        assert.equal(args.get('filename'), 'file1.txt')

        assert.equal(text, 'Hello World')

        return {
          name: 'hello.txt'
        }
      }, {
        inputType: 'text',
        outputType: 'json'
      })

    const multipartFilter = multipartSerializeFilter()

    multipartFilter::implement({ serializerHandler })

    const main = simpleHandler(args => {
      const { formData, serializedParts } = args::extract()

      assert.equal(formData.username, 'john')
      assert.equal(serializedParts.files.name, 'hello.txt')
    }, {
      inputType: 'empty',
      outputType: 'empty'
    })
    .addMiddleware(multipartFilter)
    .setLoader(streamHandlerLoader)

    const handler = await loadHandler(createConfig(), main)
    let streamable = await fileStreamable(
      './test-content/multipart-1.txt')

    streamable = sizeWindowStreamable(streamable)

    streamable.contentType = 'multipart/form-data; boundary=AaB03x'

    await handler(createArgs(), streamable)

    assert.end()
  })

  assert::asyncTest('multipart/mixed files test', async assert => {
    const serializerHandler = simpleHandler(
    (args, text) => {
      const { name, filename } = args::extract()

      assert.equal(name, 'upload-files')
      if(filename=='foo.txt') {
        assert.equal(text, 'Foo Content')
        return { id: 'foo' }
      } else if(filename == 'bar.gif') {
        assert.equal(text, 'Bar Content')
        return { id: 'bar' }
      } else {
        throw new Error('Unexpected filename')
      }
    }, {
      inputType: 'text',
      outputType: 'json'
    })

    const multipartFilter = multipartSerializeFilter()

    multipartFilter::implement({ serializerHandler })

    const main = simpleHandler(args => {
      const { formData, serializedParts } = args::extract()

      assert.equal(formData['user-field'], 'John')
      const files = serializedParts['upload-files']

      assert.equal(files[0].id, 'foo')
      assert.equal(files[1].id, 'bar')

    }, {
      inputType: 'empty',
      outputType: 'empty'
    })
    .addMiddleware(multipartFilter)
    .setLoader(streamHandlerLoader)

    const handler = await loadHandler(createConfig(), main)
    let streamable = await fileStreamable(
      './test-content/multipart-2.txt')

    streamable = sizeWindowStreamable(streamable)

    streamable.contentType = 'multipart/form-data; boundary=AaB03x'

    await handler(createArgs(), streamable)

    assert.end()
  })
})
