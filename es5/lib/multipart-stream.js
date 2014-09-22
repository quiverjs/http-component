"use strict";
Object.defineProperties(exports, {
  createBufferQueue: {get: function() {
      return createBufferQueue;
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
  extractAllMultipart: {get: function() {
      return extractAllMultipart;
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
var $__3 = ($__quiver_45_stream_45_component__ = require("quiver-stream-component"), $__quiver_45_stream_45_component__ && $__quiver_45_stream_45_component__.__esModule && $__quiver_45_stream_45_component__ || {default: $__quiver_45_stream_45_component__}),
    extractStreamHead = $__3.extractStreamHead,
    extractFixedStreamHead = $__3.extractFixedStreamHead;
var extractHttpHeaders = ($__header_46_js__ = require("./header.js"), $__header_46_js__ && $__header_46_js__.__esModule && $__header_46_js__ || {default: $__header_46_js__}).extractHttpHeaders;
var createBufferQueue = (function(boundaryLength) {
  var buffers = [];
  var bufferLength = 0;
  var getByte = (function(index) {
    var currentIndex = 0;
    for (var i = 0; i < buffers.length; i++) {
      var buffer = buffers[i];
      var end = currentIndex + buffer.length;
      if (end > index) {
        return buffer[index - currentIndex];
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
  var indexOf = (function(boundary) {
    var lastBegin = bufferLength - boundaryLength;
    var firstByte = boundary[0];
    first: for (var i = 0; i <= lastBegin; i++) {
      if (getByte(i) != firstByte)
        continue;
      for (var j = 1; j < boundaryLength; j++) {
        if (getByte(i + j) != boundary[j])
          continue first;
      }
      return i;
    }
    return -1;
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
    indexOf: indexOf,
    get length() {
      return bufferLength;
    }
  };
});
var pipeMultipart = async($traceurRuntime.initGeneratorFunction(function $__9(readStream, writeStream, boundary) {
  var boundaryLength,
      bufferQueue,
      $__5,
      closed,
      data,
      index,
      $__6,
      lastBuffers,
      nextBuffers,
      $__10,
      $__11,
      $__12,
      $__13,
      $__14,
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
          $__10 = readStream.read;
          $__11 = $__10.call(readStream);
          $ctx.state = 10;
          break;
        case 10:
          $ctx.state = 6;
          return $__11;
        case 6:
          $__12 = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          $__5 = $__12;
          $__13 = $__5.closed;
          closed = $__13;
          $__14 = $__5.data;
          data = $__14;
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
          index = bufferQueue.indexOf(boundary);
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
          $__6 = bufferQueue.sliceBoundary(index), lastBuffers = $__6[0], nextBuffers = $__6[1];
          lastBuffers.forEach((function(buffer) {
            return writeStream.write(buffer);
          }));
          writeStream.closeWrite();
          readStream = pushbackStream(readStream, nextBuffers);
          $ctx.state = 23;
          break;
        case 23:
          $ctx.returnValue = readStream;
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
  }, $__9, this);
}));
var handleMultipart = (function(wholeStream, boundary, partHandler) {
  var $__5 = createChannel(),
      partStream = $__5.readStream,
      writeStream = $__5.writeStream;
  var handlePart = async($traceurRuntime.initGeneratorFunction(function $__15() {
    var $__16,
        $__17,
        err;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.pushTry(9, null);
            $ctx.state = 12;
            break;
          case 12:
            $__16 = partHandler(partStream);
            $ctx.state = 6;
            break;
          case 6:
            $ctx.state = 2;
            return $__16;
          case 2:
            $__17 = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.returnValue = $__17;
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
    }, $__15, this);
  }));
  return Promise.all([handlePart(), pipeMultipart(wholeStream, writeStream, boundary)]);
});
var newLineBuffer = new Buffer('\r\n');
var extractMultipart = async($traceurRuntime.initGeneratorFunction(function $__15(readStream, startBoundary, partHandler) {
  var $__5,
      headers,
      readStream,
      $__6,
      partContent,
      $__7,
      endBuffer,
      ending,
      $__8,
      headBuffer,
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
      $__28,
      $__29,
      $__30,
      $__31,
      $__32,
      $__33,
      $__34,
      $__35;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $__18 = extractHttpHeaders(readStream);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__18;
        case 2:
          $__19 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__5 = $__19;
          $__20 = $__5[0];
          headers = $__20;
          $__21 = $__5[1];
          readStream = $__21;
          $ctx.state = 8;
          break;
        case 8:
          $__23 = function(partStream) {
            return $__22 = partHandler(headers, partStream), $__22;
          };
          $__24 = handleMultipart(readStream, startBoundary, $__23);
          $ctx.state = 14;
          break;
        case 14:
          $ctx.state = 10;
          return $__24;
        case 10:
          $__25 = $ctx.sent;
          $ctx.state = 12;
          break;
        case 12:
          $__6 = $__25;
          $__26 = $__6[0];
          partContent = $__26;
          $__27 = $__6[1];
          readStream = $__27;
          $ctx.state = 16;
          break;
        case 16:
          $__28 = extractFixedStreamHead(readStream, 2);
          $ctx.state = 22;
          break;
        case 22:
          $ctx.state = 18;
          return $__28;
        case 18:
          $__29 = $ctx.sent;
          $ctx.state = 20;
          break;
        case 20:
          $__7 = $__29;
          $__30 = $__7[0];
          endBuffer = $__30;
          $__31 = $__7[1];
          readStream = $__31;
          $ctx.state = 24;
          break;
        case 24:
          ending = endBuffer.toString();
          $ctx.state = 44;
          break;
        case 44:
          $ctx.state = (ending == '--') ? 25 : 26;
          break;
        case 25:
          $ctx.returnValue = [partContent, readStream, true];
          $ctx.state = -2;
          break;
        case 26:
          $ctx.state = (ending != '\r\n') ? 36 : 39;
          break;
        case 36:
          readStream = pushbackStream(readStream, [endBuffer]);
          $ctx.state = 37;
          break;
        case 37:
          $__32 = extractStreamHead(readStream, newLineBuffer);
          $ctx.state = 33;
          break;
        case 33:
          $ctx.state = 29;
          return $__32;
        case 29:
          $__33 = $ctx.sent;
          $ctx.state = 31;
          break;
        case 31:
          $__8 = $__33;
          $__34 = $__8[0];
          headBuffer = $__34;
          $__35 = $__8[1];
          readStream = $__35;
          $ctx.state = 35;
          break;
        case 35:
          ending = headBuffer.toString().trim();
          if (ending != '')
            throw error(400, 'Bad Request');
          $ctx.state = 39;
          break;
        case 39:
          $ctx.returnValue = [partContent, readStream, false];
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__15, this);
}));
var extractAllMultipart = async($traceurRuntime.initGeneratorFunction(function $__36(readStream, boundary, partHandler) {
  var parts,
      firstBoundary,
      startBoundary,
      $__5,
      head,
      readStream,
      $__6,
      partContent,
      ended,
      $__37,
      $__38,
      $__39,
      $__40,
      $__41,
      $__42,
      $__43,
      $__44,
      $__45,
      err;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.pushTry(25, null);
          $ctx.state = 28;
          break;
        case 28:
          parts = [];
          firstBoundary = new Buffer('--' + boundary + '\r\n');
          startBoundary = new Buffer('\r\n--' + boundary);
          $ctx.state = 24;
          break;
        case 24:
          $__37 = extractStreamHead(readStream, firstBoundary);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__37;
        case 2:
          $__38 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__5 = $__38;
          $__39 = $__5[0];
          head = $__39;
          $__40 = $__5[1];
          readStream = $__40;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = (true) ? 13 : 22;
          break;
        case 13:
          $__41 = extractMultipart(readStream, startBoundary, partHandler);
          $ctx.state = 14;
          break;
        case 14:
          $ctx.state = 10;
          return $__41;
        case 10:
          $__42 = $ctx.sent;
          $ctx.state = 12;
          break;
        case 12:
          $__6 = $__42;
          $__43 = $__6[0];
          partContent = $__43;
          $__44 = $__6[1];
          readStream = $__44;
          $__45 = $__6[2];
          ended = $__45;
          $ctx.state = 16;
          break;
        case 16:
          parts.push(partContent);
          $ctx.state = 21;
          break;
        case 21:
          $ctx.state = (ended) ? 17 : 8;
          break;
        case 17:
          $ctx.returnValue = parts;
          $ctx.state = -2;
          break;
        case 22:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 25:
          $ctx.popTry();
          err = $ctx.storedException;
          $ctx.state = 31;
          break;
        case 31:
          readStream.closeRead(err);
          throw err;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__36, this);
}));
