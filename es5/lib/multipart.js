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
    loadStreamHandler = $__2.loadStreamHandler,
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
var $__6 = ($__pipe_45_multipart_46_js__ = require("./pipe-multipart.js"), $__pipe_45_multipart_46_js__ && $__pipe_45_multipart_46_js__.__esModule && $__pipe_45_multipart_46_js__ || {default: $__pipe_45_multipart_46_js__}),
    handleMultipart = $__6.handleMultipart,
    extractMultipart = $__6.extractMultipart;
var multipartType = /^multipart\/form-data/;
var boundaryRegex = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i;
var parseBoundary = (function(contentType) {
  var boundary = parseSubheaders(contentType)[1].boundary;
  if (!boundary)
    throw errror(400, 'no boundary specified');
  return boundary;
});
var newLine = new Buffer('\r\n');
var endBoundary = async($traceurRuntime.initGeneratorFunction(function $__9(readStream) {
  var $__7,
      headBuffer,
      readStream,
      ending,
      $__10,
      $__11,
      $__12,
      $__13;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $__10 = extractStreamHead(readStream, newLine);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__10;
        case 2:
          $__11 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__7 = $__11;
          $__12 = $__7[0];
          headBuffer = $__12;
          $__13 = $__7[1];
          readStream = $__13;
          $ctx.state = 8;
          break;
        case 8:
          ending = headBuffer.toString().trim();
          $ctx.state = 16;
          break;
        case 16:
          $ctx.state = (ending == '') ? 9 : 10;
          break;
        case 9:
          $ctx.returnValue = [false, readStream];
          $ctx.state = -2;
          break;
        case 10:
          $ctx.state = (ending = '--') ? 12 : 13;
          break;
        case 12:
          $ctx.returnValue = [true, readStream];
          $ctx.state = -2;
          break;
        case 13:
          throw error(400, 'Bad Request');
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__9, this);
}));
var serializeMultipart = async($traceurRuntime.initGeneratorFunction(function $__14(serializerHandler, readStream, boundary) {
  var startBoundary,
      formData,
      serializedStreams,
      $__7,
      head,
      readStream,
      ended,
      headers,
      dispositionHeader,
      disposition,
      $__8,
      name,
      filename,
      contentTypeHeader,
      contentType,
      subheaders,
      serialized,
      value,
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
      $__33,
      $__34,
      $__35,
      $__36,
      $__37,
      $__38,
      $__39,
      err;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          startBoundary = new Buffer('\r\n--' + boundary);
          formData = {};
          serializedStreams = [];
          $ctx.state = 67;
          break;
        case 67:
          $__15 = extractStreamHead(readStream, startBoundary);
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
          $__7 = $__16;
          $__17 = $__7[0];
          head = $__17;
          $__18 = $__7[1];
          readStream = $__18;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.pushTry(57, null);
          $ctx.state = 60;
          break;
        case 60:
          $ctx.state = (true) ? 13 : 56;
          break;
        case 13:
          $__19 = endBoundary(readStream);
          $ctx.state = 14;
          break;
        case 14:
          $ctx.state = 10;
          return $__19;
        case 10:
          $__20 = $ctx.sent;
          $ctx.state = 12;
          break;
        case 12:
          $__7 = $__20;
          $__21 = $__7[0];
          ended = $__21;
          $__22 = $__7[1];
          readStream = $__22;
          $ctx.state = 16;
          break;
        case 16:
          $ctx.state = (ended) ? 19 : 18;
          break;
        case 19:
          readStream.closeRead();
          $ctx.state = 20;
          break;
        case 20:
          $ctx.returnValue = [formData, serializedStreams];
          $ctx.state = -2;
          break;
        case 18:
          $__23 = extractHttpHeaders(readStream);
          $ctx.state = 27;
          break;
        case 27:
          $ctx.state = 23;
          return $__23;
        case 23:
          $__24 = $ctx.sent;
          $ctx.state = 25;
          break;
        case 25:
          $__7 = $__24;
          $__25 = $__7[0];
          headers = $__25;
          $__26 = $__7[1];
          readStream = $__26;
          $ctx.state = 29;
          break;
        case 29:
          dispositionHeader = headers[$traceurRuntime.toProperty('content-disposition')];
          if (!dispositionHeader)
            throw error(400, 'missing Content-Disposition header');
          $__7 = parseSubheaders(dispositionHeader), disposition = $__7[0], $__8 = $__7[1], name = $__8.name, filename = $__8.filename;
          if (disposition != 'form-data')
            throw error(400, 'Invalid Content-Disposition');
          if (!name)
            throw error(400, 'Missing name field in Content-Disposition');
          if (formData[$traceurRuntime.toProperty(name)])
            throw error(400, 'repeated multipart field');
          contentTypeHeader = headers[$traceurRuntime.toProperty('content-type')] || 'text/plain';
          $__7 = parseSubheaders(contentTypeHeader), contentType = $__7[0], subheaders = $__7[1];
          $ctx.state = 55;
          break;
        case 55:
          $ctx.state = (contentType == 'multipart/mixed') ? 51 : 50;
          break;
        case 51:
          throw error(501, 'Not Implemented');
          $ctx.state = 60;
          break;
        case 50:
          $ctx.state = (filename) ? 34 : 44;
          break;
        case 34:
          $__31 = function(partStream) {
            return $__27 = streamToStreamable(partStream), $__28 = serializerHandler({}, $__27), $__29 = $__28.then, $__30 = $__29.call($__28, streamableToJson), $__30;
          };
          $__32 = handleMultipart(readStream, startBoundary, $__31);
          $ctx.state = 35;
          break;
        case 35:
          $ctx.state = 31;
          return $__32;
        case 31:
          $__33 = $ctx.sent;
          $ctx.state = 33;
          break;
        case 33:
          $__7 = $__33;
          $__34 = $__7[0];
          serialized = $__34;
          $__35 = $__7[1];
          readStream = $__35;
          $ctx.state = 37;
          break;
        case 37:
          serializedStreams.push(serialized);
          $ctx.state = 60;
          break;
        case 44:
          $__36 = handleMultipart(readStream, startBoundary, streamToText);
          $ctx.state = 45;
          break;
        case 45:
          $ctx.state = 41;
          return $__36;
        case 41:
          $__37 = $ctx.sent;
          $ctx.state = 43;
          break;
        case 43:
          $__7 = $__37;
          $__38 = $__7[0];
          value = $__38;
          $__39 = $__7[1];
          readStream = $__39;
          $ctx.state = 47;
          break;
        case 47:
          $traceurRuntime.setProperty(formData, name, value);
          $ctx.state = 60;
          break;
        case 56:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 57:
          $ctx.popTry();
          err = $ctx.storedException;
          $ctx.state = 63;
          break;
        case 63:
          readStream.closeRead(err);
          throw err;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__14, this);
}));
var multipartSerializeFilter = (function(serializerHandler) {
  return streamFilter((function(config, handler) {
    var serializerHandler = config.serializerHandler;
    return async($traceurRuntime.initGeneratorFunction(function $__40(args, streamable) {
      var requestHead,
          contentType,
          boundary,
          readStream,
          $__7,
          formData,
          serializedStreams,
          $__41,
          $__42,
          $__43,
          $__44;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              requestHead = args.requestHead;
              contentType = streamable.contentType;
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
              boundary = parseBoundary(contentType);
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
              $__41 = serializeMultipart(serializerHandler, readStream, boundary);
              $ctx.state = 13;
              break;
            case 13:
              $ctx.state = 9;
              return $__41;
            case 9:
              $__42 = $ctx.sent;
              $ctx.state = 11;
              break;
            case 11:
              $__7 = $__42;
              $__43 = $__7[0];
              formData = $__43;
              $__44 = $__7[1];
              serializedStreams = $__44;
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
      }, $__40, this);
    }));
  })).addMiddleware(inputHandlerMiddleware(serializerHandler, 'serializerHandler', {loader: loadStreamHandler}));
});
