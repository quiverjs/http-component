"use strict";
Object.defineProperties(exports, {
  formHandler: {get: function() {
      return formHandler;
    }},
  __esModule: {value: true}
});
var $__quiver_45_component__,
    $__quiver_45_stream_45_component__,
    $___46__46__47_lib_47_http_45_component_46_js__;
var simpleHandler = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}).simpleHandler;
var checksumHandler = ($__quiver_45_stream_45_component__ = require("quiver-stream-component"), $__quiver_45_stream_45_component__ && $__quiver_45_stream_45_component__.__esModule && $__quiver_45_stream_45_component__ || {default: $__quiver_45_stream_45_component__}).checksumHandler;
var multipartSerializeFilter = ($___46__46__47_lib_47_http_45_component_46_js__ = require("../lib/http-component.js"), $___46__46__47_lib_47_http_45_component_46_js__ && $___46__46__47_lib_47_http_45_component_46_js__.__esModule && $___46__46__47_lib_47_http_45_component_46_js__ || {default: $___46__46__47_lib_47_http_45_component_46_js__}).multipartSerializeFilter;
var serializerHandler = checksumHandler('sha1');
var multipartFilter = multipartSerializeFilter().implement({serializerHandler: serializerHandler});
var formHandler = simpleHandler((function(args) {
  var $__3 = args,
      formData = $__3.formData,
      serializedParts = $__3.serializedParts;
  return ("\nYou have submitted the following form data:\n\n" + JSON.stringify(formData) + "\n\nand your uploaded files have following SHA1 checksum:\n\n" + JSON.stringify(serializedParts));
}), 'void', 'text').middleware(multipartFilter);
