import { error } from 'quiver/error'

import {
  simpleHandler,
} from 'quiver-core/component/constructor'

import { basicAuthFilter } from '../lib/http-component.js'

const authHandler = simpleHandler(
  args => {
    const { username, password } = args

    if(username=='admin' && password=='password') {
      return 'admin'
    }

    throw error(401, 'Unauthorized')
  }, {
    inputType: 'empty',
    outputType: 'text'
  })

const authFilter = basicAuthFilter()
  .implement({ authHandler })

export const adminHandler = simpleHandler(
  args => {
    return 'Hello Administrator. Nobody else can access this area'
  }, {
    inputType: 'empty',
    outputType: 'text'
  })
.addMiddleware(authFilter)
