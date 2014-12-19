"use strict";
Object.defineProperties(exports, {
  chunkedResponseFilter: {get: function() {
      return chunkedResponseFilter;
    }},
  makeChunkedResponseFilter: {get: function() {
      return makeChunkedResponseFilter;
    }},
  __esModule: {value: true}
});
var $__quiver_45_core_47_promise__,
    $__quiver_45_core_47_component__,
    $__quiver_45_core_47_stream_45_util__,
    $__quiver_45_stream_45_component__;
var async = ($__quiver_45_core_47_promise__ = require("quiver-core/promise"), $__quiver_45_core_47_promise__ && $__quiver_45_core_47_promise__.__esModule && $__quiver_45_core_47_promise__ || {default: $__quiver_45_core_47_promise__}).async;
var httpFilter = ($__quiver_45_core_47_component__ = require("quiver-core/component"), $__quiver_45_core_47_component__ && $__quiver_45_core_47_component__.__esModule && $__quiver_45_core_47_component__ || {default: $__quiver_45_core_47_component__}).httpFilter;
var streamToStreamable = ($__quiver_45_core_47_stream_45_util__ = require("quiver-core/stream-util"), $__quiver_45_core_47_stream_45_util__ && $__quiver_45_core_47_stream_45_util__.__esModule && $__quiver_45_core_47_stream_45_util__ || {default: $__quiver_45_core_47_stream_45_util__}).streamToStreamable;
var streamToChunkedStream = ($__quiver_45_stream_45_component__ = require("quiver-stream-component"), $__quiver_45_stream_45_component__ && $__quiver_45_stream_45_component__.__esModule && $__quiver_45_stream_45_component__ || {default: $__quiver_45_stream_45_component__}).streamToChunkedStream;
var chunkedResponseFilter = httpFilter((function(config, handler) {
  return async($traceurRuntime.initGeneratorFunction(function $__5(requestHead, requestStreamable) {
    var response,
        $__4,
        responseHead,
        responseStreamable,
        readStream,
        chunkedStream,
        chunkedStreamable;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.state = 2;
            return handler(requestHead, requestStreamable);
          case 2:
            response = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $__4 = response, responseHead = $__4[0], responseStreamable = $__4[1];
            $ctx.state = 15;
            break;
          case 15:
            $ctx.state = (responseHead.getHeader('content-length') || responseHead.getHeader('transfer-encoding')) ? 5 : 6;
            break;
          case 5:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          case 6:
            $ctx.state = 9;
            return responseStreamable.toStream();
          case 9:
            readStream = $ctx.sent;
            $ctx.state = 11;
            break;
          case 11:
            chunkedStream = streamToChunkedStream(readStream);
            chunkedStreamable = streamToStreamable(chunkedStream);
            responseHead.setHeader('transfer-encoding', 'chunked');
            $ctx.state = 17;
            break;
          case 17:
            $ctx.returnValue = [responseHead, chunkedStreamable];
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__5, this);
  }));
}));
var makeChunkedResponseFilter = chunkedResponseFilter.factory();
