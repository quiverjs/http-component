"use strict";
Object.defineProperties(exports, {
  byteRangeStream: {get: function() {
      return byteRangeStream;
    }},
  byteRangeFilter: {get: function() {
      return byteRangeFilter;
    }},
  makeByteRangeFilter: {get: function() {
      return makeByteRangeFilter;
    }},
  __esModule: {value: true}
});
var $__quiver_45_core_47_error__,
    $__quiver_45_core_47_promise__,
    $__quiver_45_core_47_component__,
    $__quiver_45_core_47_stream_45_util__;
var error = ($__quiver_45_core_47_error__ = require("quiver-core/error"), $__quiver_45_core_47_error__ && $__quiver_45_core_47_error__.__esModule && $__quiver_45_core_47_error__ || {default: $__quiver_45_core_47_error__}).error;
var async = ($__quiver_45_core_47_promise__ = require("quiver-core/promise"), $__quiver_45_core_47_promise__ && $__quiver_45_core_47_promise__.__esModule && $__quiver_45_core_47_promise__ || {default: $__quiver_45_core_47_promise__}).async;
var httpFilter = ($__quiver_45_core_47_component__ = require("quiver-core/component"), $__quiver_45_core_47_component__ && $__quiver_45_core_47_component__.__esModule && $__quiver_45_core_47_component__ || {default: $__quiver_45_core_47_component__}).httpFilter;
var $__3 = ($__quiver_45_core_47_stream_45_util__ = require("quiver-core/stream-util"), $__quiver_45_core_47_stream_45_util__ && $__quiver_45_core_47_stream_45_util__.__esModule && $__quiver_45_core_47_stream_45_util__ || {default: $__quiver_45_core_47_stream_45_util__}),
    createChannel = $__3.createChannel,
    streamToStreamable = $__3.streamToStreamable;
