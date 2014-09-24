"use strict";
Object.defineProperties(exports, {
  etagFilter: {get: function() {
      return etagFilter;
    }},
  makeEtagFilter: {get: function() {
      return makeEtagFilter;
    }},
  __esModule: {value: true}
});
var $__quiver_45_promise__,
    $__quiver_45_component__,
    $__quiver_45_stream_45_util__,
    $__crypto__;
var async = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}).async;
var httpFilter = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}).httpFilter;
var emptyStreamable = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}).emptyStreamable;
var crypto = ($__crypto__ = require("crypto"), $__crypto__ && $__crypto__.__esModule && $__crypto__ || {default: $__crypto__}).default;
var algorithm = 'sha1';
var checksumField = 'checksum-sha1';
var checksumBuffer = (function(buffer) {
  return crypto.createHash(algorithm).update(buffer).digest('hex');
});
var etagStreamable = async($traceurRuntime.initGeneratorFunction(function $__5(streamable) {
  var buffer,
      etag;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = (streamable.etag) ? 1 : 2;
          break;
        case 1:
          $ctx.returnValue = streamable.etag;
          $ctx.state = -2;
          break;
        case 2:
          $ctx.state = (streamable[checksumField]) ? 4 : 5;
          break;
        case 4:
          $ctx.returnValue = streamable[checksumField];
          $ctx.state = -2;
          break;
        case 5:
          $ctx.state = (!streamable.toBuffer) ? 7 : 8;
          break;
        case 7:
          $ctx.returnValue = null;
          $ctx.state = -2;
          break;
        case 8:
          $ctx.state = 11;
          return streamable.toBuffer();
        case 11:
          buffer = $ctx.sent;
          $ctx.state = 13;
          break;
        case 13:
          etag = checksumBuffer(buffer);
          streamable.etag = etag;
          streamable[checksumField] = etag;
          $ctx.state = 17;
          break;
        case 17:
          $ctx.returnValue = etag;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__5, this);
}));
var etagFilter = httpFilter((function(config, handler) {
  return async($traceurRuntime.initGeneratorFunction(function $__6(requestHead, requestStreamable) {
    var noneMatch,
        response,
        $__4,
        responseHead,
        responseStreamable,
        etag,
        etagField;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            noneMatch = requestHead.getHeader('if-none-match');
            $ctx.state = 23;
            break;
          case 23:
            $ctx.state = 2;
            return handler(requestHead, requestStreamable);
          case 2:
            response = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $__4 = response, responseHead = $__4[0], responseStreamable = $__4[1];
            $ctx.state = 25;
            break;
          case 25:
            $ctx.state = (responseHead.statusCode != 200) ? 5 : 6;
            break;
          case 5:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          case 6:
            $ctx.state = 9;
            return etagStreamable(responseStreamable);
          case 9:
            etag = $ctx.sent;
            $ctx.state = 11;
            break;
          case 11:
            $ctx.state = (!etag) ? 12 : 13;
            break;
          case 12:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          case 13:
            etagField = '"' + etag + '"';
            $ctx.state = 27;
            break;
          case 27:
            $ctx.state = (noneMatch && noneMatch == etagField) ? 17 : 16;
            break;
          case 17:
            responseHead.statusCode = 304;
            responseHead.statusMessage = 'Not Modified';
            $ctx.state = 18;
            break;
          case 18:
            $ctx.returnValue = [responseHead, emptyStreamable()];
            $ctx.state = -2;
            break;
          case 16:
            responseHead.setHeader('etag', etagField);
            $ctx.state = 29;
            break;
          case 29:
            $ctx.returnValue = [responseHead, responseStreamable];
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__6, this);
  }));
}));
var makeEtagFilter = etagFilter.privatizedConstructor();
