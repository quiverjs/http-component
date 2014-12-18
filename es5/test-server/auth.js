"use strict";
Object.defineProperties(exports, {
  adminHandler: {get: function() {
      return adminHandler;
    }},
  __esModule: {value: true}
});
var $__quiver_45_error__,
    $__quiver_45_component__,
    $___46__46__47_lib_47_http_45_component_46_js__;
var error = ($__quiver_45_error__ = require("quiver-error"), $__quiver_45_error__ && $__quiver_45_error__.__esModule && $__quiver_45_error__ || {default: $__quiver_45_error__}).error;
var simpleHandler = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}).simpleHandler;
var basicAuthFilter = ($___46__46__47_lib_47_http_45_component_46_js__ = require("../lib/http-component.js"), $___46__46__47_lib_47_http_45_component_46_js__ && $___46__46__47_lib_47_http_45_component_46_js__.__esModule && $___46__46__47_lib_47_http_45_component_46_js__ || {default: $___46__46__47_lib_47_http_45_component_46_js__}).basicAuthFilter;
var authHandler = simpleHandler((function(args) {
  var $__3 = args,
      username = $__3.username,
      password = $__3.password;
  if (username == 'admin' && password == 'password') {
    return 'admin';
  }
  throw error(401, 'Unauthorized');
}), 'void', 'text');
var authFilter = basicAuthFilter().implement({authHandler: authHandler});
var adminHandler = simpleHandler((function(args) {
  return 'Hello Administrator. Nobody else can access this area';
}), 'void', 'text').middleware(authFilter);
