"use strict";
Object.defineProperties(exports, {
  multipartSerializeFilter: {get: function() {
      return multipartSerializeFilter;
    }},
  __esModule: {value: true}
});
var $__busboy__,
    $__dicer__,
    $__quiver_45_promise__,
    $__quiver_45_component__,
    $__quiver_45_stream_45_util__;
var Busboy = ($__busboy__ = require("busboy"), $__busboy__ && $__busboy__.__esModule && $__busboy__ || {default: $__busboy__}).default;
var Dicer = ($__dicer__ = require("dicer"), $__dicer__ && $__dicer__.__esModule && $__dicer__ || {default: $__dicer__}).default;
var $__2 = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}),
    async = $__2.async,
    createPromise = $__2.createPromise,
    timeout = $__2.timeout;
var $__3 = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}),
    streamFilter = $__3.streamFilter,
    simpleHandlerLoader = $__3.simpleHandlerLoader,
    streamHandlerLoader = $__3.streamHandlerLoader,
    inputHandlerMiddleware = $__3.inputHandlerMiddleware;
var $__4 = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}),
    pipeStream = $__4.pipeStream,
    emptyStreamable = $__4.emptyStreamable,
    streamableToJson = $__4.streamableToJson,
    streamToStreamable = $__4.streamToStreamable,
    streamToReusableStreamable = $__4.streamToReusableStreamable,
    nodeToQuiverReadStream = $__4.nodeToQuiverReadStream,
    nodeToQuiverWriteStream = $__4.nodeToQuiverWriteStream;
var multipartType = /^multipart\/form-data/;
var boundaryRegex = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i;
var serializeMultipart = (function(serializerHandler, readStream, contentType) {
  return createPromise((function(resolve, reject) {
    console.log('serializing multipart');
    var matches = boundaryRegex.exec(contentType);
    var dicer = new Dicer({boundary: matches[1] || matches[2]});
    var promises = [];
    var formData = {};
    var serializedStreams = [];
    dicer.on('part', (function(partStream) {
      console.log('handling part', partStream);
      var readStream = nodeToQuiverReadStream(partStream);
      var streamable = streamToReusableStreamable(readStream);
      try {
        console.log('calling serializer', serializerHandler);
        var promise = serializerHandler(args, streamable).then(streamableToJson).then((function(serialized) {
          console.log('done serialized', serialized);
          serializedFiles.push(serialized);
        }));
      } catch (err) {
        console.log('error', err);
        reject(err);
      }
      promises.push(promise);
    }));
    dicer.on('error', (function(err) {
      console.log('error parsing multipart:', err);
      reject(err);
    }));
    var dicerWrite = nodeToQuiverWriteStream(dicer);
    pipeStream(readStream, dicerWrite);
  }));
});
var multipartSerializeFilter = (function(serializeHandler) {
  return streamFilter((function(config, handler) {
    var serializerHandler = config.serializerHandler;
    return async($traceurRuntime.initGeneratorFunction(function $__6(args, streamable) {
      var requestHead,
          contentType,
          readStream,
          $__5,
          formData,
          serializedStreams,
          $__7,
          $__8,
          $__9,
          $__10;
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
              $__7 = serializeMultipart(serializerHandler, readStream, contentType);
              $ctx.state = 13;
              break;
            case 13:
              $ctx.state = 9;
              return $__7;
            case 9:
              $__8 = $ctx.sent;
              $ctx.state = 11;
              break;
            case 11:
              $__5 = $__8;
              $__9 = $__5.formData;
              formData = $__9;
              $__10 = $__5.serializedStreams;
              serializedStreams = $__10;
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
      }, $__6, this);
    }));
  })).addMiddleware(inputHandlerMiddleware(serializeHandler, 'serializerHandler', {handlerLoader: streamHandlerLoader}));
});
