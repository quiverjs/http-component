import { error } from 'quiver-core/error'

import { 
  simpleHandler,
} from 'quiver-core/component'

import { basicAuthFilter } from '../lib/http-component.js'

const authHandler = simpleHandler(
  args => {
    const { username, password } = args

    if(username=='admin' && password=='password') {
      return 'admin'
    }

    throw error(401, 'Unauthorized')
  }, 'void', 'text')

const authFilter = basicAuthFilter()
  .implement({ authHandler })

export const adminHandler = simpleHandler(
  args => {
    return 'Hello Administrator. Nobody else can access this area'
  }, 'void', 'text')
.middleware(authFilter)
