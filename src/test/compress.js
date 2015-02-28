import 'quiver-core/traceur'

import fs from 'fs'
import zlib from 'zlib'
import buffertools from 'buffertools'
import { async, promisify } from 'quiver-core/promise'
import { RequestHead } from 'quiver-core/http'

import { 
  simpleHandler,
  loadHttpHandler
} from 'quiver-core/component'

import {
  emptyStreamable,
  streamableToText,
  streamableToBuffer,
} from 'quiver-core/stream-util'

import {
  httpCompressFilter,
  selectAcceptEncoding
} from '../lib/compress'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
let should = chai.should()
let expect = chai.expect

let gzip = promisify(zlib.gzip)
let gunzip = promisify(zlib.gunzip)

let testContent = fs.readFileSync(
  'test-content/ipsum.txt').toString()

describe('http compress test', () => {
  it('accept-encoding test', () => {
    selectAcceptEncoding('gzip').should.equal('gzip')
    selectAcceptEncoding('identity').should.equal('identity')
    selectAcceptEncoding('gzip;q=0').should.equal('identity')
    selectAcceptEncoding('*').should.equal('gzip')
    selectAcceptEncoding('gzip, *;q=0').should.equal('gzip')
    selectAcceptEncoding('identity;q=0.5, *;q=0').should.equal('identity')
    selectAcceptEncoding('identity;q=0, *').should.equal('gzip')
    selectAcceptEncoding('gzip;q=0, *;q=1.0').should.equal('identity')

    expect(() =>
      selectAcceptEncoding('identity;q=0')
    ).to.throw()

    expect(() =>
      selectAcceptEncoding('*;q=0')
    ).to.throw()
  })

  it('basic test', async(function*() {
    let compressed = yield gzip(testContent)

    let component = simpleHandler(
      args => testContent,
      'void', 'text')
    .middleware(httpCompressFilter)
    .setLoader(loadHttpHandler)

    let handler = yield component.loadHandler({})

    var [responseHead, responseStreamable] = 
      yield handler(new RequestHead(), emptyStreamable())

    should.not.exist(responseHead.getHeader(
      'content-encoding'))

    yield streamableToText(responseStreamable)
      .should.eventually.equal(testContent)

    var requestHead = new RequestHead({
      headers: {
        'accept-encoding': 'gzip'
      }
    })

    var [responseHead, responseStreamable] = 
      yield handler(requestHead, emptyStreamable())

    responseHead.getHeader('content-encoding')
      .should.equal('gzip')

    let buffer = yield streamableToBuffer(responseStreamable)

    should.equal(buffertools.compare(
      buffer, compressed), 0)


    var requestHead = new RequestHead({
      headers: {
        'accept-encoding': 'gzip;q=0, identity;q=0.5, *;q=0'
      }
    })

    var [responseHead, responseStreamable] = 
      yield handler(requestHead, emptyStreamable())

    should.not.exist(responseHead.getHeader(
      'content-encoding'))

    yield streamableToText(responseStreamable)
      .should.eventually.equal(testContent)


    var requestHead = new RequestHead({
      headers: {
        'accept-encoding': 'identity;q=0'
      }
    })

    yield handler(requestHead, emptyStreamable())
      .should.be.rejected
  }))
})