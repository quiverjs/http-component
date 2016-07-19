import test from 'tape'
import { asyncTest } from 'quiver-core/util/tape'
import { extract } from 'quiver-core/util/immutable'

import { error } from 'quiver-core/util/error'
import { RequestHead } from 'quiver-core/http-head'

import { implement } from 'quiver-core/component/method'
import { simpleHandler, streamHandler, streamToHttpHandler } from 'quiver-core/component/constructor'
import { createConfig, loadHandler, httpHandlerLoader } from 'quiver-core/component/util'

import {
  emptyStreamable, streamableToText
} from 'quiver-core/stream-util'

import { basicAuthFilter } from '../lib/constructor'

const authHeaderRegex = /^Basic realm=".+"$/

test('http basic auth test', assert => {
  assert::asyncTest('basic test', async assert => {
    const authHandler = simpleHandler(
      args => {
        const { username, password } = args::extract()

        if(username=='Aladdin' && password=='open sesame') {
          return 'genie'
        }

        throw error(401, 'Unauthorized')
      }, {
        inputType: 'empty',
        outputType: 'text'
      })

    const authFilter = basicAuthFilter()

    authFilter::implement({ authHandler })

    const main = streamToHttpHandler(
      simpleHandler(args => {
        assert.equal(args.get('userId'), 'genie')

        return 'secret content'
      }, {
        inputType: 'empty',
        outputType: 'text'
      })
    )
    .addMiddleware(authFilter)

    const handler = await loadHandler(createConfig(), main)

    let [responseHead, responseStreamable] =
      await handler(new RequestHead(), emptyStreamable())

    assert.equal(responseHead.status, '401')

    let authHeader = responseHead.getHeader('www-authenticate')
    assert.ok(authHeader)
    assert.ok(authHeaderRegex.test(authHeader))

    assert.equal(
      await streamableToText(responseStreamable),
      '<h1>401 Unauthorized</h1>')

    let requestHead = new RequestHead()
      .setHeader('authorization', 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==')

    ;[responseHead, responseStreamable] =
      await handler(requestHead, emptyStreamable())

    assert.equal(responseHead.status, '200')

    assert.equal(
      await streamableToText(responseStreamable),
      'secret content',
      'should be able to retrieve secret content')

    const invalidCredentials = new Buffer(
      'admin:password').toString('base64')

    requestHead = new RequestHead()
      .setHeader('authorization', `Basic ${invalidCredentials}`)

    ;[responseHead, responseStreamable] =
      await handler(requestHead, emptyStreamable())

    assert.equal(responseHead.status, '401')

    authHeader = responseHead.getHeader('www-authenticate')
    assert.ok(authHeader)

    assert.end()
  })
})
