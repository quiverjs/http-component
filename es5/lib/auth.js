"use strict";
var $__crypto__,
    $__quiver_45_error__,
    $__quiver_45_component__,
    $__quiver_45_promise__,
    $__quiver_45_stream_45_util__;
var crypto = ($__crypto__ = require("crypto"), $__crypto__ && $__crypto__.__esModule && $__crypto__ || {default: $__crypto__}).default;
var error = ($__quiver_45_error__ = require("quiver-error"), $__quiver_45_error__ && $__quiver_45_error__.__esModule && $__quiver_45_error__ || {default: $__quiver_45_error__}).error;
var httpFilter = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}).httpFilter;
var $__3 = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}),
    async = $__3.async,
    promisify = $__3.promisify;
var emptyStreamable = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}).emptyStreamable;
var randomBytes = promisify(crypto.randomBytes);
var splitOnce = (function(str, separator) {
  var index = str.indexOf(separator);
  if (index == -1)
    return [str, ''];
  return [str.slice(0, index), str.slice(index + 1)];
});
var base64Decode = (function(str) {
  return new Buffer(str, 'base64').toString();
});
var decodeCredentials = (function(str) {
  return splitOnce(base64Decode(str), ':');
});
var randomRealm = (function() {
  return randomBytes().then((function(buffer) {
    return buffer.toString('base64');
  }));
});
var basicAuthFilter = (function(authHandler) {
  return httpFilter(async($traceurRuntime.initGeneratorFunction(function $__9(config, handler) {
    var $__6,
        $__7,
        $__5,
        authHandler,
        strictAuthenticate,
        authenticationRealm,
        wwwAuthenticate,
        unauthorizedResponse,
        $__11,
        $__12,
        $__13,
        $__14,
        $__15,
        $__16,
        $__17;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $__5 = config;
            $__11 = $__5.authHandler;
            authHandler = $__11;
            $__12 = $__5.strictAuthenticate;
            $__6 = $__12;
            if ($__12 === void 0) {
              $__13 = true;
            } else {
              $__13 = $__6;
            }
            strictAuthenticate = $__13;
            $__14 = $__5.authenticationRealm;
            $__7 = $__14;
            $ctx.state = 13;
            break;
          case 13:
            $ctx.state = ($__14 === void 0) ? 5 : 9;
            break;
          case 5:
            $__15 = randomRealm();
            $ctx.state = 6;
            break;
          case 6:
            $ctx.state = 2;
            return $__15;
          case 2:
            $__16 = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $__17 = $__16;
            $ctx.state = 8;
            break;
          case 9:
            $__17 = $__7;
            $ctx.state = 8;
            break;
          case 8:
            authenticationRealm = $__17;
            $ctx.state = 15;
            break;
          case 15:
            wwwAuthenticate = 'Basic realm="' + authenticationRealm + '"';
            unauthorizedResponse = (function() {
              return ([new ResponseHead({
                statusCode: 401,
                headers: {'www-authenticate': wwwAuthenticate}
              }), emptyStreamable()]);
            });
            $ctx.state = 19;
            break;
          case 19:
            $ctx.returnValue = async($traceurRuntime.initGeneratorFunction(function $__10(requestHead, requestStreamable) {
              var unauthorized,
                  authHeader,
                  basicToken,
                  credentials,
                  $__8,
                  username,
                  password,
                  userId,
                  err;
              return $traceurRuntime.createGeneratorInstance(function($ctx) {
                while (true)
                  switch ($ctx.state) {
                    case 0:
                      unauthorized = strictAuthenticate ? unauthorizedResponse : (function() {
                        return handler(requestHead, requestStreamable);
                      });
                      authHeader = requestHead.getHeader('authorization');
                      $ctx.state = 26;
                      break;
                    case 26:
                      $ctx.state = (!authHeader) ? 1 : 2;
                      break;
                    case 1:
                      $ctx.returnValue = unauthorized();
                      $ctx.state = -2;
                      break;
                    case 2:
                      basicToken = authHeader.slice(0, 6);
                      $ctx.state = 28;
                      break;
                    case 28:
                      $ctx.state = (basicToken != 'Basic ') ? 4 : 5;
                      break;
                    case 4:
                      $ctx.returnValue = unauthorized();
                      $ctx.state = -2;
                      break;
                    case 5:
                      credentials = authHeader.slice(6).trim();
                      $__8 = decodeCredentials(credentials), username = $__8[0], password = $__8[1];
                      $ctx.state = 30;
                      break;
                    case 30:
                      $ctx.pushTry(16, null);
                      $ctx.state = 19;
                      break;
                    case 19:
                      $ctx.state = 8;
                      return authHandler({
                        username: username,
                        password: password
                      });
                    case 8:
                      userId = $ctx.sent;
                      $ctx.state = 10;
                      break;
                    case 10:
                      $ctx.popTry();
                      $ctx.state = 21;
                      break;
                    case 16:
                      $ctx.popTry();
                      err = $ctx.storedException;
                      $ctx.state = 13;
                      break;
                    case 13:
                      $ctx.state = (err.errorCode == 401) ? 11 : 12;
                      break;
                    case 11:
                      $ctx.returnValue = unauthorized();
                      $ctx.state = -2;
                      break;
                    case 12:
                      throw err;
                      $ctx.state = 21;
                      break;
                    case 21:
                      requestHead.setArgs('userId', userId);
                      $ctx.state = 32;
                      break;
                    case 32:
                      $ctx.returnValue = handler(requestHead, requestStreamable);
                      $ctx.state = -2;
                      break;
                    default:
                      return $ctx.end();
                  }
              }, $__10, this);
            }));
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__9, this);
  }))).addMiddleware(inputHandlerMiddleware('authHandler', authHandler, {loader: simpleHandlerLoader('void', 'text')}));
});
