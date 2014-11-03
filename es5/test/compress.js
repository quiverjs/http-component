"use strict";
var $__traceur_64_0_46_0_46_7__,
    $__fs__,
    $__zlib__,
    $__buffertools__,
    $__quiver_45_promise__,
    $__quiver_45_http__,
    $__quiver_45_component__,
    $__quiver_45_stream_45_util__,
    $___46__46__47_lib_47_compress__,
    $__chai__,
    $__chai_45_as_45_promised__;
($__traceur_64_0_46_0_46_7__ = require("traceur"), $__traceur_64_0_46_0_46_7__ && $__traceur_64_0_46_0_46_7__.__esModule && $__traceur_64_0_46_0_46_7__ || {default: $__traceur_64_0_46_0_46_7__});
var fs = ($__fs__ = require("fs"), $__fs__ && $__fs__.__esModule && $__fs__ || {default: $__fs__}).default;
var zlib = ($__zlib__ = require("zlib"), $__zlib__ && $__zlib__.__esModule && $__zlib__ || {default: $__zlib__}).default;
var buffertools = ($__buffertools__ = require("buffertools"), $__buffertools__ && $__buffertools__.__esModule && $__buffertools__ || {default: $__buffertools__}).default;
var $__3 = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}),
    async = $__3.async,
    promisify = $__3.promisify;
var RequestHead = ($__quiver_45_http__ = require("quiver-http"), $__quiver_45_http__ && $__quiver_45_http__.__esModule && $__quiver_45_http__ || {default: $__quiver_45_http__}).RequestHead;
var $__5 = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}),
    simpleHandler = $__5.simpleHandler,
    loadHttpHandler = $__5.loadHttpHandler;
var $__6 = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}),
    emptyStreamable = $__6.emptyStreamable,
    streamableToText = $__6.streamableToText,
    streamableToBuffer = $__6.streamableToBuffer;
var $__7 = ($___46__46__47_lib_47_compress__ = require("../lib/compress"), $___46__46__47_lib_47_compress__ && $___46__46__47_lib_47_compress__.__esModule && $___46__46__47_lib_47_compress__ || {default: $___46__46__47_lib_47_compress__}),
    httpCompressFilter = $__7.httpCompressFilter,
    selectAcceptEncoding = $__7.selectAcceptEncoding;
