import { error } from 'quiver-core/util/error'
import { extract } from 'quiver-core/util/immutable'
import { implement } from 'quiver-core/component/method'

import {
  simpleHandler, streamToHttpHandler
} from 'quiver-core/component/constructor'

import { basicAuthFilter } from '../lib/constructor'

const authHandler = simpleHandler(
  args => {
    const { username, password } = args::extract()

    if(username=='admin' && password=='password') {
      return 'admin'
    }

    throw error(401, 'Unauthorized')
  }, {
    inputType: 'empty',
    outputType: 'text'
  })

const authFilter = basicAuthFilter()

authFilter::implement({ authHandler })

export const adminHandler = streamToHttpHandler(simpleHandler(
  args => {
    return 'Hello Administrator. Nobody else can access this area'
  }, {
    inputType: 'empty',
    outputType: 'text'
  }))
.addMiddleware(authFilter)
