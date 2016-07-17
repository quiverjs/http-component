import crypto from 'crypto'
import { ResponseHead } from 'quiver-core/http'
import { extract } from 'quiver-core/util/immutable'
import { promisify } from 'quiver-core/util/promise'
import { textToStreamable } from 'quiver-core/stream-util'
import { createArgs } from 'quiver-core/component/util'

import {
  httpFilter, abstractHandler
} from 'quiver-core/component/constructor'

import {
  simpleHandlerLoader
} from 'quiver-core/component/util'

import {
  inputHandlers
} from 'quiver-core/component/method'

const randomBytes = promisify(crypto.randomBytes)

const splitOnce = (str, separator) => {
  const index = str.indexOf(separator)
  if(index == -1) return [str, '']

  return [str.slice(0, index), str.slice(index+1)]
}

const base64Decode = str =>
  new Buffer(str, 'base64').toString()

const decodeCredentials = str =>
  splitOnce(base64Decode(str), ':')

const randomRealm = () =>
  randomBytes(32).then(buffer =>
    buffer.toString('base64'))

const authHandler = abstractHandler('authHandler')
  .setLoader(simpleHandlerLoader('empty', 'text'))

export const basicAuthFilter = httpFilter(
  async (config, handler) => {
    const {
      authHandler,
      userField='userId',
      strictAuthenticate = true,
      authenticationRealm = await randomRealm()
    } = config::extract()

    const wwwAuthenticate = 'Basic realm="' +
      authenticationRealm + '"'

    const unauthorizedResponse = () => {
      const message = '<h1>401 Unauthorized</h1>'

      const responseHead = new ResponseHead()
        .setStatus(401)
        .setHeader('www-authenticate', wwwAuthenticate)
        .setHeader('content-type',  'text/html')
        .setHeader('content-length', `${message.length}`)

      const responseStreamable = textToStreamable(message)

      return [responseHead, responseStreamable]
    }

    return async (requestHead, requestStreamable) => {
      const unauthorized = strictAuthenticate ?
        unauthorizedResponse :
        () => handler(requestHead, requestStreamable)

      const authHeader = requestHead.getHeader('authorization')
      if(!authHeader) return unauthorized()

      const basicToken = authHeader.slice(0, 6)
      if(basicToken != 'Basic ') return unauthorized()

      const credentials = authHeader.slice(6).trim()
      const [username, password] = decodeCredentials(credentials)

      let userId
      try {
        const args = createArgs({ username, password })
        userId = await authHandler(args)
      } catch(err) {
        if(err.code == 401) return unauthorized()
        throw err
      }

      const requestHead2 = requestHead.setArgsKey(userField, userId)

      return handler(requestHead2, requestStreamable)
    }
  })
  ::inputHandlers({ authHandler })

export const makeBasicAuthFilter = basicAuthFilter.export()
