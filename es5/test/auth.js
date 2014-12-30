"use strict";
var $__quiver_45_core_47_traceur__,
    $__quiver_45_core_47_error__,
    $__quiver_45_core_47_promise__,
    $__quiver_45_core_47_http__,
    $__quiver_45_core_47_component__,
    $__quiver_45_core_47_stream_45_util__,
    $___46__46__47_lib_47_http_45_component__,
    $__chai__,
    $__chai_45_as_45_promised__;
($__quiver_45_core_47_traceur__ = require("quiver-core/traceur"), $__quiver_45_core_47_traceur__ && $__quiver_45_core_47_traceur__.__esModule && $__quiver_45_core_47_traceur__ || {default: $__quiver_45_core_47_traceur__});
var error = ($__quiver_45_core_47_error__ = require("quiver-core/error"), $__quiver_45_core_47_error__ && $__quiver_45_core_47_error__.__esModule && $__quiver_45_core_47_error__ || {default: $__quiver_45_core_47_error__}).error;
var async = ($__quiver_45_core_47_promise__ = require("quiver-core/promise"), $__quiver_45_core_47_promise__ && $__quiver_45_core_47_promise__.__esModule && $__quiver_45_core_47_promise__ || {default: $__quiver_45_core_47_promise__}).async;
var RequestHead = ($__quiver_45_core_47_http__ = require("quiver-core/http"), $__quiver_45_core_47_http__ && $__quiver_45_core_47_http__.__esModule && $__quiver_45_core_47_http__ || {default: $__quiver_45_core_47_http__}).RequestHead;
var $__3 = ($__quiver_45_core_47_component__ = require("quiver-core/component"), $__quiver_45_core_47_component__ && $__quiver_45_core_47_component__.__esModule && $__quiver_45_core_47_component__ || {default: $__quiver_45_core_47_component__}),
    simpleHandler = $__3.simpleHandler,
    loadHttpHandler = $__3.loadHttpHandler;
var $__4 = ($__quiver_45_core_47_stream_45_util__ = require("quiver-core/stream-util"), $__quiver_45_core_47_stream_45_util__ && $__quiver_45_core_47_stream_45_util__.__esModule && $__quiver_45_core_47_stream_45_util__ || {default: $__quiver_45_core_47_stream_45_util__}),
    emptyStreamable = $__4.emptyStreamable,
    streamableToText = $__4.streamableToText;
var basicAuthFilter = ($___46__46__47_lib_47_http_45_component__ = require("../lib/http-component"), $___46__46__47_lib_47_http_45_component__ && $___46__46__47_lib_47_http_45_component__.__esModule && $___46__46__47_lib_47_http_45_component__ || {default: $___46__46__47_lib_47_http_45_component__}).basicAuthFilter;
var chai = ($__chai__ = require("chai"), $__chai__ && $__chai__.__esModule && $__chai__ || {default: $__chai__}).default;
var chaiAsPromised = ($__chai_45_as_45_promised__ = require("chai-as-promised"), $__chai_45_as_45_promised__ && $__chai_45_as_45_promised__.__esModule && $__chai_45_as_45_promised__ || {default: $__chai_45_as_45_promised__}).default;
chai.use(chaiAsPromised);
var should = chai.should();
var authHeaderRegex = /^Basic realm=".+"$/;
describe('http basic auth test', (function() {
  it('basic test', async($traceurRuntime.initGeneratorFunction(function $__11() {
    var authHandler,
        authFilter,
        main,
        handler,
        $__8,
        responseHead,
        responseStreamable,
        authHeader,
        requestHead,
        $__9,
        invalidCredentials,
        $__10,
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
        $__27;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            authHandler = simpleHandler((function(args) {
              var $__8 = args,
                  username = $__8.username,
                  password = $__8.password;
              if (username == 'Aladdin' && password == 'open sesame') {
                return 'genie';
              }
              throw error(401, 'Unauthorized');
            }), 'void', 'text');
            authFilter = basicAuthFilter().implement({authHandler: authHandler});
            main = simpleHandler((function(args) {
              args.userId.should.equal('genie');
              return 'secret content';
            }), 'void', 'text').middleware(authFilter).setLoader(loadHttpHandler);
            $ctx.state = 38;
            break;
          case 38:
            $ctx.state = 2;
            return main.loadHandler({});
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
            $__8 = $__15;
            $__16 = $__8[0];
            responseHead = $__16;
            $__17 = $__8[1];
            responseStreamable = $__17;
            $ctx.state = 12;
            break;
          case 12:
            responseHead.statusCode.should.equal(401);
            authHeader = responseHead.getHeader('www-authenticate');
            should.exist(authHeader);
            authHeaderRegex.test(authHeader).should.equal(true);
            $ctx.state = 40;
            break;
          case 40:
            $ctx.state = 14;
            return streamableToText(responseStreamable).should.eventually.equal('<h1>401 Unauthorized</h1>');
          case 14:
            $ctx.maybeThrow();
            $ctx.state = 16;
            break;
          case 16:
            requestHead = new RequestHead({headers: {authorization: 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=='}});
            $ctx.state = 42;
            break;
          case 42:
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
            $__9 = $__20;
            $__21 = $__9[0];
            responseHead = $__21;
            $__22 = $__9[1];
            responseStreamable = $__22;
            $ctx.state = 24;
            break;
          case 24:
            responseHead.statusCode.should.equal(200);
            $ctx.state = 44;
            break;
          case 44:
            $ctx.state = 26;
            return streamableToText(responseStreamable).should.eventually.equal('secret content');
          case 26:
            $ctx.maybeThrow();
            $ctx.state = 28;
            break;
          case 28:
            invalidCredentials = new Buffer('admin:password').toString('base64');
            requestHead = new RequestHead({headers: {authorization: 'Basic ' + invalidCredentials}});
            $ctx.state = 46;
            break;
          case 46:
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
            $__10 = $__25;
            $__26 = $__10[0];
            responseHead = $__26;
            $__27 = $__10[1];
            responseStreamable = $__27;
            $ctx.state = 36;
            break;
          case 36:
            responseHead.statusCode.should.equal(401);
            authHeader = responseHead.getHeader('www-authenticate');
            should.exist(authHeader);
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__11, this);
  })));
}));
