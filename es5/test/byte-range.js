"use strict";
var $__quiver_45_core_47_traceur__,
    $__quiver_45_core_47_promise__,
    $__quiver_45_core_47_http__,
    $__quiver_45_core_47_component__,
    $__quiver_45_core_47_stream_45_util__,
    $___46__46__47_lib_47_byte_45_range__,
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
var $__4 = ($___46__46__47_lib_47_byte_45_range__ = require("../lib/byte-range"), $___46__46__47_lib_47_byte_45_range__ && $___46__46__47_lib_47_byte_45_range__.__esModule && $___46__46__47_lib_47_byte_45_range__ || {default: $___46__46__47_lib_47_byte_45_range__}),
    byteRangeStream = $__4.byteRangeStream,
    byteRangeFilter = $__4.byteRangeFilter;
var chai = ($__chai__ = require("chai"), $__chai__ && $__chai__.__esModule && $__chai__ || {default: $__chai__}).default;
var chaiAsPromised = ($__chai_45_as_45_promised__ = require("chai-as-promised"), $__chai_45_as_45_promised__ && $__chai_45_as_45_promised__.__esModule && $__chai_45_as_45_promised__ || {default: $__chai_45_as_45_promised__}).default;
chai.use(chaiAsPromised);
var should = chai.should();
describe('byte range test', (function() {
  var testContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
  var expectedSlice = 'dolor sit amet';
  var start = 12;
  var end = 26;
  var testRangeStream = (function(readStream) {
    var rangeStream = byteRangeStream(readStream, start, end);
    return streamToText(rangeStream).should.eventually.equal(expectedSlice);
  });
  it('basic range test', async($traceurRuntime.initGeneratorFunction(function $__10() {
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.state = 2;
            return testRangeStream(textToStream(testContent));
          case 2:
            $ctx.maybeThrow();
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = 6;
            return testRangeStream(buffersToStream(['Lorem ip', 'sum dol', 'or sit a', 'met, consectetur', ' adipiscing elit.']));
          case 6:
            $ctx.maybeThrow();
            $ctx.state = 8;
            break;
          case 8:
            $ctx.state = 10;
            return testRangeStream(buffersToStream(['Lorem ', 'ipsum ', 'dolor sit', ' amet, consec', 'tetur adipiscing elit.']));
          case 10:
            $ctx.maybeThrow();
            $ctx.state = 12;
            break;
          case 12:
            $ctx.state = 14;
            return testRangeStream(buffersToStream(['Lorem ip', 'sum dol', 'or sit ', 'amet', ', consectetur ', 'adipiscing elit.']));
          case 14:
            $ctx.maybeThrow();
            $ctx.state = 16;
            break;
          case 16:
            $ctx.state = 18;
            return testRangeStream(buffersToStream(['Lorem ', 'ipsum ', 'dolor sit', ' amet', ', consectetur ', 'adipiscing elit.']));
          case 18:
            $ctx.maybeThrow();
            $ctx.state = 20;
            break;
          case 20:
            $ctx.state = 22;
            return testRangeStream(buffersToStream(['Lorem ', 'ipsum dolor sit amet, consec', 'tetur adip', 'iscing elit.']));
          case 22:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__10, this);
  })));
  it('test range filter', async($traceurRuntime.initGeneratorFunction(function $__11() {
    var component,
        handler,
        $__7,
        responseHead,
        responseStreamable,
        requestHead,
        $__8,
        $__9,
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
        err;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            component = simpleHandler((function(args) {
              var streamable = buffersToStreamable(['Lorem ip', 'sum dol', 'or sit a', 'met, consectetur', ' adipiscing elit.']);
              streamable.contentLength = testContent.length;
              return streamable;
            }), 'void', 'streamable').middleware(byteRangeFilter);
            $ctx.state = 49;
            break;
          case 49:
            $ctx.state = 2;
            return loadHttpHandler({}, component);
          case 2:
            handler = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $__12 = new RequestHead();
            $__13 = emptyStreamable();
            $__14 = handler($__12, $__13);
            $ctx.state = 10;
            break;
          case 10:
            $ctx.state = 6;
            return $__14;
          case 6:
            $__15 = $ctx.sent;
            $ctx.state = 8;
            break;
          case 8:
            $__7 = $__15;
            $__16 = $__7[0];
            responseHead = $__16;
            $__17 = $__7[1];
            responseStreamable = $__17;
            $ctx.state = 12;
            break;
          case 12:
            responseHead.statusCode.should.equal(200);
            responseHead.getHeader('content-length').should.equal('' + testContent.length);
            should.not.exist(responseHead.getHeader('accept-ranges'));
            $ctx.state = 51;
            break;
          case 51:
            $ctx.state = 14;
            return streamableToText(responseStreamable).should.eventually.equal(testContent);
          case 14:
            $ctx.maybeThrow();
            $ctx.state = 16;
            break;
          case 16:
            requestHead = new RequestHead({headers: {range: 'bytes=' + start + '-' + (end - 1)}});
            $ctx.state = 53;
            break;
          case 53:
            $__18 = emptyStreamable();
            $__19 = handler(requestHead, $__18);
            $ctx.state = 22;
            break;
          case 22:
            $ctx.state = 18;
            return $__19;
          case 18:
            $__20 = $ctx.sent;
            $ctx.state = 20;
            break;
          case 20:
            $__8 = $__20;
            $__21 = $__8[0];
            responseHead = $__21;
            $__22 = $__8[1];
            responseStreamable = $__22;
            $ctx.state = 24;
            break;
          case 24:
            responseHead.statusCode.should.equal(206);
            responseHead.getHeader('content-length').should.equal('' + expectedSlice.length);
            responseHead.getHeader('content-range').should.equal('bytes ' + start + '-' + (end - 1) + '/' + testContent.length);
            $ctx.state = 55;
            break;
          case 55:
            $ctx.state = 26;
            return streamableToText(responseStreamable).should.eventually.equal(expectedSlice);
          case 26:
            $ctx.maybeThrow();
            $ctx.state = 28;
            break;
          case 28:
            requestHead = new RequestHead({headers: {range: 'bytes=' + start + '-' + (testContent.length + 10)}});
            $ctx.state = 57;
            break;
          case 57:
            $ctx.pushTry(39, null);
            $ctx.state = 42;
            break;
          case 42:
            $__23 = emptyStreamable();
            $__24 = handler(requestHead, $__23);
            $ctx.state = 34;
            break;
          case 34:
            $ctx.state = 30;
            return $__24;
          case 30:
            $__25 = $ctx.sent;
            $ctx.state = 32;
            break;
          case 32:
            $__9 = $__25;
            $__26 = $__9[0];
            responseHead = $__26;
            $__27 = $__9[1];
            responseStreamable = $__27;
            $ctx.state = 36;
            break;
          case 36:
            throw new Error('should not reach');
            $ctx.state = 38;
            break;
          case 38:
            $ctx.popTry();
            $ctx.state = -2;
            break;
          case 39:
            $ctx.popTry();
            err = $ctx.storedException;
            $ctx.state = 45;
            break;
          case 45:
            err.errorCode.should.equal(416);
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__11, this);
  })));
}));
