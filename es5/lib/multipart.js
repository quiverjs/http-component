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
    $__multipart_45_stream_46_js__;
var error = ($__quiver_45_error__ = require("quiver-error"), $__quiver_45_error__ && $__quiver_45_error__.__esModule && $__quiver_45_error__ || {default: $__quiver_45_error__}).error;
var $__1 = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}),
    async = $__1.async,
    createPromise = $__1.createPromise,
    timeout = $__1.timeout;
var $__2 = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}),
    streamFilter = $__2.streamFilter,
    simpleHandlerLoader = $__2.simpleHandlerLoader,
    inputHandlerMiddleware = $__2.inputHandlerMiddleware;
var $__3 = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}),
    pipeStream = $__3.pipeStream,
    streamToText = $__3.streamToText,
    createChannel = $__3.createChannel,
    pushbackStream = $__3.pushbackStream,
    emptyStreamable = $__3.emptyStreamable,
    streamableToJson = $__3.streamableToJson,
    streamableToText = $__3.streamableToText,
    streamToStreamable = $__3.streamToStreamable;
var extractStreamHead = ($__quiver_45_stream_45_component__ = require("quiver-stream-component"), $__quiver_45_stream_45_component__ && $__quiver_45_stream_45_component__.__esModule && $__quiver_45_stream_45_component__ || {default: $__quiver_45_stream_45_component__}).extractStreamHead;
var parseSubheaders = ($__header_46_js__ = require("./header.js"), $__header_46_js__ && $__header_46_js__.__esModule && $__header_46_js__ || {default: $__header_46_js__}).parseSubheaders;
var extractAllMultipart = ($__multipart_45_stream_46_js__ = require("./multipart-stream.js"), $__multipart_45_stream_46_js__ && $__multipart_45_stream_46_js__.__esModule && $__multipart_45_stream_46_js__ || {default: $__multipart_45_stream_46_js__}).extractAllMultipart;
var multipartType = /^multipart\/form-data/;
var parseBoundary = (function(contentType) {
  var boundary = parseSubheaders(contentType)[1].boundary;
  if (!boundary)
    throw errror(400, 'no boundary specified');
  return boundary;
});
var formatStreamable = (function(streamable) {
  if (streamable.contentType == 'application/json') {
    return streamableToJson(streamable);
  } else {
    return streamableToText(streamable);
  }
});
var parseMultipartHeaders = (function(headers) {
  var dispositionHeader = headers['content-disposition'];
  if (!dispositionHeader)
    throw error(400, 'missing Content-Disposition header');
  var $__7 = parseSubheaders(dispositionHeader),
      disposition = $__7[0],
      dispositionHeaders = $__7[1];
  var contentTypeHeader = headers['content-type'];
  if (contentTypeHeader) {
    var $__8 = parseSubheaders(contentTypeHeader),
        contentType = $__8[0],
        contentTypeHeaders = $__8[1];
  } else {
    var contentType = 'text/plain';
    var contentTypeHeaders = {};
  }
  return {
    disposition: disposition,
    dispositionHeaders: dispositionHeaders,
    contentType: contentType,
    contentTypeHeaders: contentTypeHeaders
  };
});
var serializeMultipart = async($traceurRuntime.initGeneratorFunction(function $__10(serializerHandler, readStream, boundary) {
  var formData,
      serializedParts,
      mixedPartHandler,
      handlePartStream;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          formData = {};
          serializedParts = {};
          mixedPartHandler = (function(name) {
            return async($traceurRuntime.initGeneratorFunction(function $__11(headers, partStream) {
              var $__7,
                  disposition,
                  dispositionHeaders,
                  contentType,
                  contentTypeHeaders,
                  filename;
              return $traceurRuntime.createGeneratorInstance(function($ctx) {
                while (true)
                  switch ($ctx.state) {
                    case 0:
                      $__7 = parseMultipartHeaders(headers), disposition = $__7.disposition, dispositionHeaders = $__7.dispositionHeaders, contentType = $__7.contentType, contentTypeHeaders = $__7.contentTypeHeaders;
                      if (disposition != 'file')
                        throw error(400, 'Invalid Content-Disposition');
                      filename = dispositionHeaders.filename;
                      if (!filename)
                        throw error(400, 'Missing upload file name');
                      $ctx.state = 4;
                      break;
                    case 4:
                      $ctx.returnValue = serializerHandler({
                        name: name,
                        filename: filename,
                        contentType: contentType
                      }, partStream).then(formatStreamable);
                      $ctx.state = -2;
                      break;
                    default:
                      return $ctx.end();
                  }
              }, $__11, this);
            }));
          });
          handlePartStream = async($traceurRuntime.initGeneratorFunction(function $__11(headers, partStream) {
            var $__7,
                disposition,
                dispositionHeaders,
                contentType,
                contentTypeHeaders,
                $__8,
                name,
                filename,
                boundary,
                serialized,
                field;
            return $traceurRuntime.createGeneratorInstance(function($ctx) {
              while (true)
                switch ($ctx.state) {
                  case 0:
                    $__7 = parseMultipartHeaders(headers), disposition = $__7.disposition, dispositionHeaders = $__7.dispositionHeaders, contentType = $__7.contentType, contentTypeHeaders = $__7.contentTypeHeaders;
                    if (disposition != 'form-data')
                      throw error(400, 'Invalid Content-Disposition');
                    $__8 = dispositionHeaders, name = $__8.name, filename = $__8.filename;
                    if (!name)
                      throw error(400, 'Missing name field in Content-Disposition');
                    if (formData[name])
                      throw error(400, 'duplicate multipart field');
                    $ctx.state = 20;
                    break;
                  case 20:
                    $ctx.state = (contentType == 'multipart/mixed') ? 5 : 17;
                    break;
                  case 5:
                    boundary = contentTypeHeaders['boundary'];
                    if (!boundary)
                      throw error(400, 'Missing multipart boundary');
                    $ctx.state = 6;
                    break;
                  case 6:
                    $ctx.state = 2;
                    return extractAllMultipart(partStream, boundary, mixedPartHandler(name));
                  case 2:
                    serializedParts[name] = $ctx.sent;
                    $ctx.state = -2;
                    break;
                  case 17:
                    $ctx.state = (filename) ? 7 : 13;
                    break;
                  case 7:
                    $ctx.state = 8;
                    return serializerHandler({
                      name: name,
                      filename: filename,
                      contentType: contentType
                    }, partStream).then(formatStreamable);
                  case 8:
                    serialized = $ctx.sent;
                    $ctx.state = 10;
                    break;
                  case 10:
                    field = serializedParts[name];
                    if (!field) {
                      serializedParts[name] = serialized;
                    } else if (Array.isArray(field)) {
                      field.push(serialized);
                    } else {
                      serializedParts[name] = [field, serialized];
                    }
                    $ctx.state = -2;
                    break;
                  case 13:
                    $ctx.state = 14;
                    return streamToText(partStream);
                  case 14:
                    formData[name] = $ctx.sent;
                    $ctx.state = -2;
                    break;
                  default:
                    return $ctx.end();
                }
            }, $__11, this);
          }));
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = 2;
          return extractAllMultipart(readStream, boundary, handlePartStream);
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
  }, $__10, this);
}));
var multipartSerializeFilter = (function(serializerHandler) {
  return streamFilter((function(config, handler) {
    var serializerHandler = config.serializerHandler;
    return async($traceurRuntime.initGeneratorFunction(function $__11(args, streamable) {
      var requestHead,
          contentType,
          boundary,
          readStream,
          $__9,
          formData,
          serializedParts,
          $__12,
          $__13,
          $__14,
          $__15;
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
              $__12 = serializeMultipart(serializerHandler, readStream, boundary);
              $ctx.state = 13;
              break;
            case 13:
              $ctx.state = 9;
              return $__12;
            case 9:
              $__13 = $ctx.sent;
              $ctx.state = 11;
              break;
            case 11:
              $__9 = $__13;
              $__14 = $__9[0];
              formData = $__14;
              $__15 = $__9[1];
              serializedParts = $__15;
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
      }, $__11, this);
    }));
  })).addMiddleware(inputHandlerMiddleware(serializerHandler, 'serializerHandler', {loader: simpleHandlerLoader('stream', 'streamable')}));
});
