"use strict";
Object.defineProperties(exports, {
  basicAuthFilter: {get: function() {
      return basicAuthFilter;
    }},
  makeBasicAuthFilter: {get: function() {
      return makeBasicAuthFilter;
    }},
  __esModule: {value: true}
});
var $__crypto__,
    $__quiver_45_http__,
    $__quiver_45_promise__,
    $__quiver_45_stream_45_util__,
    $__quiver_45_component__;
var crypto = ($__crypto__ = require("crypto"), $__crypto__ && $__crypto__.__esModule && $__crypto__ || {default: $__crypto__}).default;
var ResponseHead = ($__quiver_45_http__ = require("quiver-http"), $__quiver_45_http__ && $__quiver_45_http__.__esModule && $__quiver_45_http__ || {default: $__quiver_45_http__}).ResponseHead;
var $__2 = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}),
    async = $__2.async,
    promisify = $__2.promisify;
var textToStreamable = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}).textToStreamable;
var $__4 = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}),
    httpFilter = $__4.httpFilter,
    abstractHandler = $__4.abstractHandler,
    simpleHandlerLoader = $__4.simpleHandlerLoader,
    inputHandlerMiddleware = $__4.inputHandlerMiddleware;
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
  return randomBytes(32).then((function(buffer) {
    return buffer.toString('base64');
  }));
});
var authHandler = abstractHandler('authHandler').setLoader(simpleHandlerLoader('void', 'text'));
var basicAuthFilter = httpFilter(async($traceurRuntime.initGeneratorFunction(function $__10(config, handler) {
  var $__6,
      $__7,
      $__8,
      $__5,
      authHandler,
      userField,
      strictAuthenticate,
      authenticationRealm,
      wwwAuthenticate,
      unauthorizedResponse,
      $__12,
      $__13,
      $__14,
      $__15,
      $__16,
      $__17,
      $__18,
      $__19,
      $__20;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $__5 = config;
          $__12 = $__5.authHandler;
          authHandler = $__12;
          $__13 = $__5.userField;
          $__6 = $__13;
          if ($__13 === void 0) {
            $__14 = 'userId';
          } else {
            $__14 = $__6;
          }
          userField = $__14;
          $__15 = $__5.strictAuthenticate;
          $__7 = $__15;
          if ($__15 === void 0) {
            $__16 = true;
          } else {
            $__16 = $__7;
          }
          strictAuthenticate = $__16;
          $__17 = $__5.authenticationRealm;
          $__8 = $__17;
          $ctx.state = 13;
          break;
        case 13:
          $ctx.state = ($__17 === void 0) ? 5 : 9;
          break;
        case 5:
          $__18 = randomRealm();
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__18;
        case 2:
          $__19 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__20 = $__19;
          $ctx.state = 8;
          break;
        case 9:
          $__20 = $__8;
          $ctx.state = 8;
          break;
        case 8:
          authenticationRealm = $__20;
          $ctx.state = 15;
          break;
        case 15:
          wwwAuthenticate = 'Basic realm="' + authenticationRealm + '"';
          unauthorizedResponse = (function() {
            var message = '<h1>401 Unauthorized</h1>';
            var responseHead = new ResponseHead({
              statusCode: 401,
              headers: {
                'www-authenticate': wwwAuthenticate,
                'content-type': 'text/html',
                'content-length': '' + message.length
              }
            });
            var responseStreamable = textToStreamable(message);
            return [responseHead, responseStreamable];
          });
          $ctx.state = 19;
          break;
        case 19:
          $ctx.returnValue = async($traceurRuntime.initGeneratorFunction(function $__11(requestHead, requestStreamable) {
            var unauthorized,
                authHeader,
                basicToken,
                credentials,
                $__9,
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
                    $__9 = decodeCredentials(credentials), username = $__9[0], password = $__9[1];
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
                    requestHead.setArgs(userField, userId);
                    $ctx.state = 32;
                    break;
                  case 32:
                    $ctx.returnValue = handler(requestHead, requestStreamable);
                    $ctx.state = -2;
                    break;
                  default:
                    return $ctx.end();
                }
            }, $__11, this);
          }));
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__10, this);
}))).inputHandlers({authHandler: authHandler});
var makeBasicAuthFilter = basicAuthFilter.factory();
