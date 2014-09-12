"use strict";
Object.defineProperties(exports, {
  multipartSerializeFilter: {get: function() {
      return multipartSerializeFilter;
    }},
  __esModule: {value: true}
});
var $__quiver_45_error__,
    $__quiver_45_promise__,
    $__quiver_45_component__,
    $__quiver_45_stream_45_util__,
    $__quiver_45_stream_45_component__,
    $__header_46_js__,
    $__pipe_45_multipart_46_js__;
var error = ($__quiver_45_error__ = require("quiver-error"), $__quiver_45_error__ && $__quiver_45_error__.__esModule && $__quiver_45_error__ || {default: $__quiver_45_error__}).error;
var $__1 = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}),
    async = $__1.async,
    createPromise = $__1.createPromise,
    timeout = $__1.timeout;
var $__2 = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}),
    streamFilter = $__2.streamFilter,
    simpleHandlerLoader = $__2.simpleHandlerLoader,
    streamHandlerLoader = $__2.streamHandlerLoader,
    inputHandlerMiddleware = $__2.inputHandlerMiddleware;
var $__3 = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}),
    pipeStream = $__3.pipeStream,
    streamToText = $__3.streamToText,
    createChannel = $__3.createChannel,
    pushbackStream = $__3.pushbackStream,
    emptyStreamable = $__3.emptyStreamable,
    streamableToJson = $__3.streamableToJson,
    streamToStreamable = $__3.streamToStreamable;
var extractStreamHead = ($__quiver_45_stream_45_component__ = require("quiver-stream-component"), $__quiver_45_stream_45_component__ && $__quiver_45_stream_45_component__.__esModule && $__quiver_45_stream_45_component__ || {default: $__quiver_45_stream_45_component__}).extractStreamHead;
var $__5 = ($__header_46_js__ = require("./header.js"), $__header_46_js__ && $__header_46_js__.__esModule && $__header_46_js__ || {default: $__header_46_js__}),
    extractHttpHeaders = $__5.extractHttpHeaders,
    parseSubheaders = $__5.parseSubheaders;
