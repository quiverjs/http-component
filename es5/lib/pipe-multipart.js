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
  __esModule: {value: true}
});
var $__quiver_45_error__,
    $__quiver_45_promise__,
    $__quiver_45_stream_45_util__;
var error = ($__quiver_45_error__ = require("quiver-error"), $__quiver_45_error__ && $__quiver_45_error__.__esModule && $__quiver_45_error__ || {default: $__quiver_45_error__}).error;
var async = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}).async;
var $__2 = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}),
    createChannel = $__2.createChannel,
    pushbackStream = $__2.pushbackStream;
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
var pipeMultipart = async($traceurRuntime.initGeneratorFunction(function $__4(readStream, writeStream, boundary) {
  var boundaryLength,
      bufferQueue,
      $__3,
      closed,
      data,
      index,
      lastBuffers,
      nextBuffers,
      $__5,
      $__6,
      $__7,
      $__8,
      $__9,
      err;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.pushTry(26, null);
          $ctx.state = 29;
          break;
        case 29:
          if (!Buffer.isBuffer(boundary))
            boundary = new Buffer(boundary);
          boundaryLength = boundary.length;
          bufferQueue = createBufferQueue(boundaryLength);
          $ctx.state = 25;
          break;
        case 25:
          $ctx.state = (true) ? 5 : 23;
          break;
        case 5:
          $__5 = readStream.read;
          $__6 = $__5.call(readStream);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__6;
        case 2:
          $__7 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__3 = $__7;
          $__8 = $__3.closed;
          closed = $__8;
          $__9 = $__3.data;
          data = $__9;
          $ctx.state = 8;
          break;
        case 8:
          if (closed)
            throw error(400, 'malformed multipart stream');
          bufferQueue.pushBuffer(data);
          $ctx.state = 20;
          break;
        case 20:
          $ctx.state = (bufferQueue.length < boundaryLength) ? 25 : 17;
          break;
        case 17:
          index = indexOf(bufferQueue.getByte, bufferQueue.length, boundary, boundaryLength);
          $ctx.state = 22;
          break;
        case 22:
          $ctx.state = (index == -1) ? 13 : 11;
          break;
        case 13:
          if (bufferQueue.canPop()) {
            writeStream.write(bufferQueue.popBuffer());
          }
          $ctx.state = 25;
          break;
        case 11:
          $__3 = bufferQueue.sliceBoundary(index), lastBuffers = $__3[0], nextBuffers = $__3[1];
          lastBuffers.forEach((function(buffer) {
            return writeStream.write(buffer);
          }));
          writeStream.closeWrite();
          $ctx.state = 12;
          break;
        case 12:
          $ctx.returnValue = pushbackStream(readStream, nextBuffers);
          $ctx.state = -2;
          break;
        case 23:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 26:
          $ctx.popTry();
          err = $ctx.storedException;
          $ctx.state = 32;
          break;
        case 32:
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
  }, $__4, this);
}));
var handleMultipart = (function(wholeStream, boundary, partHandler) {
  var $__3 = createChannel(),
      partStream = $__3.readStream,
      writeStream = $__3.writeStream;
  var handlePart = async($traceurRuntime.initGeneratorFunction(function $__10() {
    var $__11,
        $__12,
        err;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.pushTry(9, null);
            $ctx.state = 12;
            break;
          case 12:
            $__11 = partHandler(partStream);
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
            $ctx.returnValue = $__12;
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
    }, $__10, this);
  }));
  return Promise.all([handlePart(), pipeMultipart(wholeStream, writeStream, boundary)]);
});
