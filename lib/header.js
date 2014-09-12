import { error } from 'quiver-error'

import {
  argsFilter
} from 'quiver-component'

import { 
  extractStreamHead,
  headerExtractFilter,
} from 'quiver-stream-component'

var invalidCharacters = /[^\s\x20-\x7E]/
var trailingWhiteSpace = /\s$/
var tokenSeparator = /[\(\)\<\>@,;:\\"\/\[\]?=\{\} \t]/

var invalidFieldName = key => {
  return (invalidCharacters.test(key)
    || trailingWhiteSpace.test(key)
    || tokenSeparator.test(key))
}

export var parseHeader = header => {
  var colonIndex = header.indexOf(':')
  if(colonIndex == -1) return [header, '']

  var key = header.slice(0, colonIndex)
  var value = header.slice(colonIndex+1)

  if(invalidFieldName) throw error(400, 'Bad Requesst')

  key = key.trim().toLowerCase()
  value = value.trim().replace(/\s+/g, ' ')

  return [key, value]
}

export var parseSubheaders = field => {
  var subheaders = { }
  var fields = field.split(';')

  var main = fields.shift()

  fields.forEach(
    subfield => {
      var [key, value] = subfield.trim().split('=')
      if(!value) return

      value = value.replace(/^"/, '').replace(/"$/, '')
      subheaders[key] = value
    })

  return [main, subheaders]
}

export var parseHttpHeaders = headerText => {
  if(invalidCharacters.test(headerText))
    throw error(400, 'Bad Request')

  var rawHeaders = headerText.split('\r\n')
  var headers = { }

  rawHeaders.forEach(function(header) {
    var [key, value] = parseHeader(header)

    if(headers[key]) {
      headers[key] += ', ' + value
    } else {
      headers[key] = value
    }
  })

  return headers
}

var headerSeparator = new Buffer('\r\n\r\n')

export var extractHttpHeaders = (readStream, options) =>
  extractStreamHead(readStream, options)
  .then(headBuffer =>
    parseHttpHeaders(headBuffer.toString()))

export var httpHeaderFilter = argsFilter(
args => {
  var { header } = args
  args.httpHeaders = parseHttpHeaders(header)
  return args
})
.addMiddleware(headerExtractFilter(headerSeparator))
.privatizedConstructor()