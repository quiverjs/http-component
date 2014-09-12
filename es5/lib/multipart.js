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
var parseSubheaders = ($__header_46_js__ = require("./header.js"), $__header_46_js__ && $__header_46_js__.__esModule && $__header_46_js__ || {default: $__header_46_js__}).parseSubheaders;
var extractMultipart = ($__pipe_45_multipart_46_js__ = require("./pipe-multipart.js"), $__pipe_45_multipart_46_js__ && $__pipe_45_multipart_46_js__.__esModule && $__pipe_45_multipart_46_js__ || {default: $__pipe_45_multipart_46_js__}).extractMultipart;
var multipartType = /^multipart\/form-data/;
var boundaryRegex = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i;
var parseBoundary = (function(contentType) {
  var boundary = parseSubheaders(contentType)[1].boundary;
  if (!boundary)
    throw errror(400, 'no boundary specified');
  return boundary;
});
var parseMultipartHeaders = (function(headers) {
  var dispositionHeader = headers[$traceurRuntime.toProperty('content-disposition')];
  if (!dispositionHeader)
    throw error(400, 'missing Content-Disposition header');
  var $__7 = parseSubheaders(dispositionHeader),
      disposition = $__7[0],
      dispositionHeaders = $__7[1];
  if (disposition != 'form-data')
    throw error(400, 'Invalid Content-Disposition');
  var contentTypeHeader = headers[$traceurRuntime.toProperty('content-type')] || 'text/plain';
  var $__7 = parseSubheaders(contentTypeHeader),
      contentType = $__7[0],
      contentTypeHeaders = $__7[1];
  return {
    disposition: disposition,
    dispositionHeaders: dispositionHeaders,
    contentType: contentType,
    contentTypeHeaders: contentTypeHeaders
  };
});
var serializeMultipart = async($traceurRuntime.initGeneratorFunction(function $__9(serializerHandler, readStream, boundary) {
  var beginBoundary,
      startBoundary,
      formData,
      serializedParts,
      $__7,
      head,
      readStream,
      ended,
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
      $__33,
      $__34,
      $__35,
      $__36,
      $__37,
      $__38,
      $__39,
      $__40,
      $__41,
      $__42,
      $__43,
      err;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          beginBoundary = new Buffer('\r\n--' + boundary + '\r\n');
          startBoundary = new Buffer('\r\n--' + boundary);
          formData = {};
          serializedParts = {};
          $ctx.state = 33;
          break;
        case 33:
          $__11 = extractStreamHead(readStream, beginBoundary);
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
          $__7 = $__12;
          $__13 = $__7[0];
          head = $__13;
          $__14 = $__7[1];
          readStream = $__14;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.pushTry(23, null);
          $ctx.state = 26;
          break;
        case 26:
          $ctx.state = (true) ? 13 : 22;
          break;
        case 13:
          $__15 = $traceurRuntime.initGeneratorFunction;
          $__38 = $__15.call($traceurRuntime, function $__10(headers, partStream) {
            var $__8,
                dispositionHeaders,
                contentType,
                contentTypeHeaders,
                name,
                filename,
                serialized;
            return $__16 = $traceurRuntime.createGeneratorInstance, $__37 = $__16.call($traceurRuntime, function($ctx) {
              while (true)
                switch ($__17 = $ctx.state, $__17) {
                  case 0:
                    $__18 = parseMultipartHeaders(headers), $__8 = $__18, $__19 = $__8.dispositionHeaders, dispositionHeaders = $__19, $__20 = $__8.contentType, contentType = $__20, $__21 = $__8.contentTypeHeaders, contentTypeHeaders = $__21, $__21;
                    $__8 = dispositionHeaders, $__22 = $__8.name, name = $__22, $__23 = $__8.filename, filename = $__23, $__23;
                    if (!name)
                      throw $__24 = error(400, 'Missing name field in Content-Disposition'), $__24;
                    if ($__25 = formData[$traceurRuntime.toProperty(name)], $__25)
                      throw $__26 = error(400, 'duplicate multipart field'), $__26;
                    $ctx.state = 16, 16;
                    break;
                  case 16:
                    $ctx.state = (contentType == 'multipart/mixed') ? 12 : 11, (contentType == 'multipart/mixed') ? 12 : 11;
                    break;
                  case 12:
                    throw $__27 = error(501, 'Not Implemented'), $__27;
                    $ctx.state = -2, -2;
                    break;
                  case 11:
                    $ctx.state = (filename) ? 1 : 7, (filename) ? 1 : 7;
                    break;
                  case 1:
                    $ctx.state = 2, 2;
                    return $__28 = streamToStreamable(partStream), $__29 = serializerHandler({
                      name: name,
                      filename: filename
                    }, $__28), $__30 = $__29.then, $__31 = $__30.call($__29, streamableToJson), $__31;
                  case 2:
                    $__32 = $ctx.sent, serialized = $__32, $__32;
                    $ctx.state = 4, 4;
                    break;
                  case 4:
                    $traceurRuntime.setProperty(serializedParts, name, serialized), serialized;
                    $ctx.state = -2, -2;
                    break;
                  case 7:
                    $ctx.state = 8, 8;
                    return $__33 = streamToText(partStream), $__33;
                  case 8:
                    $__34 = $ctx.sent, $traceurRuntime.setProperty(formData, name, $__34), $__34;
                    $ctx.state = -2, -2;
                    break;
                  default:
                    return $__35 = $ctx.end, $__36 = $__35.call($ctx), $__36;
                }
            }, $__10, this), $__37;
          });
          $__39 = async($__38);
          $__40 = extractMultipart(readStream, startBoundary, $__39);
          $ctx.state = 14;
          break;
        case 14:
          $ctx.state = 10;
          return $__40;
        case 10:
          $__41 = $ctx.sent;
          $ctx.state = 12;
          break;
        case 12:
          $__7 = $__41;
          $__42 = $__7[1];
          readStream = $__42;
          $__43 = $__7[2];
          ended = $__43;
          $ctx.state = 16;
          break;
        case 16:
          $ctx.state = (ended) ? 19 : 26;
          break;
        case 19:
          readStream.closeRead();
          $ctx.state = 20;
          break;
        case 20:
          $ctx.returnValue = [formData, serializedParts];
          $ctx.state = -2;
          break;
        case 22:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 23:
          $ctx.popTry();
          err = $ctx.storedException;
          $ctx.state = 29;
          break;
        case 29:
          readStream.closeRead(err);
          throw err;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__9, this);
}));
var multipartSerializeFilter = (function(serializerHandler) {
  return streamFilter((function(config, handler) {
    var serializerHandler = config.serializerHandler;
    return async($traceurRuntime.initGeneratorFunction(function $__10(args, streamable) {
      var requestHead,
          contentType,
          boundary,
          readStream,
          $__7,
          formData,
          serializedParts,
          $__44,
          $__45,
          $__46,
          $__47;
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
              $__44 = serializeMultipart(serializerHandler, readStream, boundary);
              $ctx.state = 13;
              break;
            case 13:
              $ctx.state = 9;
              return $__44;
            case 9:
              $__45 = $ctx.sent;
              $ctx.state = 11;
              break;
            case 11:
              $__7 = $__45;
              $__46 = $__7[0];
              formData = $__46;
              $__47 = $__7[1];
              serializedParts = $__47;
              $ctx.state = 15;
              break;
            case 15:
              args.formData = formData;
              args.serializedParts = serializedParts;
              $ctx.state = 23;
              break;
            case 23:
              $ctx.returnValue = handler(args, emptyStreamable());
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, $__10, this);
    }));
  })).addMiddleware(inputHandlerMiddleware(serializerHandler, 'serializerHandler', {loader: loadStreamHandler}));
});
