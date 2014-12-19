"use strict";
var $__quiver_45_core_47_traceur__,
    $__quiver_45_core_47_promise__,
    $__quiver_45_core_47_component__,
    $__quiver_45_stream_45_component__,
    $__quiver_45_core_47_file_45_stream__,
    $___46__46__47_lib_47_http_45_component__,
    $__chai__,
    $__chai_45_as_45_promised__;
($__quiver_45_core_47_traceur__ = require("quiver-core/traceur"), $__quiver_45_core_47_traceur__ && $__quiver_45_core_47_traceur__.__esModule && $__quiver_45_core_47_traceur__ || {default: $__quiver_45_core_47_traceur__});
var async = ($__quiver_45_core_47_promise__ = require("quiver-core/promise"), $__quiver_45_core_47_promise__ && $__quiver_45_core_47_promise__.__esModule && $__quiver_45_core_47_promise__ || {default: $__quiver_45_core_47_promise__}).async;
var $__1 = ($__quiver_45_core_47_component__ = require("quiver-core/component"), $__quiver_45_core_47_component__ && $__quiver_45_core_47_component__.__esModule && $__quiver_45_core_47_component__ || {default: $__quiver_45_core_47_component__}),
    simpleHandler = $__1.simpleHandler,
    loadSimpleHandler = $__1.loadSimpleHandler,
    loadStreamHandler = $__1.loadStreamHandler;
var $__2 = ($__quiver_45_stream_45_component__ = require("quiver-stream-component"), $__quiver_45_stream_45_component__ && $__quiver_45_stream_45_component__.__esModule && $__quiver_45_stream_45_component__ || {default: $__quiver_45_stream_45_component__}),
    sizeWindowedStream = $__2.sizeWindowedStream,
    convertStreamable = $__2.convertStreamable;
var fileStreamable = ($__quiver_45_core_47_file_45_stream__ = require("quiver-core/file-stream"), $__quiver_45_core_47_file_45_stream__ && $__quiver_45_core_47_file_45_stream__.__esModule && $__quiver_45_core_47_file_45_stream__ || {default: $__quiver_45_core_47_file_45_stream__}).fileStreamable;
var multipartSerializeFilter = ($___46__46__47_lib_47_http_45_component__ = require("../lib/http-component"), $___46__46__47_lib_47_http_45_component__ && $___46__46__47_lib_47_http_45_component__.__esModule && $___46__46__47_lib_47_http_45_component__ || {default: $___46__46__47_lib_47_http_45_component__}).multipartSerializeFilter;
var chai = ($__chai__ = require("chai"), $__chai__ && $__chai__.__esModule && $__chai__ || {default: $__chai__}).default;
var chaiAsPromised = ($__chai_45_as_45_promised__ = require("chai-as-promised"), $__chai_45_as_45_promised__ && $__chai_45_as_45_promised__.__esModule && $__chai_45_as_45_promised__ || {default: $__chai_45_as_45_promised__}).default;
chai.use(chaiAsPromised);
var should = chai.should();
describe('multipart test', (function() {
  var sizeWindowStreamable = (function(streamable) {
    return convertStreamable((function(readStream) {
      return sizeWindowedStream(readStream, 3, 5);
    }), streamable);
  });
  it('single file test', async($traceurRuntime.initGeneratorFunction(function $__8() {
    var serializerHandler,
        multipartFilter,
        main,
        handler,
        streamable;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            serializerHandler = simpleHandler((function(args, text) {
              args.name.should.equal('files');
              args.filename.should.equal('file1.txt');
              text.should.equal('Hello World');
              return {name: 'hello.txt'};
            }), 'text', 'json');
            multipartFilter = multipartSerializeFilter().implement({serializerHandler: serializerHandler});
            main = simpleHandler((function(args) {
              var $__7 = args,
                  formData = $__7.formData,
                  serializedParts = $__7.serializedParts;
              formData.username.should.equal('john');
              serializedParts.files.name.should.equal('hello.txt');
            }), 'void', 'void').middleware(multipartFilter);
            $ctx.state = 14;
            break;
          case 14:
            $ctx.state = 2;
            return loadStreamHandler({}, main);
          case 2:
            handler = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = 6;
            return fileStreamable('./test-content/multipart-1.txt');
          case 6:
            streamable = $ctx.sent;
            $ctx.state = 8;
            break;
          case 8:
            streamable = sizeWindowStreamable(streamable);
            streamable.contentType = 'multipart/form-data; boundary=AaB03x';
            $ctx.state = 16;
            break;
          case 16:
            $ctx.state = 10;
            return handler({}, streamable);
          case 10:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__8, this);
  })));
  it('multipart/mixed files test', async($traceurRuntime.initGeneratorFunction(function $__9() {
    var serializerHandler,
        multipartFilter,
        main,
        handler,
        streamable;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            serializerHandler = simpleHandler((function(args, text) {
              var $__7 = args,
                  name = $__7.name,
                  filename = $__7.filename;
              name.should.equal('upload-files');
              if (filename == 'foo.txt') {
                text.should.equal('Foo Content');
                return {id: 'foo'};
              } else if (filename == 'bar.gif') {
                text.should.equal('Bar Content');
                return {id: 'bar'};
              } else {
                throw new Error('Unexpected filename');
              }
            }), 'text', 'json');
            multipartFilter = multipartSerializeFilter().implement({serializerHandler: serializerHandler});
            main = simpleHandler((function(args) {
              var $__7 = args,
                  formData = $__7.formData,
                  serializedParts = $__7.serializedParts;
              formData['user-field'].should.equal('John');
              var files = serializedParts['upload-files'];
              files[0].id.should.equal('foo');
              files[1].id.should.equal('bar');
            }), 'void', 'void').middleware(multipartFilter);
            $ctx.state = 14;
            break;
          case 14:
            $ctx.state = 2;
            return loadStreamHandler({}, main);
          case 2:
            handler = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = 6;
            return fileStreamable('./test-content/multipart-2.txt');
          case 6:
            streamable = $ctx.sent;
            $ctx.state = 8;
            break;
          case 8:
            streamable = sizeWindowStreamable(streamable);
            streamable.contentType = 'multipart/form-data; boundary=AaB03x';
            $ctx.state = 16;
            break;
          case 16:
            $ctx.state = 10;
            return handler({}, streamable);
          case 10:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__9, this);
  })));
}));
