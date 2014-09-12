"use strict";
var $__traceur_64_0_46_0_46_58__,
    $__quiver_45_promise__,
    $__quiver_45_component__,
    $__quiver_45_file_45_stream__,
    $___46__46__47_lib_47_multipart_46_js__,
    $__chai__,
    $__chai_45_as_45_promised__;
($__traceur_64_0_46_0_46_58__ = require("traceur"), $__traceur_64_0_46_0_46_58__ && $__traceur_64_0_46_0_46_58__.__esModule && $__traceur_64_0_46_0_46_58__ || {default: $__traceur_64_0_46_0_46_58__});
var async = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}).async;
var $__1 = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}),
    simpleHandler = $__1.simpleHandler,
    loadSimpleHandler = $__1.loadSimpleHandler,
    loadStreamHandler = $__1.loadStreamHandler;
var fileStreamable = ($__quiver_45_file_45_stream__ = require("quiver-file-stream"), $__quiver_45_file_45_stream__ && $__quiver_45_file_45_stream__.__esModule && $__quiver_45_file_45_stream__ || {default: $__quiver_45_file_45_stream__}).fileStreamable;
var multipartSerializeFilter = ($___46__46__47_lib_47_multipart_46_js__ = require("../lib/multipart.js"), $___46__46__47_lib_47_multipart_46_js__ && $___46__46__47_lib_47_multipart_46_js__.__esModule && $___46__46__47_lib_47_multipart_46_js__ || {default: $___46__46__47_lib_47_multipart_46_js__}).multipartSerializeFilter;
var chai = ($__chai__ = require("chai"), $__chai__ && $__chai__.__esModule && $__chai__ || {default: $__chai__}).default;
var chaiAsPromised = ($__chai_45_as_45_promised__ = require("chai-as-promised"), $__chai_45_as_45_promised__ && $__chai_45_as_45_promised__.__esModule && $__chai_45_as_45_promised__ || {default: $__chai_45_as_45_promised__}).default;
chai.use(chaiAsPromised);
var should = chai.should();
describe('multipart test', (function() {
  it('single file test', async($traceurRuntime.initGeneratorFunction(function $__7() {
    var serializer,
        main,
        handler,
        streamable;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            serializer = simpleHandler((function(args, text) {
              args.name.should.equal('files');
              args.filename.should.equal('file1.txt');
              text.should.equal('Hello World');
              return {name: 'hello.txt'};
            }), 'text', 'json');
            main = simpleHandler((function(args) {
              var $__6 = args,
                  formData = $__6.formData,
                  serializedParts = $__6.serializedParts;
              formData.username.should.equal('john');
              serializedParts.files.name.should.equal('hello.txt');
            }), 'void', 'void').addMiddleware(multipartSerializeFilter(serializer));
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
    }, $__7, this);
  })));
}));
