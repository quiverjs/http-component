"use strict";
var $__traceur_64_0_46_0_46_6__,
    $__quiver_45_http__,
    $__quiver_45_component__,
    $__quiver_45_file_45_component__,
    $__quiver_45_stream_45_component__,
    $___46__46__47_lib_47_multipart_46_js__;
($__traceur_64_0_46_0_46_6__ = require("traceur"), $__traceur_64_0_46_0_46_6__ && $__traceur_64_0_46_0_46_6__.__esModule && $__traceur_64_0_46_0_46_6__ || {default: $__traceur_64_0_46_0_46_6__});
var startServer = ($__quiver_45_http__ = require("quiver-http"), $__quiver_45_http__ && $__quiver_45_http__.__esModule && $__quiver_45_http__ || {default: $__quiver_45_http__}).startServer;
var $__1 = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}),
    router = $__1.router,
    simpleHandler = $__1.simpleHandler;
var singleFileHandler = ($__quiver_45_file_45_component__ = require("quiver-file-component"), $__quiver_45_file_45_component__ && $__quiver_45_file_45_component__.__esModule && $__quiver_45_file_45_component__ || {default: $__quiver_45_file_45_component__}).singleFileHandler;
var checksumHandler = ($__quiver_45_stream_45_component__ = require("quiver-stream-component"), $__quiver_45_stream_45_component__ && $__quiver_45_stream_45_component__.__esModule && $__quiver_45_stream_45_component__ || {default: $__quiver_45_stream_45_component__}).checksumHandler;
var multipartSerializeFilter = ($___46__46__47_lib_47_multipart_46_js__ = require("../lib/multipart.js"), $___46__46__47_lib_47_multipart_46_js__ && $___46__46__47_lib_47_multipart_46_js__.__esModule && $___46__46__47_lib_47_multipart_46_js__ || {default: $___46__46__47_lib_47_multipart_46_js__}).multipartSerializeFilter;
var handleForm = simpleHandler((function(args) {
  var $__5 = args,
      formData = $__5.formData,
      serializedParts = $__5.serializedParts;
  return ("\nYou have submitted the following form data:\n\n" + JSON.stringify(formData) + "\n\nand your uploaded files have following SHA1 checksum:\n\n" + JSON.stringify(serializedParts));
}), 'void', 'text').addMiddleware(multipartSerializeFilter(checksumHandler('sha1')));
var main = router().addStaticRoute(singleFileHandler(), '/').addStaticRoute(handleForm, '/submit');
var config = {filePath: './test-content/form.html'};
startServer(main, config).then((function(server) {
  console.log('Multipart form server running at port 8080...');
})).catch((function(err) {
  console.log('error starting server:', err.stack);
}));
