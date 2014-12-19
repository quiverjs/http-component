"use strict";
var $__quiver_45_core_47_traceur__,
    $__quiver_45_core_47_promise__,
    $__quiver_45_core_47_http__,
    $__quiver_45_core_47_component__,
    $__quiver_45_core_47_stream_45_util__,
    $___46__46__47_lib_47_chunked__,
    $__chai__,
    $__chai_45_as_45_promised__;
($__quiver_45_core_47_traceur__ = require("quiver-core/traceur"), $__quiver_45_core_47_traceur__ && $__quiver_45_core_47_traceur__.__esModule && $__quiver_45_core_47_traceur__ || {default: $__quiver_45_core_47_traceur__});
var async = ($__quiver_45_core_47_promise__ = require("quiver-core/promise"), $__quiver_45_core_47_promise__ && $__quiver_45_core_47_promise__.__esModule && $__quiver_45_core_47_promise__ || {default: $__quiver_45_core_47_promise__}).async;
var RequestHead = ($__quiver_45_core_47_http__ = require("quiver-core/http"), $__quiver_45_core_47_http__ && $__quiver_45_core_47_http__.__esModule && $__quiver_45_core_47_http__ || {default: $__quiver_45_core_47_http__}).RequestHead;
var $__2 = ($__quiver_45_core_47_component__ = require("quiver-core/component"), $__quiver_45_core_47_component__ && $__quiver_45_core_47_component__.__esModule && $__quiver_45_core_47_component__ || {default: $__quiver_45_core_47_component__}),
    simpleHandler = $__2.simpleHandler,
    loadHttpHandler = $__2.loadHttpHandler;
var $__3 = ($__quiver_45_core_47_stream_45_util__ = require("quiver-core/stream-util"), $__quiver_45_core_47_stream_45_util__ && $__quiver_45_core_47_stream_45_util__.__esModule && $__quiver_45_core_47_stream_45_util__ || {default: $__quiver_45_core_47_stream_45_util__}),
    textToStream = $__3.textToStream,
    streamToText = $__3.streamToText,
    emptyStreamable = $__3.emptyStreamable,
    buffersToStream = $__3.buffersToStream,
    streamableToText = $__3.streamableToText,
    buffersToStreamable = $__3.buffersToStreamable;
var chunkedResponseFilter = ($___46__46__47_lib_47_chunked__ = require("../lib/chunked"), $___46__46__47_lib_47_chunked__ && $___46__46__47_lib_47_chunked__.__esModule && $___46__46__47_lib_47_chunked__ || {default: $___46__46__47_lib_47_chunked__}).chunkedResponseFilter;
var chai = ($__chai__ = require("chai"), $__chai__ && $__chai__.__esModule && $__chai__ || {default: $__chai__}).default;
var chaiAsPromised = ($__chai_45_as_45_promised__ = require("chai-as-promised"), $__chai_45_as_45_promised__ && $__chai_45_as_45_promised__.__esModule && $__chai_45_as_45_promised__ || {default: $__chai_45_as_45_promised__}).default;
chai.use(chaiAsPromised);
var should = chai.should();
describe('chunked http filter test', (function() {
  it('basic chunked test', async($traceurRuntime.initGeneratorFunction(function $__8() {
    var testBuffers,
        testChunkedContent,
        component,
        handler,
        $__7,
        responseHead,
        responseStreamable,
        $__9,
        $__10,
        $__11,
        $__12,
        $__13,
        $__14;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            testBuffers = ['hello', 'javascript definitely rocks'];
            testChunkedContent = '5\r\nhello\r\n' + '1b\r\njavascript definitely rocks\r\n' + '0\r\n\r\n';
            component = simpleHandler((function(args) {
              return buffersToStream(testBuffers);
            }), 'void', 'stream').middleware(chunkedResponseFilter);
            $ctx.state = 18;
            break;
          case 18:
            $ctx.state = 2;
            return loadHttpHandler({}, component);
          case 2:
            handler = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $__9 = new RequestHead();
            $__10 = emptyStreamable();
            $__11 = handler($__9, $__10);
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
            $__7 = $__12;
            $__13 = $__7[0];
            responseHead = $__13;
            $__14 = $__7[1];
            responseStreamable = $__14;
            $ctx.state = 12;
            break;
          case 12:
            responseHead.getHeader('transfer-encoding').should.equal('chunked');
            $ctx.state = 20;
            break;
          case 20:
            $ctx.state = 14;
            return streamableToText(responseStreamable).should.eventually.equal(testChunkedContent);
          case 14:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__8, this);
  })));
  it('skip when content-length set', async($traceurRuntime.initGeneratorFunction(function $__15() {
    var testContent,
        component,
        handler,
        $__7,
        responseHead,
        responseStreamable,
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
            testContent = 'Hello World';
            component = simpleHandler((function(args) {
              return testContent;
            }), 'void', 'text').middleware(chunkedResponseFilter);
            $ctx.state = 18;
            break;
          case 18:
            $ctx.state = 2;
            return loadHttpHandler({}, component);
          case 2:
            handler = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $__16 = new RequestHead();
            $__17 = emptyStreamable();
            $__18 = handler($__16, $__17);
            $ctx.state = 10;
            break;
          case 10:
            $ctx.state = 6;
            return $__18;
          case 6:
            $__19 = $ctx.sent;
            $ctx.state = 8;
            break;
          case 8:
            $__7 = $__19;
            $__20 = $__7[0];
            responseHead = $__20;
            $__21 = $__7[1];
            responseStreamable = $__21;
            $ctx.state = 12;
            break;
          case 12:
            should.not.exist(responseHead.getHeader('transfer-encoding'));
            responseHead.getHeader('content-length').should.equal('' + testContent.length);
            $ctx.state = 20;
            break;
          case 20:
            $ctx.state = 14;
            return streamableToText(responseStreamable).should.eventually.equal(testContent);
          case 14:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__15, this);
  })));
}));
