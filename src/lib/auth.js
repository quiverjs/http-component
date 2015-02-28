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

let randomBytes = promisify(crypto.randomBytes)

let splitOnce = (str, separator) => {
  let index = str.indexOf(separator)
  if(index == -1) return [str, '']

  return [str.slice(0, index), str.slice(index+1)]
}

let base64Decode = str =>
  new Buffer(str, 'base64').toString()

let decodeCredentials = str =>
  splitOnce(base64Decode(str), ':')

let randomRealm = () =>
  randomBytes(32).then(buffer =>
    buffer.toString('base64'))

let authHandler = abstractHandler('authHandler')
  .setLoader(simpleHandlerLoader('void', 'text'))

export let basicAuthFilter = httpFilter(
async(function*(config, handler) {
  let {
    authHandler,
    userField='userId',
    strictAuthenticate = true,
    authenticationRealm = yield randomRealm()
  } = config

  let wwwAuthenticate = 'Basic realm="' + 
    authenticationRealm + '"'

  let unauthorizedResponse = () => {
    let message = '<h1>401 Unauthorized</h1>'

    let responseHead = new ResponseHead({
      statusCode: 401,
      headers: {
        'www-authenticate': wwwAuthenticate,
        'content-type': 'text/html',
        'content-length': ''+message.length
      }
    })
    
    let responseStreamable = textToStreamable(message)
    
    return [responseHead, responseStreamable]
  }

  return async(function*(requestHead, requestStreamable) {
    let unauthorized = strictAuthenticate ?
      unauthorizedResponse :
      () => handler(requestHead, requestStreamable)

    let authHeader = requestHead.getHeader('authorization')
    if(!authHeader) return unauthorized()

    let basicToken = authHeader.slice(0, 6)
    if(basicToken != 'Basic ') return unauthorized()

    let credentials = authHeader.slice(6).trim()
    let [username, password] = decodeCredentials(credentials)

    try {
      var userId = yield authHandler({ username, password })
    } catch(err) {
      if(err.errorCode == 401) return unauthorized()
      throw err
    }

    requestHead.setArgs(userField, userId)

    return handler(requestHead, requestStreamable)
  })
}))
.inputHandlers({ authHandler })

export let makeBasicAuthFilter = basicAuthFilter.factory()