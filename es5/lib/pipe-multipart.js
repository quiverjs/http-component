"use strict";
Object.defineProperties(exports, {
  indexOf: {get: function() {
      return indexOf;
    }},
  pipeMultipart: {get: function() {
      return pipeMultipart;
    }},
  handleMultipart: {get: function() {
      return handleMultipart;
    }},
  extractMultipart: {get: function() {
      return extractMultipart;
    }},
  __esModule: {value: true}
});
var $__quiver_45_error__,
    $__quiver_45_promise__,
    $__quiver_45_stream_45_util__,
    $__quiver_45_stream_45_component__,
    $__header_46_js__;
var error = ($__quiver_45_error__ = require("quiver-error"), $__quiver_45_error__ && $__quiver_45_error__.__esModule && $__quiver_45_error__ || {default: $__quiver_45_error__}).error;
var async = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}).async;
var $__2 = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}),
    createChannel = $__2.createChannel,
    pushbackStream = $__2.pushbackStream;
var extractStreamHead = ($__quiver_45_stream_45_component__ = require("quiver-stream-component"), $__quiver_45_stream_45_component__ && $__quiver_45_stream_45_component__.__esModule && $__quiver_45_stream_45_component__ || {default: $__quiver_45_stream_45_component__}).extractStreamHead;
var extractHttpHeaders = ($__header_46_js__ = require("./header.js"), $__header_46_js__ && $__header_46_js__.__esModule && $__header_46_js__ || {default: $__header_46_js__}).extractHttpHeaders;
var indexOf = (function(getByte, bufferLength, boundary, boundaryLength) {
  var lastBegin = bufferLength - boundaryLength;
  var firstByte = boundary[0];
  first: for (var i = 0; i <= lastBegin; i++) {
    if (getByte(i) != firstByte)
      continue;
    for (var j = 1; j < boundaryLength; j++) {
      if (getByte(i + j) != boundary[$traceurRuntime.toProperty(j)])
        continue first;
    }
    return i;
  }
  return -1;
});
var createBufferQueue = (function(boundaryLength) {
  var buffers = [];
  var bufferLength = 0;
  var getByte = (function(index) {
    var currentIndex = 0;
    for (var i = 0; i < buffers.length; i++) {
      var buffer = buffers[$traceurRuntime.toProperty(i)];
      var end = currentIndex + buffer.length;
      if (end > index) {
        return buffer[$traceurRuntime.toProperty(index - currentIndex)];
      } else {
        currentIndex = end;
      }
    }
    throw new Error('out of range');
  });
  var pushBuffer = (function(buffer) {
    if (!Buffer.isBuffer(buffer))
      buffer = new Buffer(buffer);
    buffers.push(buffer);
    bufferLength += buffer.length;
  });
  var popBuffer = (function() {
    var buffer = buffers.shift();
    bufferLength -= buffer.length;
    return buffer;
  });
  var unshiftBuffer = (function(buffer) {
    buffers.unshift(buffer);
    bufferLength += buffer.length;
  });
  var sliceBuffers = (function(index) {
    var buffer = popBuffer();
    var length = buffer.length;
    if (length == index)
      return [buffer];
    if (length < index)
      return $traceurRuntime.spread([buffer], sliceBuffers(index - length));
    if (length > index) {
      unshiftBuffer(buffer.slice(index));
      return [buffer.slice(0, index)];
    }
  });
  var canPop = (function() {
    return ((bufferLength - buffers[0].length) > boundaryLength);
  });
  var sliceBoundary = (function(index) {
    var lastBuffers = sliceBuffers(index);
    var boundaryBuffers = sliceBuffers(boundaryLength);
    return [lastBuffers, buffers];
  });
  return {
    getByte: getByte,
    pushBuffer: pushBuffer,
    popBuffer: popBuffer,
    unshiftBuffer: unshiftBuffer,
    sliceBuffers: sliceBuffers,
    sliceBoundary: sliceBoundary,
    canPop: canPop,
    get length() {
      return bufferLength;
    }
  };
});
var pipeMultipart = async($traceurRuntime.initGeneratorFunction(function $__6(readStream, writeStream, boundary) {
  var boundaryLength,
      bufferQueue,
      $__5,
      closed,
      data,
      index,
      lastBuffers,
      nextBuffers,
      $__7,
      $__8,
      $__9,
      $__10,
      $__11,
      err;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.pushTry(35, null);
          $ctx.state = 38;
          break;
        case 38:
          if (!Buffer.isBuffer(boundary))
            boundary = new Buffer(boundary);
          boundaryLength = boundary.length;
          bufferQueue = createBufferQueue(boundaryLength);
          $ctx.state = 34;
          break;
        case 34:
          $ctx.state = 2;
          return writeStream.prepareWrite();
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = (true) ? 9 : 32;
          break;
        case 9:
          $__7 = readStream.read;
          $__8 = $__7.call(readStream);
          $ctx.state = 10;
          break;
        case 10:
          $ctx.state = 6;
          return $__8;
        case 6:
          $__9 = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          $__5 = $__9;
          $__10 = $__5.closed;
          closed = $__10;
          $__11 = $__5.data;
          data = $__11;
          $ctx.state = 12;
          break;
        case 12:
          if (closed)
            throw error(400, 'malformed multipart stream');
          bufferQueue.pushBuffer(data);
          $ctx.state = 29;
          break;
        case 29:
          $ctx.state = (bufferQueue.length < boundaryLength) ? 4 : 26;
          break;
        case 26:
          index = indexOf(bufferQueue.getByte, bufferQueue.length, boundary, boundaryLength);
          $ctx.state = 31;
          break;
        case 31:
          $ctx.state = (index == -1) ? 19 : 22;
          break;
        case 19:
          $ctx.state = (bufferQueue.canPop()) ? 17 : 4;
          break;
        case 17:
          writeStream.write(bufferQueue.popBuffer());
          $ctx.state = 18;
          break;
        case 18:
          $ctx.state = 14;
          return writeStream.prepareWrite();
        case 14:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 22:
          $__5 = bufferQueue.sliceBoundary(index), lastBuffers = $__5[0], nextBuffers = $__5[1];
          lastBuffers.forEach((function(buffer) {
            return writeStream.write(buffer);
          }));
          writeStream.closeWrite();
          $ctx.state = 23;
          break;
        case 23:
          $ctx.returnValue = pushbackStream(readStream, nextBuffers);
          $ctx.state = -2;
          break;
        case 32:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 35:
          $ctx.popTry();
          err = $ctx.storedException;
          $ctx.state = 41;
          break;
        case 41:
          try {
            writeStream.closeWrite(err);
          } finally {
            readStream.closeRead(err);
          }
          throw err;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__6, this);
}));
var handleMultipart = (function(wholeStream, boundary, partHandler) {
  var $__5 = createChannel(),
      partStream = $__5.readStream,
      writeStream = $__5.writeStream;
  var handlePart = async($traceurRuntime.initGeneratorFunction(function $__12() {
    var $__13,
        $__14,
        err;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.pushTry(9, null);
            $ctx.state = 12;
            break;
          case 12:
            $__13 = partHandler(partStream);
            $ctx.state = 6;
            break;
          case 6:
            $ctx.state = 2;
            return $__13;
          case 2:
            $__14 = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.returnValue = $__14;
            $ctx.state = -2;
            break;
          case 8:
            $ctx.popTry();
            $ctx.state = -2;
            break;
          case 9:
            $ctx.popTry();
            err = $ctx.storedException;
            $ctx.state = 15;
            break;
          case 15:
            partStream.closeRead(err);
            throw err;
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__12, this);
  }));
  return Promise.all([handlePart(), pipeMultipart(wholeStream, writeStream, boundary)]);
});
var newLine = new Buffer('\r\n');
var extractMultipart = async($traceurRuntime.initGeneratorFunction(function $__12(readStream, startBoundary, partHandler) {
  var $__5,
      headers,
      readStream,
      partContent,
      restStream,
      headBuffer,
      ending,
      ended,
      $__15,
      $__16,
      $__17,
      $__18,
      $__19,
      $__20,
      $__21,
      $__22,
      $__23,
      $__24,
      $__25,
      $__26,
      $__27,
      $__28;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $__15 = extractHttpHeaders(readStream);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__15;
        case 2:
          $__16 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__5 = $__16;
          $__17 = $__5[0];
          headers = $__17;
          $__18 = $__5[1];
          readStream = $__18;
          $ctx.state = 8;
          break;
        case 8:
          $__20 = function(partStream) {
            return $__19 = partHandler(headers, partStream), $__19;
          };
          $__21 = handleMultipart(readStream, startBoundary, $__20);
          $ctx.state = 14;
          break;
        case 14:
          $ctx.state = 10;
          return $__21;
        case 10:
          $__22 = $ctx.sent;
          $ctx.state = 12;
          break;
        case 12:
          $__5 = $__22;
          $__23 = $__5[0];
          partContent = $__23;
          $__24 = $__5[1];
          restStream = $__24;
          $ctx.state = 16;
          break;
        case 16:
          $__25 = extractStreamHead(readStream, newLine);
          $ctx.state = 22;
          break;
        case 22:
          $ctx.state = 18;
          return $__25;
        case 18:
          $__26 = $ctx.sent;
          $ctx.state = 20;
          break;
        case 20:
          $__5 = $__26;
          $__27 = $__5[0];
          headBuffer = $__27;
          $__28 = $__5[1];
          readStream = $__28;
          $ctx.state = 24;
          break;
        case 24:
          ending = headBuffer.toString().trim();
          ended = false;
          if (ending == '') {
            ended = false;
          } else if (ending = '--') {
            ended = true;
          } else {
            throw error(400, 'Bad Request');
          }
          $ctx.state = 28;
          break;
        case 28:
          $ctx.returnValue = [partContent, restStream, ended];
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__12, this);
}));
