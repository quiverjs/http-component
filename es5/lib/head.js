"use strict";
Object.defineProperties(exports, {
  headRequestFilter: {get: function() {
      return headRequestFilter;
    }},
  makeHeadRequestFilter: {get: function() {
      return makeHeadRequestFilter;
    }},
  __esModule: {value: true}
});
var $__quiver_45_core_47_component__,
    $__quiver_45_core_47_stream_45_util__;
var httpFilter = ($__quiver_45_core_47_component__ = require("quiver-core/component"), $__quiver_45_core_47_component__ && $__quiver_45_core_47_component__.__esModule && $__quiver_45_core_47_component__ || {default: $__quiver_45_core_47_component__}).httpFilter;
var $__1 = ($__quiver_45_core_47_stream_45_util__ = require("quiver-core/stream-util"), $__quiver_45_core_47_stream_45_util__ && $__quiver_45_core_47_stream_45_util__.__esModule && $__quiver_45_core_47_stream_45_util__ || {default: $__quiver_45_core_47_stream_45_util__}),
    closeStreamable = $__1.closeStreamable,
    emptyStreamable = $__1.emptyStreamable;
var headRequestFilter = httpFilter((function(config, handler) {
  return (function(requestHead, requestStreamable) {
    var $__3;
    var $__2 = requestHead,
        method = ($__3 = $__2.method) === void 0 ? 'GET' : $__3;
    if (method != 'HEAD')
      return handler(requestHead, requestStreamable);
    requestHead.method = 'GET';
    return handler(requestHead, requestStreamable).then((function($__4) {
      var $__5 = $__4,
          responseHead = $__5[0],
          responseStreamable = $__5[1];
      requestHead.method = 'HEAD';
      closeStreamable(responseStreamable);
      return [responseHead, emptyStreamable()];
    }));
  });
}));
var makeHeadRequestFilter = headRequestFilter.factory();
