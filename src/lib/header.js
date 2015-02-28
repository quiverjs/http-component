import { error } from 'quiver-core/error'

import {
  argsFilter
} from 'quiver-core/component'

import { 
  extractStreamHead,
  headerExtractFilter,
} from 'quiver-stream-component'

let invalidCharacters = /[^\s\x20-\x7E]/
let trailingWhiteSpace = /\s$/
let tokenSeparator = /[\(\)\<\>@,;:\\"\/\[\]?=\{\} \t]/

let invalidFieldName = key => {
  return (invalidCharacters.test(key)
    || trailingWhiteSpace.test(key)
    || tokenSeparator.test(key))
}

export let parseHeader = header => {
  let colonIndex = header.indexOf(':')
  if(colonIndex == -1) return [header, '']

  let key = header.slice(0, colonIndex)
  let value = header.slice(colonIndex+1)

  if(invalidFieldName(key)) throw error(400, 'Bad Requesst')

  key = key.trim().toLowerCase()
  value = value.trim().replace(/\s+/g, ' ')

  return [key, value]
}

export let parseSubheaders = field => {
  let subheaders = { }
  let fields = field.split(';')

  let main = fields.shift().trim()

  fields.forEach(
    subfield => {
      let [key, value] = subfield.trim().split('=')
      if(!value) return

      value = value.replace(/^"/, '').replace(/"$/, '')
      subheaders[key] = value
    })

  return [main, subheaders]
}

export let parseHttpHeaders = headerText => {
  if(invalidCharacters.test(headerText))
    throw error(400, 'Bad Request')

  let rawHeaders = headerText.split('\r\n')
  let headers = { }

  rawHeaders.forEach(function(header) {
    let [key, value] = parseHeader(header)

    if(headers[key]) {
      headers[key] += ', ' + value
    } else {
      headers[key] = value
    }
  })

  return headers
}

let headerSeparator = new Buffer('\r\n\r\n')

export let extractHttpHeaders = (readStream, options) =>
  extractStreamHead(readStream, headerSeparator, options)
  .then(([headBuffer, readStream]) =>
    ([parseHttpHeaders(headBuffer.toString()), readStream]))

export let httpHeaderFilter = argsFilter(
args => {
  let { header } = args
  args.httpHeaders = parseHttpHeaders(header)
  return args
})
.middleware(headerExtractFilter(headerSeparator))
.factory()