var handleMultipart = ($__pipe_45_multipart_46_js__ = require("./pipe-multipart.js"), $__pipe_45_multipart_46_js__ && $__pipe_45_multipart_46_js__.__esModule && $__pipe_45_multipart_46_js__ || {default: $__pipe_45_multipart_46_js__}).handleMultipart;
var multipartType = /^multipart\/form-data/;
var boundaryRegex = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i;
var parseBoundary = (function(contentType) {
  var boundary = parseSubheaders(contentType)[1].boundary;
  if (!boundary)
    throw errror(400, 'no boundary specified');
  var startBoundary = new Buffer('\r\n--' + boundary + '\r\n');
  var endBoundary = new Buffer('\r\n--' + boundary + '--\r\n');
  return [startBoundary, endBoundary];
});
var serializeMultipart = async($traceurRuntime.initGeneratorFunction(function $__9(serializerHandler, readStream, boundaries) {
  var $__7,
      startBoundary,
      endBoundary,
      formData,
      serializedStreams,
      closed,
      readStream,
      headers,
      dispositionHeader,
      disposition,
      $__8,
      name,
      filename,
      serialized,
      value,
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
      $__33;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $__7 = boundaries, startBoundary = $__7[0], endBoundary = $__7[1];
          readStream = pushbackStream(readStream);
          formData = {};
          serializedStreams = [];
          $ctx.state = 56;
          break;
        case 56:
          $ctx.state = (true) ? 5 : -2;
          break;
        case 5:
          $__10 = readStream.peak;
          $__11 = $__10.call(readStream);
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
          $ctx.returnValue = [formData, serializedStreams];
          $ctx.state = -2;
          break;
        case 10:
          $__14 = extractStreamHead(readStream, startBoundary);
          $ctx.state = 17;
          break;
        case 17:
          $ctx.state = 13;
          return $__14;
        case 13:
          $__15 = $ctx.sent;
          $ctx.state = 15;
          break;
        case 15:
          $__16 = $__15[1];
          readStream = $__16;
          $ctx.state = 19;
          break;
        case 19:
          $__17 = extractHttpHeaders(readStream);
          $ctx.state = 25;
          break;
        case 25:
          $ctx.state = 21;
          return $__17;
        case 21:
          $__18 = $ctx.sent;
          $ctx.state = 23;
          break;
        case 23:
          $__7 = $__18;
          $__19 = $__7[0];
          headers = $__19;
          $__20 = $__7[1];
          readStream = $__20;
          $ctx.state = 27;
          break;
        case 27:
          dispositionHeader = headers[$traceurRuntime.toProperty('content-disposition')];
          if (!dispositionHeader)
            throw error(400, 'missing Content-Disposition header');
          $__7 = parseSubheaders(dispositionHeader), disposition = $__7[0], $__8 = $__7[1], name = $__8.name, filename = $__8.filename;
          $ctx.state = 53;
          break;
        case 53:
          $ctx.state = (disposition == 'form-data') ? 48 : 49;
          break;
        case 48:
          $ctx.state = (filename) ? 32 : 42;
          break;
        case 32:
          $__25 = function(partStream) {
            return $__21 = streamToStreamable(partStream), $__22 = serializerHandler({}, $__21), $__23 = $__22.then, $__24 = $__23.call($__22, streamableToJson), $__24;
          };
          $__26 = handleMultipart(readStream, boundary, $__25);
          $ctx.state = 33;
          break;
        case 33:
          $ctx.state = 29;
          return $__26;
        case 29:
          $__27 = $ctx.sent;
          $ctx.state = 31;
          break;
        case 31:
          $__7 = $__27;
          $__28 = $__7[0];
          serialized = $__28;
          $__29 = $__7[1];
          readStream = $__29;
          $ctx.state = 35;
          break;
        case 35:
          serializedStreams.push(serialized);
          $ctx.state = 56;
          break;
        case 42:
          $__30 = handleMultipart(readStream, boundary, streamToText);
          $ctx.state = 43;
          break;
        case 43:
          $ctx.state = 39;
          return $__30;
        case 39:
          $__31 = $ctx.sent;
          $ctx.state = 41;
          break;
        case 41:
          $__7 = $__31;
          $__32 = $__7[0];
          value = $__32;
          $__33 = $__7[1];
          readStream = $__33;
          $ctx.state = 45;
          break;
        case 45:
          if (name) {
            if (formData[$traceurRuntime.toProperty(name)])
              throw error(400, 'repeated multipart field');
            $traceurRuntime.setProperty(formData, name, value);
          }
          $ctx.state = 56;
          break;
        case 49:
          if (disposition == 'file') {
            throw error(501, 'Not Implemented');
          } else {
            throw error(400, 'Bad Content-Disposition');
          }
          $ctx.state = 56;
          break;
        default:
          return $ctx.end();
      }
  }, $__9, this);
}));
var multipartSerializeFilter = (function(serializeHandler) {
  return streamFilter((function(config, handler) {
    var serializerHandler = config.serializerHandler;
    return async($traceurRuntime.initGeneratorFunction(function $__34(args, streamable) {
      var requestHead,
          contentType,
          boundaries,
          readStream,
          $__7,
          formData,
          serialized,
          $__35,
          $__36,
          $__37,
          $__38;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              requestHead = args.requestHead;
              contentType = streamable.contentType;
              console.log('filtering multipart', args, streamable);
              $ctx.state = 19;
              break;
            case 19:
              $ctx.state = (!contentType || !multipartType.test(contentType)) ? 1 : 2;
              break;
            case 1:
              $ctx.returnValue = handler(args, streamable);
              $ctx.state = -2;
              break;
            case 2:
              if (requestHead && requestHead.method != 'POST')
                throw error(405, 'Method Not Allowed');
              boundaries = parseBoundary(contentType);
              $ctx.state = 21;
              break;
            case 21:
              $ctx.state = 5;
              return streamable.toStream();
            case 5:
              readStream = $ctx.sent;
              $ctx.state = 7;
              break;
            case 7:
              $__35 = serializeMultipart(serializerHandler, readStream, contentType);
              $ctx.state = 13;
              break;
            case 13:
              $ctx.state = 9;
              return $__35;
            case 9:
              $__36 = $ctx.sent;
              $ctx.state = 11;
              break;
            case 11:
              $__7 = $__36;
              $__37 = $__7.formData;
              formData = $__37;
              $__38 = $__7.serialized;
              serialized = $__38;
              $ctx.state = 15;
              break;
            case 15:
              args.formData = formData;
              args.serializedStreams = serializedStreams;
              $ctx.state = 23;
              break;
            case 23:
              $ctx.returnValue = handler(args, emptyStreamable());
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, $__34, this);
    }));
  })).addMiddleware(inputHandlerMiddleware(serializeHandler, 'serializerHandler', {handlerLoader: streamHandlerLoader}));
});
