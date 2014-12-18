"use strict";
Object.defineProperties(exports, {
  requestLoggerFilter: {get: function() {
      return requestLoggerFilter;
    }},
  makeRequestLoggerFilter: {get: function() {
      return makeRequestLoggerFilter;
    }},
  __esModule: {value: true}
});
var $__fs__,
    $__quiver_45_component__,
    $__quiver_45_promise__,
    $__quiver_45_stream_45_util__;
var fs = ($__fs__ = require("fs"), $__fs__ && $__fs__.__esModule && $__fs__ || {default: $__fs__}).default;
var httpFilter = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}).httpFilter;
var $__2 = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}),
    async = $__2.async,
    promisify = $__2.promisify;
var nodeToQuiverWriteStream = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}).nodeToQuiverWriteStream;
var commonLogFormatter = (function(info) {
  var $__5,
      $__7,
      $__8,
      $__9,
      $__11,
      $__12,
      $__14;
  var $__4 = info,
      requestHead = $__4.requestHead,
      responseHead = $__4.responseHead,
      responseTime = ($__5 = $__4.responseTime) === void 0 ? '-' : $__5;
  var $__6 = requestHead,
      url = ($__7 = $__6.url) === void 0 ? '/' : $__7,
      method = ($__8 = $__6.method) === void 0 ? 'GET' : $__8,
      httpVersion = ($__9 = $__6.httpVersion) === void 0 ? '1.1' : $__9,
      requestHeaders = $__6.headers;
  var $__10 = requestHead.args,
      userId = ($__11 = $__10.userId) === void 0 ? '-' : $__11,
      clientAddress = ($__12 = $__10.clientAddress) === void 0 ? '-' : $__12;
  var $__13 = responseHead,
      statusCode = ($__14 = $__13.statusCode) === void 0 ? 200 : $__14,
      responseHeaders = $__13.headers;
  var referer = requestHeaders['referer'] || requestHeaders['referrer'] || '-';
  var contentLength = responseHeaders['content-length'] || '-';
  var userAgent = responseHeaders['user-agent'] || '-';
  var date = new Date().toUTCString();
  return (clientAddress + " - " + userId + " [" + date + "] \"" + method + " " + url + " HTTP/" + httpVersion + "\" " + statusCode + " " + responseTime);
});
var requestLoggerFilter = httpFilter((function(config, handler) {
  var $__6;
  var $__4 = config,
      logFile = $__4.logFile,
      logFormatter = ($__6 = $__4.logFormatter) === void 0 ? commonLogFormatter : $__6;
  var nodeWriteStream = logFile ? fs.createWriteStream(logFile) : process.stdout;
  var writeStream = nodeToQuiverWriteStream(nodeWriteStream);
  return async($traceurRuntime.initGeneratorFunction(function $__15(requestHead, requestStreamable) {
    var startTime,
        response,
        responseHead,
        diff,
        responseTime,
        log;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            startTime = process.hrtime();
            $ctx.state = 8;
            break;
          case 8:
            $ctx.state = 2;
            return handler(requestHead, requestStreamable);
          case 2:
            response = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            responseHead = response[0];
            diff = process.hrtime(startTime);
            responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
            log = logFormatter({
              requestHead: requestHead,
              responseHead: responseHead,
              responseTime: responseTime
            });
            writeStream.write(log + '\n');
            $ctx.state = 10;
            break;
          case 10:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__15, this);
  }));
}));
var makeRequestLoggerFilter = requestLoggerFilter.factory();
