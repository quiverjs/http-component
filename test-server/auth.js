import { error } from 'quiver-error'

import { 
  simpleHandler,
} from 'quiver-component'

import { basicAuthFilter } from '../lib/http-component.js'

var authHandler = simpleHandler(
  args => {
    var { username, password } = args

    if(username=='admin' && password=='password') {
      return 'admin'
    }

    throw error(401, 'Unauthorized')
  }, 'void', 'text')

export var authHandler = simpleHandler(
  args => {
    return 'Hello Administrator. Nobody else can access this area'
  }, 'void', 'text')
.addMiddleware(basicAuthFilter(authHandler))