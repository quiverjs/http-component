import crypto from 'crypto'
import { ResponseHead } from 'quiver-core/http'
import { async, promisify } from 'quiver-core/promise'
import { textToStreamable } from 'quiver-core/stream-util'
import { 
  httpFilter, 
  abstractHandler,
  simpleHandlerLoader,
  inputHandlerMiddleware
} from 'quiver-core/component'

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
  .setLoader(simpleHandlerLoader('void', 'text'))

export const basicAuthFilter = httpFilter(
async(function*(config, handler) {
  const {
    authHandler,
    userField='userId',
    strictAuthenticate = true,
    authenticationRealm = yield randomRealm()
  } = config

  const wwwAuthenticate = 'Basic realm="' + 
    authenticationRealm + '"'

  const unauthorizedResponse = () => {
    const message = '<h1>401 Unauthorized</h1>'

    const responseHead = new ResponseHead({
      statusCode: 401,
      headers: {
        'www-authenticate': wwwAuthenticate,
        'content-type': 'text/html',
        'content-length': ''+message.length
      }
    })
    
    const responseStreamable = textToStreamable(message)
    
    return [responseHead, responseStreamable]
  }

  return async(function*(requestHead, requestStreamable) {
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
      userId = yield authHandler({ username, password })
    } catch(err) {
      if(err.errorCode == 401) return unauthorized()
      throw err
    }

    requestHead.setArgs(userField, userId)

    return handler(requestHead, requestStreamable)
  })
}))
.inputHandlers({ authHandler })

export const makeBasicAuthFilter = basicAuthFilter.factory()