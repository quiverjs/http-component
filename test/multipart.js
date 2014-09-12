import 'traceur'

import { async } from 'quiver-promise'

import {
  simpleHandler,
  loadSimpleHandler,
  loadStreamHandler
} from 'quiver-component'

import { fileStreamable } from 'quiver-file-stream'

import { multipartSerializeFilter } from '../lib/multipart.js'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
var should = chai.should()

describe('multipart test', () => {
  it('single file test', async(function*() {
    var serializer = simpleHandler(
      (args, text) => {
        args.name.should.equal('files')
        args.filename.should.equal('file1.txt')

        text.should.equal('Hello World')
        return {
          name: 'hello.txt'
        }
      }, 'text', 'json')

    var main = simpleHandler(args => {
      var { formData, serializedParts } = args

      formData.username.should.equal('john')
      serializedParts.files.name.should.equal('hello.txt')
    }, 'void', 'void')
    .addMiddleware(multipartSerializeFilter(serializer))

    var handler = yield loadStreamHandler({}, main)
    var streamable = yield fileStreamable(
      './test-content/multipart-1.txt')

    streamable.contentType = 'multipart/form-data; boundary=AaB03x'

    yield handler({}, streamable)
  }))

  it('multipart/mixed files test', async(function*() {
    var serializer = simpleHandler(
    (args, text) => {
      var { name, filename } = args

      name.should.equal('upload-files')
      if(filename=='foo.txt') {
        text.should.equal('Foo Content')
        return { id: 'foo' }
      } else if(filename == 'bar.gif') {
        text.should.equal('Bar Content')
        return { id: 'bar' }
      } else {
        throw new Error('Unexpected filename')
      }
    }, 'text', 'json')

    var main = simpleHandler(args => {
      var { formData, serializedParts } = args

      formData['user-field'].should.equal('John')
      var files = serializedParts['upload-files']

      files[0].id.should.equal('foo')
      files[1].id.should.equal('bar')

    }, 'void', 'void')
    .addMiddleware(multipartSerializeFilter(serializer))

    var handler = yield loadStreamHandler({}, main)
    var streamable = yield fileStreamable(
      './test-content/multipart-2.txt')

    streamable.contentType = 'multipart/form-data; boundary=AaB03x'

    yield handler({}, streamable)
  }))
})