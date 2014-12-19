"use strict";
Object.defineProperties(exports, {
  basicErrorPageFilter: {get: function() {
      return basicErrorPageFilter;
    }},
  makeBasicErrorPageFilter: {get: function() {
      return makeBasicErrorPageFilter;
    }},
  __esModule: {value: true}
});
var $__http__,
    $__quiver_45_core_47_http__,
    $__quiver_45_core_47_component__,
    $__quiver_45_core_47_stream_45_util__;
var http = ($__http__ = require("http"), $__http__ && $__http__.__esModule && $__http__ || {default: $__http__}).default;
var ResponseHead = ($__quiver_45_core_47_http__ = require("quiver-core/http"), $__quiver_45_core_47_http__ && $__quiver_45_core_47_http__.__esModule && $__quiver_45_core_47_http__ || {default: $__quiver_45_core_47_http__}).ResponseHead;
var httpFilter = ($__quiver_45_core_47_component__ = require("quiver-core/component"), $__quiver_45_core_47_component__ && $__quiver_45_core_47_component__.__esModule && $__quiver_45_core_47_component__ || {default: $__quiver_45_core_47_component__}).httpFilter;
var textToStreamable = ($__quiver_45_core_47_stream_45_util__ = require("quiver-core/stream-util"), $__quiver_45_core_47_stream_45_util__ && $__quiver_45_core_47_stream_45_util__.__esModule && $__quiver_45_core_47_stream_45_util__ || {default: $__quiver_45_core_47_stream_45_util__}).textToStreamable;
var statusTable = http.STATUS_CODES;
var basicErrorPageFilter = httpFilter((function(config, handler) {
  var $__5;
  var $__4 = config,
      env = ($__5 = $__4.env) === void 0 ? 'development' : $__5;
  var devMode = env == 'development';
  return (function(requestHead, streamable) {
    return handler(requestHead, streamable).catch((function(err) {
      var errorCode = err.errorCode || 500;
      var statusMessage = statusTable[errorCode] || 'Unknown';
      var errorTrace = devMode ? ("<pre>" + err.stack + "</pre>") : '';
      var errorPage = ("<h1>" + errorCode + " " + statusMessage + "</h1>\n" + errorTrace);
      var responseStreamable = textToStreamable(errorPage);
      var responseHead = new ResponseHead({
        statusCode: errorCode,
        headers: {
          'content-type': 'text/html',
          'content-length': '' + responseStreamable.contentLength
        }
      });
      return [responseHead, responseStreamable];
    }));
  });
}));
var makeBasicErrorPageFilter = basicErrorPageFilter.factory();
