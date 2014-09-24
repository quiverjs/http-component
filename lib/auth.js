import crypto from 'crypto'
import { ResponseHead } from 'quiver-http'
import { async, promisify } from 'quiver-promise'
import { emptyStreamable } from 'quiver-stream-util'
import { 
  httpFilter, simpleHandlerLoader,
  inputHandlerMiddleware
} from 'quiver-component'

var randomBytes = promisify(crypto.randomBytes)

var splitOnce = (str, separator) => {
  var index = str.indexOf(separator)
  if(index == -1) return [str, '']

  return [str.slice(0, index), str.slice(index+1)]
}

var base64Decode = str =>
  new Buffer(str, 'base64').toString()

var decodeCredentials = str =>
  splitOnce(base64Decode(str), ':')

var randomRealm = () =>
  randomBytes(32).then(buffer =>
    buffer.toString('base64'))

export var basicAuthFilter = (authHandler, userField='userId') =>
httpFilter(async(function*(config, handler) {
  var {
    authHandler,
    strictAuthenticate = true,
    authenticationRealm = yield randomRealm()
  } = config

  var wwwAuthenticate = 'Basic realm="' + 
    authenticationRealm + '"'

  var unauthorizedResponse = () => ([
    new ResponseHead({
      statusCode: 401,
      headers: {
        'www-authenticate': wwwAuthenticate
      }
    }),
    emptyStreamable()
  ])

  return async(function*(requestHead, requestStreamable) {
    var unauthorized = strictAuthenticate ?
      unauthorizedResponse :
      () => handler(requestHead, requestStreamable)

    var authHeader = requestHead.getHeader('authorization')
    if(!authHeader) return unauthorized()

    var basicToken = authHeader.slice(0, 6)
    if(basicToken != 'Basic ') return unauthorized()

    var credentials = authHeader.slice(6).trim()
    var [username, password] = decodeCredentials(credentials)

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
.addMiddleware(inputHandlerMiddleware(
  authHandler, 'authHandler', {
    loader: simpleHandlerLoader('void', 'text')
  }))