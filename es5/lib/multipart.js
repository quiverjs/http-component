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
var extractAllMultipart = ($__pipe_45_multipart_46_js__ = require("./pipe-multipart.js"), $__pipe_45_multipart_46_js__ && $__pipe_45_multipart_46_js__.__esModule && $__pipe_45_multipart_46_js__ || {default: $__pipe_45_multipart_46_js__}).extractAllMultipart;
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
      handlePartStream;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          beginBoundary = new Buffer('\r\n--' + boundary + '\r\n');
          startBoundary = new Buffer('\r\n--' + boundary);
          formData = {};
          serializedParts = {};
          handlePartStream = async($traceurRuntime.initGeneratorFunction(function $__10(headers, partStream) {
            var $__7,
                dispositionHeaders,
                contentType,
                contentTypeHeaders,
                name,
                filename,
                serialized;
            return $traceurRuntime.createGeneratorInstance(function($ctx) {
              while (true)
                switch ($ctx.state) {
                  case 0:
                    $__7 = parseMultipartHeaders(headers), dispositionHeaders = $__7.dispositionHeaders, contentType = $__7.contentType, contentTypeHeaders = $__7.contentTypeHeaders;
                    $__7 = dispositionHeaders, name = $__7.name, filename = $__7.filename;
                    if (!name)
                      throw error(400, 'Missing name field in Content-Disposition');
                    if (formData[$traceurRuntime.toProperty(name)])
                      throw error(400, 'duplicate multipart field');
                    $ctx.state = 16;
                    break;
                  case 16:
                    $ctx.state = (contentType == 'multipart/mixed') ? 12 : 11;
                    break;
                  case 12:
                    throw error(501, 'Not Implemented');
                    $ctx.state = -2;
                    break;
                  case 11:
                    $ctx.state = (filename) ? 1 : 7;
                    break;
                  case 1:
                    $ctx.state = 2;
                    return serializerHandler({
                      name: name,
                      filename: filename
                    }, streamToStreamable(partStream)).then(streamableToJson);
                  case 2:
                    serialized = $ctx.sent;
                    $ctx.state = 4;
                    break;
                  case 4:
                    $traceurRuntime.setProperty(serializedParts, name, serialized);
                    $ctx.state = -2;
                    break;
                  case 7:
                    $ctx.state = 8;
                    return streamToText(partStream);
                  case 8:
                    $traceurRuntime.setProperty(formData, name, $ctx.sent);
                    $ctx.state = -2;
                    break;
                  default:
                    return $ctx.end();
                }
            }, $__10, this);
          }));
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = 2;
          return extractAllMultipart(readStream, startBoundary, handlePartStream);
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          $ctx.returnValue = [formData, serializedParts];
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
          $__11,
          $__12,
          $__13,
          $__14;
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
              $__11 = serializeMultipart(serializerHandler, readStream, boundary);
              $ctx.state = 13;
              break;
            case 13:
              $ctx.state = 9;
              return $__11;
            case 9:
              $__12 = $ctx.sent;
              $ctx.state = 11;
              break;
            case 11:
              $__7 = $__12;
              $__13 = $__7[0];
              formData = $__13;
              $__14 = $__7[1];
              serializedParts = $__14;
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