var chai = ($__chai__ = require("chai"), $__chai__ && $__chai__.__esModule && $__chai__ || {default: $__chai__}).default;
var chaiAsPromised = ($__chai_45_as_45_promised__ = require("chai-as-promised"), $__chai_45_as_45_promised__ && $__chai_45_as_45_promised__.__esModule && $__chai_45_as_45_promised__ || {default: $__chai_45_as_45_promised__}).default;
chai.use(chaiAsPromised);
var should = chai.should();
var expect = chai.expect;
var gzip = promisify(zlib.gzip);
var gunzip = promisify(zlib.gunzip);
var testContent = fs.readFileSync('test-content/ipsum.txt').toString();
describe('http compress test', (function() {
  it('accept-encoding test', (function() {
    selectAcceptEncoding('gzip').should.equal('gzip');
    selectAcceptEncoding('identity').should.equal('identity');
    selectAcceptEncoding('gzip;q=0').should.equal('identity');
    selectAcceptEncoding('*').should.equal('gzip');
    selectAcceptEncoding('gzip, *;q=0').should.equal('gzip');
    selectAcceptEncoding('identity;q=0.5, *;q=0').should.equal('identity');
    selectAcceptEncoding('identity;q=0, *').should.equal('gzip');
    selectAcceptEncoding('gzip;q=0, *;q=1.0').should.equal('identity');
    expect((function() {
      return selectAcceptEncoding('identity;q=0');
    })).to.throw();
    expect((function() {
      return selectAcceptEncoding('*;q=0');
    })).to.throw();
  }));
  it('basic test', async($traceurRuntime.initGeneratorFunction(function $__13() {
    var compressed,
        component,
        handler,
        $__10,
        responseHead,
        responseStreamable,
        requestHead,
        $__11,
        buffer,
        $__12,
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
        $__29;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.state = 2;
            return gzip(testContent);
          case 2:
            compressed = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            component = simpleHandler((function(args) {
              return testContent;
            }), 'void', 'text').addMiddleware(httpCompressFilter);
            $ctx.state = 50;
            break;
          case 50:
            $ctx.state = 6;
            return loadHttpHandler({}, component);
          case 6:
            handler = $ctx.sent;
            $ctx.state = 8;
            break;
          case 8:
            $__14 = new RequestHead();
            $__15 = emptyStreamable();
            $__16 = handler($__14, $__15);
            $ctx.state = 14;
            break;
          case 14:
            $ctx.state = 10;
            return $__16;
          case 10:
            $__17 = $ctx.sent;
            $ctx.state = 12;
            break;
          case 12:
            $__10 = $__17;
            $__18 = $__10[0];
            responseHead = $__18;
            $__19 = $__10[1];
            responseStreamable = $__19;
            $ctx.state = 16;
            break;
          case 16:
            should.not.exist(responseHead.getHeader('content-encoding'));
            $ctx.state = 52;
            break;
          case 52:
            $ctx.state = 18;
            return streamableToText(responseStreamable).should.eventually.equal(testContent);
          case 18:
            $ctx.maybeThrow();
            $ctx.state = 20;
            break;
          case 20:
            requestHead = new RequestHead({headers: {'accept-encoding': 'gzip'}});
            $ctx.state = 54;
            break;
          case 54:
            $__20 = emptyStreamable();
            $__21 = handler(requestHead, $__20);
            $ctx.state = 26;
            break;
          case 26:
            $ctx.state = 22;
            return $__21;
          case 22:
            $__22 = $ctx.sent;
            $ctx.state = 24;
            break;
          case 24:
            $__11 = $__22;
            $__23 = $__11[0];
            responseHead = $__23;
            $__24 = $__11[1];
            responseStreamable = $__24;
            $ctx.state = 28;
            break;
          case 28:
            responseHead.getHeader('content-encoding').should.equal('gzip');
            $ctx.state = 56;
            break;
          case 56:
            $ctx.state = 30;
            return streamableToBuffer(responseStreamable);
          case 30:
            buffer = $ctx.sent;
            $ctx.state = 32;
            break;
          case 32:
            should.equal(buffertools.compare(buffer, compressed), 0);
            requestHead = new RequestHead({headers: {'accept-encoding': 'gzip;q=0, identity;q=0.5, *;q=0'}});
            $ctx.state = 58;
            break;
          case 58:
            $__25 = emptyStreamable();
            $__26 = handler(requestHead, $__25);
            $ctx.state = 38;
            break;
          case 38:
            $ctx.state = 34;
            return $__26;
          case 34:
            $__27 = $ctx.sent;
            $ctx.state = 36;
            break;
          case 36:
            $__12 = $__27;
            $__28 = $__12[0];
            responseHead = $__28;
            $__29 = $__12[1];
            responseStreamable = $__29;
            $ctx.state = 40;
            break;
          case 40:
            should.not.exist(responseHead.getHeader('content-encoding'));
            $ctx.state = 60;
            break;
          case 60:
            $ctx.state = 42;
            return streamableToText(responseStreamable).should.eventually.equal(testContent);
          case 42:
            $ctx.maybeThrow();
            $ctx.state = 44;
            break;
          case 44:
            requestHead = new RequestHead({headers: {'accept-encoding': 'identity;q=0'}});
            $ctx.state = 62;
            break;
          case 62:
            $ctx.state = 46;
            return handler(requestHead, emptyStreamable()).should.be.rejected;
          case 46:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__13, this);
  })));
}));
