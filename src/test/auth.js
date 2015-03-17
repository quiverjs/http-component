import { error } from 'quiver-core/error'
import { async } from 'quiver-core/promise'
import { RequestHead } from 'quiver-core/http'

import { 
  simpleHandler,
  loadHttpHandler
} from 'quiver-core/component'

import {
  emptyStreamable,
  streamableToText,
} from 'quiver-core/stream-util'

import { basicAuthFilter } from '../lib/http-component'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
let should = chai.should()

let authHeaderRegex = /^Basic realm=".+"$/

describe('http basic auth test', () => {
  it('basic test', async(function*() {
    let authHandler = simpleHandler(
      args => {
        let { username, password } = args

        if(username=='Aladdin' && password=='open sesame') {
          return 'genie'
        }

        throw error(401, 'Unauthorized')
      }, 'void', 'text')

    let authFilter = basicAuthFilter()
      .implement({ authHandler })

    let main = simpleHandler(
      args => {
        args.userId.should.equal('genie')

        return 'secret content'
      }, 'void', 'text')
    .middleware(authFilter)
    .setLoader(loadHttpHandler)

    let handler = yield main.loadHandler({})

    var [responseHead, responseStreamable] = 
      yield handler(new RequestHead(), emptyStreamable())

    responseHead.statusCode.should.equal(401)

    var authHeader = responseHead.getHeader('www-authenticate')
    should.exist(authHeader)
    authHeaderRegex.test(authHeader).should.equal(true)

    yield streamableToText(responseStreamable)
      .should.eventually.equal('<h1>401 Unauthorized</h1>')

    var requestHead = new RequestHead({
      headers: {
        authorization: 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=='
      }
    })

    var [responseHead, responseStreamable] = 
      yield handler(requestHead, emptyStreamable())

    responseHead.statusCode.should.equal(200)

    yield streamableToText(responseStreamable)
      .should.eventually.equal('secret content')

    let invalidCredentials = new Buffer(
      'admin:password').toString('base64')

    var requestHead = new RequestHead({
      headers: {
        authorization: 'Basic ' + invalidCredentials
      }
    })

    var [responseHead, responseStreamable] = 
      yield handler(requestHead, emptyStreamable())

    responseHead.statusCode.should.equal(401)

    var authHeader = responseHead.getHeader('www-authenticate')
    should.exist(authHeader)
  }))
})