"use strict";
var $__quiver_45_error__,
    $__quiver_45_promise__,
    $__quiver_45_component__,
    $__quiver_45_stream_45_component__,
    $__header_46_js__;
var error = ($__quiver_45_error__ = require("quiver-error"), $__quiver_45_error__ && $__quiver_45_error__.__esModule && $__quiver_45_error__ || {default: $__quiver_45_error__}).error;
var async = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}).async;
var httpFilter = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}).httpFilter;
var compressStreamable = ($__quiver_45_stream_45_component__ = require("quiver-stream-component"), $__quiver_45_stream_45_component__ && $__quiver_45_stream_45_component__.__esModule && $__quiver_45_stream_45_component__ || {default: $__quiver_45_stream_45_component__}).compressStreamable;
var parseSubheaders = ($__header_46_js__ = require("./header.js"), $__header_46_js__ && $__header_46_js__.__esModule && $__header_46_js__ || {default: $__header_46_js__}).parseSubheaders;
var acceptRegex = /^\s*([a-zA-Z]+|\*)(?:;q=(\d(?:\.\d)?))?\s*$/;
var validEncoding = ['gzip', 'identity', '*'];
var selectAcceptEncoding = (function(header) {
  var fields = {};
  header.split(',').forEach((function(field) {
    var matches = acceptRegex.exec(field);
    if (!matches)
      throw error(400, 'Invalid Accept-Encoding header');
    var encoding = matches[1];
    var qvalue = matches[2] ? parseFloat(matches[2]) : 1;
    var accepted = (qvalue > 0);
    if (validEncoding.indexOf(encoding) != -1)
      fields[encoding] = qvalue;
  }));
  if (fields.gzip || (fields['*'] && fields.gzip !== false)) {
    return 'gzip';
  }
  if (fields.identity || (fields['*'] !== false && fields.identity !== false)) {
    return 'identity';
  }
  throw error(406, 'No acceptable encoding');
});
var httpCompressFilter = httpFilter((function(config, handler) {
  var $__6;
  var $__5 = config,
      httpCompressionThreshold = ($__6 = $__5.httpCompressionThreshold) === void 0 ? 1024 : $__6;
  return async($traceurRuntime.initGeneratorFunction(function $__8(requestHead, requestStreamable) {
    var acceptEncoding,
        response,
        encoding,
        $__7,
        responseHead,
        responseStreamable,
        contentLength,
        compressedStreamable;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            acceptEncoding = requestHead.getHeader('accept-encoding');
            $ctx.state = 24;
            break;
          case 24:
            $ctx.state = 2;
            return handler(requestHead, requestStreamable);
          case 2:
            response = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = (!acceptEncoding) ? 5 : 6;
            break;
          case 5:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          case 6:
            encoding = selectAcceptEncoding(acceptEncoding);
            $ctx.state = 26;
            break;
          case 26:
            $ctx.state = (encoding != 'gzip') ? 8 : 9;
            break;
          case 8:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          case 9:
            $__7 = response, responseHead = $__7[0], responseStreamable = $__7[1];
            $ctx.state = 28;
            break;
          case 28:
            $ctx.state = (responseHead.getHeader('content-encoding')) ? 11 : 12;
            break;
          case 11:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          case 12:
            contentLength = responseHead.getHeader('content-length');
            $ctx.state = 30;
            break;
          case 30:
            $ctx.state = (contentLength && parseInt(contentLength) < httpCompressionThreshold) ? 14 : 15;
            break;
          case 14:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          case 15:
            $ctx.state = 18;
            return compressStreamable(responseStreamable);
          case 18:
            compressedStreamable = $ctx.sent;
            $ctx.state = 20;
            break;
          case 20:
            responseHead.setHeader('content-encoding', 'gzip');
            $ctx.state = 32;
            break;
          case 32:
            $ctx.returnValue = [responseHead, compressedStreamable];
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__8, this);
  }));
}));
