import 'traceur'

import { error } from 'quiver-error'
import { async } from 'quiver-promise'
import { RequestHead } from 'quiver-http'

import { 
  simpleHandler,
  loadHttpHandler
} from 'quiver-component'

import {
  emptyStreamable,
  streamableToText,
} from 'quiver-stream-util'

import { basicAuthFilter } from '../lib/auth.js'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
var should = chai.should()

var authHeaderRegex = /^Basic realm=".+"$/

describe('http basic auth test', () => {
  it('basic test', async(function*() {
    var authHandler = simpleHandler(
      args => {
        var { username, password } = args

        if(username=='Aladdin' && password=='open sesame') {
          return 'genie'
        }

        throw error(401, 'Unauthorized')
      }, 'void', 'text')

    var main = simpleHandler(
      args => {
        args.userId.should.equal('genie')

        return 'secret content'
      }, 'void', 'text')
    .addMiddleware(basicAuthFilter(authHandler))

    var handler = yield loadHttpHandler({}, main)

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

    var invalidCredentials = new Buffer(
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