var byteRangePattern = /^bytes=(\d+)-(\d*)$/i;
var parseRange = function(header) {
  var matches = header.match(byteRangePattern);
  if (!matches)
    return [0, -1];
  var start = parseInt(matches[1]);
  var end = parseInt(matches[2]) + 1;
  if (isNaN(end))
    end = -1;
  return [start, end];
};
var pipeByteRange = async($traceurRuntime.initGeneratorFunction(function $__9(readStream, writeStream, start, end) {
  var currentPos,
      closed,
      $__5,
      data,
      nextPos,
      $__10,
      $__11,
      $__12,
      $__13,
      $__14,
      $__15,
      $__16,
      $__17,
      $__18,
      $__19,
      $__20,
      $__21,
      $__22,
      err;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.pushTry(52, null);
          $ctx.state = 55;
          break;
        case 55:
          currentPos = 0;
          $ctx.state = 51;
          break;
        case 51:
          $__10 = writeStream.prepareWrite;
          $__11 = $__10.call(writeStream);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__11;
        case 2:
          $__12 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__13 = $__12.closed;
          closed = $__13;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = (closed) ? 9 : 10;
          break;
        case 9:
          $ctx.returnValue = readStream.closeRead();
          $ctx.state = -2;
          break;
        case 10:
          $ctx.state = (true) ? 16 : 49;
          break;
        case 16:
          $__14 = readStream.read;
          $__15 = $__14.call(readStream);
          $ctx.state = 17;
          break;
        case 17:
          $ctx.state = 13;
          return $__15;
        case 13:
          $__16 = $ctx.sent;
          $ctx.state = 15;
          break;
        case 15:
          $__5 = $__16;
          $__17 = $__5.closed;
          closed = $__17;
          $__18 = $__5.data;
          data = $__18;
          $ctx.state = 19;
          break;
        case 19:
          $ctx.state = (closed) ? 20 : 21;
          break;
        case 20:
          $ctx.returnValue = writeStream.closeWrite(error(400, 'read stream closed prematurely before end'));
          $ctx.state = -2;
          break;
        case 21:
          if (!Buffer.isBuffer(data))
            data = new Buffer(data);
          nextPos = currentPos + data.length;
          $ctx.state = 46;
          break;
        case 46:
          $ctx.state = (currentPos < start) ? 27 : 29;
          break;
        case 27:
          $ctx.state = (nextPos <= start) ? 25 : 24;
          break;
        case 25:
          currentPos = nextPos;
          $ctx.state = 10;
          break;
        case 24:
          if (nextPos > start) {
            data = data.slice(start - currentPos);
            currentPos = start;
          }
          $ctx.state = 29;
          break;
        case 29:
          if (nextPos > end) {
            data = data.slice(0, end - currentPos);
            nextPos = end;
          }
          writeStream.write(data);
          currentPos = nextPos;
          $ctx.state = 48;
          break;
        case 48:
          $ctx.state = (currentPos == end) ? 31 : 32;
          break;
        case 31:
          $ctx.returnValue = writeStream.closeWrite();
          $ctx.state = -2;
          break;
        case 32:
          $__19 = writeStream.prepareWrite;
          $__20 = $__19.call(writeStream);
          $ctx.state = 39;
          break;
        case 39:
          $ctx.state = 35;
          return $__20;
        case 35:
          $__21 = $ctx.sent;
          $ctx.state = 37;
          break;
        case 37:
          $__22 = $__21.closed;
          closed = $__22;
          $ctx.state = 41;
          break;
        case 41:
          $ctx.state = (closed) ? 42 : 10;
          break;
        case 42:
          $ctx.returnValue = readStream.closeRead();
          $ctx.state = -2;
          break;
        case 49:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 52:
          $ctx.popTry();
          err = $ctx.storedException;
          $ctx.state = 58;
          break;
        case 58:
          try {
            writeStream.closeWrite(err);
          } finally {
            readStream.closeRead(err);
          }
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__9, this);
}));
var byteRangeStream = (function(readStream, start, end) {
  var $__4 = createChannel(),
      resultStream = $__4.readStream,
      writeStream = $__4.writeStream;
  pipeByteRange(readStream, writeStream, start, end);
  return resultStream;
});
var byteRangeFilter = httpFilter((function(config, handler) {
  var $__5;
  var $__4 = config,
      convertNonRangeStream = ($__5 = $__4.convertNonRangeStream) === void 0 ? false : $__5;
  return async($traceurRuntime.initGeneratorFunction(function $__23(requestHead, requestStreamable) {
    var rangeHeader,
        response,
        $__6,
        responseHead,
        responseStreamable,
        $__7,
        toByteRangeStream,
        contentLength,
        $__8,
        start,
        end,
        rangeStream,
        readStream,
        rangeStreamable,
        contentRange;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            rangeHeader = requestHead.getHeader('range');
            $ctx.state = 34;
            break;
          case 34:
            $ctx.state = 2;
            return handler(requestHead, requestStreamable);
          case 2:
            response = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $__6 = response, responseHead = $__6[0], responseStreamable = $__6[1];
            $ctx.state = 36;
            break;
          case 36:
            $ctx.state = (responseHead.statusCode != 200) ? 5 : 6;
            break;
          case 5:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          case 6:
            $ctx.state = (responseHead.getHeader('content-range')) ? 8 : 9;
            break;
          case 8:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          case 9:
            $__7 = responseStreamable, toByteRangeStream = $__7.toByteRangeStream, contentLength = $__7.contentLength;
            $ctx.state = 38;
            break;
          case 38:
            $ctx.state = (!contentLength) ? 11 : 12;
            break;
          case 11:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          case 12:
            if (toByteRangeStream) {
              responseHead.setHeader('accept-ranges', 'bytes');
            }
            $ctx.state = 40;
            break;
          case 40:
            $ctx.state = (!rangeHeader) ? 14 : 15;
            break;
          case 14:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          case 15:
            $__8 = parseRange(rangeHeader), start = $__8[0], end = $__8[1];
            if (end == -1)
              end = contentLength;
            $ctx.state = 42;
            break;
          case 42:
            $ctx.state = (start == 0 && end == contentLength) ? 17 : 18;
            break;
          case 17:
            $ctx.returnValue = response;
            $ctx.state = -2;
            break;
          case 18:
            if (end > contentLength)
              throw error(416, 'Requested Range Not Satisfiable');
            $ctx.state = 44;
            break;
          case 44:
            $ctx.state = (toByteRangeStream) ? 20 : 24;
            break;
          case 20:
            $ctx.state = 21;
            return responseStreamable.toByteRangeStream(start, end);
          case 21:
            rangeStream = $ctx.sent;
            $ctx.state = 23;
            break;
          case 24:
            $ctx.state = 25;
            return responseStreamable.toStream();
          case 25:
            readStream = $ctx.sent;
            $ctx.state = 27;
            break;
          case 27:
            rangeStream = byteRangeStream(readStream, start, end);
            $ctx.state = 23;
            break;
          case 23:
            rangeStreamable = streamToStreamable(rangeStream);
            contentRange = 'bytes ' + start + '-' + (end - 1) + '/' + contentLength;
            responseHead.statusCode = 206;
            responseHead.statusMessage = 'Partial Content';
            responseHead.setHeader('content-range', contentRange);
            responseHead.setHeader('content-length', '' + (end - start));
            $ctx.state = 46;
            break;
          case 46:
            $ctx.returnValue = [responseHead, rangeStreamable];
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__23, this);
  }));
}));
var makeByteRangeFilter = byteRangeFilter.factory();
