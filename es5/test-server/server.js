"use strict";
var $__quiver_45_core_47_traceur__,
    $__quiver_45_core_47_http__,
    $__quiver_45_core_47_component__,
    $__quiver_45_file_45_component__,
    $__quiver_45_core_47_stream_45_util__,
    $___46__46__47_lib_47_http_45_component_46_js__,
    $__multipart_46_js__,
    $__auth_46_js__;
($__quiver_45_core_47_traceur__ = require("quiver-core/traceur"), $__quiver_45_core_47_traceur__ && $__quiver_45_core_47_traceur__.__esModule && $__quiver_45_core_47_traceur__ || {default: $__quiver_45_core_47_traceur__});
var startServer = ($__quiver_45_core_47_http__ = require("quiver-core/http"), $__quiver_45_core_47_http__ && $__quiver_45_core_47_http__.__esModule && $__quiver_45_core_47_http__ || {default: $__quiver_45_core_47_http__}).startServer;
var $__1 = ($__quiver_45_core_47_component__ = require("quiver-core/component"), $__quiver_45_core_47_component__ && $__quiver_45_core_47_component__.__esModule && $__quiver_45_core_47_component__ || {default: $__quiver_45_core_47_component__}),
    router = $__1.router,
    simpleHandler = $__1.simpleHandler;
var $__2 = ($__quiver_45_file_45_component__ = require("quiver-file-component"), $__quiver_45_file_45_component__ && $__quiver_45_file_45_component__.__esModule && $__quiver_45_file_45_component__ || {default: $__quiver_45_file_45_component__}),
    fileHandler = $__2.fileHandler,
    singleFileHandler = $__2.singleFileHandler;
var buffersToStream = ($__quiver_45_core_47_stream_45_util__ = require("quiver-core/stream-util"), $__quiver_45_core_47_stream_45_util__ && $__quiver_45_core_47_stream_45_util__.__esModule && $__quiver_45_core_47_stream_45_util__ || {default: $__quiver_45_core_47_stream_45_util__}).buffersToStream;
var $__4 = ($___46__46__47_lib_47_http_45_component_46_js__ = require("../lib/http-component.js"), $___46__46__47_lib_47_http_45_component_46_js__ && $___46__46__47_lib_47_http_45_component_46_js__.__esModule && $___46__46__47_lib_47_http_45_component_46_js__ || {default: $___46__46__47_lib_47_http_45_component_46_js__}),
    byteRangeFilter = $__4.byteRangeFilter,
    requestLoggerFilter = $__4.requestLoggerFilter,
    httpCompressFilter = $__4.httpCompressFilter,
    headRequestFilter = $__4.headRequestFilter,
    chunkedResponseFilter = $__4.chunkedResponseFilter,
    basicErrorPageFilter = $__4.basicErrorPageFilter;
var formHandler = ($__multipart_46_js__ = require("./multipart.js"), $__multipart_46_js__ && $__multipart_46_js__.__esModule && $__multipart_46_js__ || {default: $__multipart_46_js__}).formHandler;
var adminHandler = ($__auth_46_js__ = require("./auth.js"), $__auth_46_js__ && $__auth_46_js__.__esModule && $__auth_46_js__ || {default: $__auth_46_js__}).adminHandler;
var rangeHandler = fileHandler().addMiddleware(byteRangeFilter());
var compressHandler = fileHandler().addMiddleware(httpCompressFilter());
var chunkHandler = simpleHandler((function(args) {
  return buffersToStream(['Hello world. ', 'This content is chunked ', 'manually in Quiver.']);
}), 'void', 'stream').addMiddleware(chunkedResponseFilter());
var main = router().staticRoute('/form', singleFileHandler()).staticRoute('/submit', formHandler).staticRoute('/admin', adminHandler).paramRoute('/chunk', chunkHandler).paramRoute('/range/:restpath', rangeHandler).paramRoute('/compress/:restpath', compressHandler).middleware(headRequestFilter()).middleware(basicErrorPageFilter()).middleware(requestLoggerFilter());
var config = {
  dirPath: 'test-content',
  filePath: 'test-content/form.html'
};
startServer(main, config).then((function(server) {
  console.log('HTTP test server running at port 8080...');
})).catch((function(err) {
  console.log('error starting server:', err.stack);
}));
