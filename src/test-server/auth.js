import { error } from 'quiver-core/error'

import { 
  simpleHandler,
} from 'quiver-core/component'

import { basicAuthFilter } from '../lib/http-component.js'

let authHandler = simpleHandler(
  args => {
    let { username, password } = args

    if(username=='admin' && password=='password') {
      return 'admin'
    }

    throw error(401, 'Unauthorized')
  }, 'void', 'text')

let authFilter = basicAuthFilter()
  .implement({ authHandler })

export let adminHandler = simpleHandler(
  args => {
    return 'Hello Administrator. Nobody else can access this area'
  }, 'void', 'text')
.middleware(authFilter)
