"use strict";
Object.defineProperties(exports, {
  formDataFilter: {get: function() {
      return formDataFilter;
    }},
  makeFormDataFilter: {get: function() {
      return makeFormDataFilter;
    }},
  __esModule: {value: true}
});
var $__quiver_45_core_47_error__,
    $__quiver_45_core_47_component__,
    $__quiver_45_core_47_promise__,
    $__quiver_45_core_47_stream_45_util__,
    $__querystring__;
var error = ($__quiver_45_core_47_error__ = require("quiver-core/error"), $__quiver_45_core_47_error__ && $__quiver_45_core_47_error__.__esModule && $__quiver_45_core_47_error__ || {default: $__quiver_45_core_47_error__}).error;
var streamFilter = ($__quiver_45_core_47_component__ = require("quiver-core/component"), $__quiver_45_core_47_component__ && $__quiver_45_core_47_component__.__esModule && $__quiver_45_core_47_component__ || {default: $__quiver_45_core_47_component__}).streamFilter;
var $__2 = ($__quiver_45_core_47_promise__ = require("quiver-core/promise"), $__quiver_45_core_47_promise__ && $__quiver_45_core_47_promise__.__esModule && $__quiver_45_core_47_promise__ || {default: $__quiver_45_core_47_promise__}),
    async = $__2.async,
    reject = $__2.reject;
var $__3 = ($__quiver_45_core_47_stream_45_util__ = require("quiver-core/stream-util"), $__quiver_45_core_47_stream_45_util__ && $__quiver_45_core_47_stream_45_util__.__esModule && $__quiver_45_core_47_stream_45_util__ || {default: $__quiver_45_core_47_stream_45_util__}),
    streamableToText = $__3.streamableToText,
    emptyStreamable = $__3.emptyStreamable;
var querystring = ($__querystring__ = require("querystring"), $__querystring__ && $__querystring__.__esModule && $__querystring__ || {default: $__querystring__}).default;
var parseQuery = querystring.parse;
var streamableToFormData = (function(streamable) {
  return streamableToText(streamable).then(parseQuery);
});
var formDataFilter = streamFilter((function(config, handler) {
  return (function(args, streamable) {
    if (args.requestHead && args.requestHead.method != 'POST')
      return reject(error(405, 'Method Not Allowed'));
    var contentType = streamable.contentType;
    if (contentType && contentType != 'application/x-www-form-urlencoded') {
      return handler(args, streamable);
    }
    return streamableToFormData(streamable).then((function(formData) {
      args.formData = formData;
      return handler(args, emptyStreamable());
    }));
  });
}));
var makeFormDataFilter = formDataFilter.factory();
