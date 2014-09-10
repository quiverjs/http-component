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
  it.skip('single file test', async(function*() {
    var serializer = simpleHandler(
      (args, text) => {
        console.log('serializing', args, text)
        //text.should.equal('Hello World')
        return {
          name: 'hello.txt'
        }
      }, 'text', 'json')

    var main = simpleHandler(args => {
      console.log('main', args)
      var { formData, serializedStreams } = args

      formData.username.should.equal('john')
      serializedStreams[0].name.should.equal('hello.txt')
    }, 'void', 'void')
    .addMiddleware(multipartSerializeFilter(serializer))

    var handler = yield loadStreamHandler({}, main)
    var streamable = yield fileStreamable(
      './test-content/multipart-1.txt')

    streamable.contentType = 'multipart/form-data; boundary=AaB03x'

    yield handler({}, streamable)
  }))
})