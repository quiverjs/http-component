"use strict";
Object.defineProperties(exports, {
  parseHeader: {get: function() {
      return parseHeader;
    }},
  parseSubheaders: {get: function() {
      return parseSubheaders;
    }},
  parseHttpHeaders: {get: function() {
      return parseHttpHeaders;
    }},
  extractHttpHeaders: {get: function() {
      return extractHttpHeaders;
    }},
  httpHeaderFilter: {get: function() {
      return httpHeaderFilter;
    }},
  __esModule: {value: true}
});
var $__quiver_45_error__,
    $__quiver_45_component__,
    $__quiver_45_stream_45_component__;
var error = ($__quiver_45_error__ = require("quiver-error"), $__quiver_45_error__ && $__quiver_45_error__.__esModule && $__quiver_45_error__ || {default: $__quiver_45_error__}).error;
var argsFilter = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}).argsFilter;
var $__2 = ($__quiver_45_stream_45_component__ = require("quiver-stream-component"), $__quiver_45_stream_45_component__ && $__quiver_45_stream_45_component__.__esModule && $__quiver_45_stream_45_component__ || {default: $__quiver_45_stream_45_component__}),
    extractStreamHead = $__2.extractStreamHead,
    headerExtractFilter = $__2.headerExtractFilter;
var invalidCharacters = /[^\s\x20-\x7E]/;
var trailingWhiteSpace = /\s$/;
var tokenSeparator = /[\(\)\<\>@,;:\\"\/\[\]?=\{\} \t]/;
var invalidFieldName = (function(key) {
  return (invalidCharacters.test(key) || trailingWhiteSpace.test(key) || tokenSeparator.test(key));
});
var parseHeader = (function(header) {
  var colonIndex = header.indexOf(':');
  if (colonIndex == -1)
    return [header, ''];
  var key = header.slice(0, colonIndex);
  var value = header.slice(colonIndex + 1);
  if (invalidFieldName)
    throw error(400, 'Bad Requesst');
  key = key.trim().toLowerCase();
  value = value.trim().replace(/\s+/g, ' ');
  return [key, value];
});
var parseSubheaders = (function(field) {
  var subheaders = {};
  var fields = field.split(';');
  var main = fields.shift();
  fields.forEach((function(subfield) {
    var $__3 = subfield.trim().split('='),
        key = $__3[0],
        value = $__3[1];
    if (!value)
      return;
    value = value.replace(/^"/, '').replace(/"$/, '');
    $traceurRuntime.setProperty(subheaders, key, value);
  }));
  return [main, subheaders];
});
var parseHttpHeaders = (function(headerText) {
  if (invalidCharacters.test(headerText))
    throw error(400, 'Bad Request');
  var rawHeaders = headerText.split('\r\n');
  var headers = {};
  rawHeaders.forEach(function(header) {
    var $__4,
        $__5;
    var $__3 = parseHeader(header),
        key = $__3[0],
        value = $__3[1];
    if (headers[$traceurRuntime.toProperty(key)]) {
      ($__4 = headers[$traceurRuntime.toProperty(key)], $__5 = $__4 + ', ' + value, $traceurRuntime.setProperty(headers, key, $__5), $__5);
    } else {
      $traceurRuntime.setProperty(headers, key, value);
    }
  });
  return headers;
});
var headerSeparator = new Buffer('\r\n\r\n');
var extractHttpHeaders = (function(readStream, options) {
  return extractStreamHead(readStream, options).then((function(headBuffer) {
    return parseHttpHeaders(headBuffer.toString());
  }));
});
var httpHeaderFilter = argsFilter((function(args) {
  var header = args.header;
  args.httpHeaders = parseHttpHeaders(header);
  return args;
})).addMiddleware(headerExtractFilter(headerSeparator)).privatizedConstructor();
