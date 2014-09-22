"use strict";
Object.defineProperties(exports, {
  byteRangeFilter: {get: function() {
      return byteRangeFilter;
    }},
  __esModule: {value: true}
});
var $__quiver_45_error__,
    $__quiver_45_promise__,
    $__quiver_45_component__,
    $__quiver_45_stream_45_util__;
var error = ($__quiver_45_error__ = require("quiver-error"), $__quiver_45_error__ && $__quiver_45_error__.__esModule && $__quiver_45_error__ || {default: $__quiver_45_error__}).error;
var async = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}).async;
var httpFilter = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}).httpFilter;
var streamToStreamable = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}).streamToStreamable;
var byteRangePattern = /^bytes=(\d+)-(\d*)$/i;
var parseRange = function(header) {
  var matches = header.match(pattern);
  if (!matches)
    return [0, -1];
  var start = parseInt(matches[1]);
  var end = parseInt(matches[2]) + 1;
  if (isNaN(end))
    end = -1;
  return [start, end];
};
var byteRangeFilter = httpFilter((function(config, handler) {
  var $__5;
  var $__4 = config,
      convertNonRangeStream = ($__5 = $__4.convertNonRangeStream) === void 0 ? false : $__5;
  return async($traceurRuntime.initGeneratorFunction(function $__9(requestHead, requestStreamable) {
    var rangeHeader,
        response,
        $__6,
        responseHead,
        responseStreamable,
        $__7,
        toByteRangeStream,
        contentLength,
        isRangeStreamable,
        $__8,
        start,
        end,
        rangeStream,
        rangeStreamable,
        contentRange;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            rangeHeader = requestHead.getHeader('range');
            $ctx.state = 27;
            break;
          case 27:
            $ctx.state = 2;
            return handler(requestHead, requestStreamable);
          case 2:
            response = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $__6 = response, responseHead = $__6[0], responseStreamable = $__6[1];
            $ctx.state = 29;
            break;
          case 29:
            $ctx.state = (responseHead.statusCode != 200) ? 5 : 6;
            break;
          case 5:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          case 6:
            $__7 = responseStreamable, toByteRangeStream = $__7.toByteRangeStream, contentLength = $__7.contentLength;
            isRangeStreamable = toByteRangeStream && contentLength;
            if (isRangeStreamable) {
              responseHead.setHeader('accept-ranges', 'bytes');
            }
            $ctx.state = 31;
            break;
          case 31:
            $ctx.state = (rangeHeader && isRangeStreamable) ? 17 : 23;
            break;
          case 17:
            $__8 = parseRange(rangeHeader), start = $__8[0], end = $__8[1];
            $ctx.state = 18;
            break;
          case 18:
            $ctx.state = (start == 0 && end == -1) ? 8 : 9;
            break;
          case 8:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          case 9:
            if (end == -1)
              end = contentLength;
            if (end > contentLength)
              throw error(416, 'Requested Range Not Satisfiable');
            $ctx.state = 20;
            break;
          case 20:
            $ctx.state = 12;
            return responseStreamable.toByteRangeStream(start, end);
          case 12:
            rangeStream = $ctx.sent;
            $ctx.state = 14;
            break;
          case 14:
            rangeStreamable = streamToStreamable(rangeStream);
            contentRange = 'bytes ' + start + '-' + (end - 1) + '/' + contentLength;
            responseHead.statusCode = 206;
            responseHead.statusMessage = 'Partial Content';
            responseHead.setHeader('content-range', contentRange);
            responseHead.setHeader('content-length', contentLength);
            $ctx.state = 22;
            break;
          case 22:
            $ctx.returnValue = [responseHead, rangeStreamable];
            $ctx.state = -2;
            break;
          case 23:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__9, this);
  }));
}));
