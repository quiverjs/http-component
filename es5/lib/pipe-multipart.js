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
    $__quiver_45_stream_45_component__;
var error = ($__quiver_45_error__ = require("quiver-error"), $__quiver_45_error__ && $__quiver_45_error__.__esModule && $__quiver_45_error__ || {default: $__quiver_45_error__}).error;
var async = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}).async;
var $__2 = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}),
    createChannel = $__2.createChannel,
    pushbackStream = $__2.pushbackStream;
var extractStreamHead = ($__quiver_45_stream_45_component__ = require("quiver-stream-component"), $__quiver_45_stream_45_component__ && $__quiver_45_stream_45_component__.__esModule && $__quiver_45_stream_45_component__ || {default: $__quiver_45_stream_45_component__}).extractStreamHead;
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
var pipeMultipart = async($traceurRuntime.initGeneratorFunction(function $__5(readStream, writeStream, boundary) {
  var boundaryLength,
      bufferQueue,
      $__4,
      closed,
      data,
      index,
      lastBuffers,
      nextBuffers,
      $__6,
      $__7,
      $__8,
      $__9,
      $__10,
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
          $__6 = readStream.read;
          $__7 = $__6.call(readStream);
          $ctx.state = 10;
          break;
        case 10:
          $ctx.state = 6;
          return $__7;
        case 6:
          $__8 = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          $__4 = $__8;
          $__9 = $__4.closed;
          closed = $__9;
          $__10 = $__4.data;
          data = $__10;
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
          $__4 = bufferQueue.sliceBoundary(index), lastBuffers = $__4[0], nextBuffers = $__4[1];
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
  }, $__5, this);
}));
var handleMultipart = (function(wholeStream, boundary, partHandler) {
  var $__4 = createChannel(),
      partStream = $__4.readStream,
      writeStream = $__4.writeStream;
  var handlePart = async($traceurRuntime.initGeneratorFunction(function $__11() {
    var $__12,
        $__13,
        err;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.pushTry(9, null);
            $ctx.state = 12;
            break;
          case 12:
            $__12 = partHandler(partStream);
            $ctx.state = 6;
            break;
          case 6:
            $ctx.state = 2;
            return $__12;
          case 2:
            $__13 = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.returnValue = $__13;
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
    }, $__11, this);
  }));
  return Promise.all([handlePart(), pipeMultipart(wholeStream, writeStream, boundary)]);
});
var newLine = new Buffer('\r\n');
var extractMultipart = async($traceurRuntime.initGeneratorFunction(function $__11(wholeStream, startBoundary, partHandler) {
  var $__4,
      partContent,
      restStream,
      headBuffer,
      readStream,
      ending,
      ended,
      $__14,
      $__15,
      $__16,
      $__17,
      $__18,
      $__19,
      $__20,
      $__21;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $__14 = handleMultipart(wholeStream, startBoundary, partHandler);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__14;
        case 2:
          $__15 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__4 = $__15;
          $__16 = $__4[0];
          partContent = $__16;
          $__17 = $__4[1];
          restStream = $__17;
          $ctx.state = 8;
          break;
        case 8:
          $__18 = extractStreamHead(readStream, newLine);
          $ctx.state = 14;
          break;
        case 14:
          $ctx.state = 10;
          return $__18;
        case 10:
          $__19 = $ctx.sent;
          $ctx.state = 12;
          break;
        case 12:
          $__4 = $__19;
          $__20 = $__4[0];
          headBuffer = $__20;
          $__21 = $__4[1];
          readStream = $__21;
          $ctx.state = 16;
          break;
        case 16:
          ending = headBuffer.toString().trim();
          ended = false;
          if (ending == '') {
            ended = false;
          } else if (ending = '--') {
            ended = true;
          } else {
            throw error(400, 'Bad Request');
          }
          $ctx.state = 20;
          break;
        case 20:
          $ctx.returnValue = [partContent, restStream, ended];
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__11, this);
}));
