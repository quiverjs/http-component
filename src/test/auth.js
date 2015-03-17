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
const should = chai.should()

const authHeaderRegex = /^Basic realm=".+"$/

describe('http basic auth test', () => {
  it('basic test', async(function*() {
    const authHandler = simpleHandler(
      args => {
        const { username, password } = args

        if(username=='Aladdin' && password=='open sesame') {
          return 'genie'
        }

        throw error(401, 'Unauthorized')
      }, 'void', 'text')

    const authFilter = basicAuthFilter()
      .implement({ authHandler })

    const main = simpleHandler(
      args => {
        args.userId.should.equal('genie')

        return 'secret content'
      }, 'void', 'text')
    .middleware(authFilter)
    .setLoader(loadHttpHandler)

    const handler = yield main.loadHandler({})

    let [responseHead, responseStreamable] = 
      yield handler(new RequestHead(), emptyStreamable())

    responseHead.statusCode.should.equal(401)

    let authHeader = responseHead.getHeader('www-authenticate')
    should.exist(authHeader)
    authHeaderRegex.test(authHeader).should.equal(true)

    yield streamableToText(responseStreamable)
      .should.eventually.equal('<h1>401 Unauthorized</h1>')

    let requestHead = new RequestHead({
      headers: {
        authorization: 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=='
      }
    })

    ;[responseHead, responseStreamable] = 
      yield handler(requestHead, emptyStreamable())

    responseHead.statusCode.should.equal(200)

    yield streamableToText(responseStreamable)
      .should.eventually.equal('secret content')

    const invalidCredentials = new Buffer(
      'admin:password').toString('base64')

    requestHead = new RequestHead({
      headers: {
        authorization: 'Basic ' + invalidCredentials
      }
    })

    ;[responseHead, responseStreamable] = 
      yield handler(requestHead, emptyStreamable())

    responseHead.statusCode.should.equal(401)

    authHeader = responseHead.getHeader('www-authenticate')
    should.exist(authHeader)
  }))
})