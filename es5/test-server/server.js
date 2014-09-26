"use strict";
var $__traceur_64_0_46_0_46_6__,
    $__quiver_45_http__,
    $__quiver_45_component__,
    $__quiver_45_file_45_component__,
    $__quiver_45_stream_45_util__,
    $___46__46__47_lib_47_http_45_component_46_js__,
    $__multipart_46_js__,
    $__auth_46_js__;
($__traceur_64_0_46_0_46_6__ = require("traceur"), $__traceur_64_0_46_0_46_6__ && $__traceur_64_0_46_0_46_6__.__esModule && $__traceur_64_0_46_0_46_6__ || {default: $__traceur_64_0_46_0_46_6__});
var startServer = ($__quiver_45_http__ = require("quiver-http"), $__quiver_45_http__ && $__quiver_45_http__.__esModule && $__quiver_45_http__ || {default: $__quiver_45_http__}).startServer;
var $__1 = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}),
    router = $__1.router,
    simpleHandler = $__1.simpleHandler;
var $__2 = ($__quiver_45_file_45_component__ = require("quiver-file-component"), $__quiver_45_file_45_component__ && $__quiver_45_file_45_component__.__esModule && $__quiver_45_file_45_component__ || {default: $__quiver_45_file_45_component__}),
    fileHandler = $__2.fileHandler,
    singleFileHandler = $__2.singleFileHandler;
var buffersToStream = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}).buffersToStream;
var $__4 = ($___46__46__47_lib_47_http_45_component_46_js__ = require("../lib/http-component.js"), $___46__46__47_lib_47_http_45_component_46_js__ && $___46__46__47_lib_47_http_45_component_46_js__.__esModule && $___46__46__47_lib_47_http_45_component_46_js__ || {default: $___46__46__47_lib_47_http_45_component_46_js__}),
    byteRangeFilter = $__4.byteRangeFilter,
    requestLoggerFilter = $__4.requestLoggerFilter,
    httpCompressFilter = $__4.httpCompressFilter,
    chunkedResponseFilter = $__4.chunkedResponseFilter,
    basicErrorPageFilter = $__4.basicErrorPageFilter;
var formHandler = ($__multipart_46_js__ = require("./multipart.js"), $__multipart_46_js__ && $__multipart_46_js__.__esModule && $__multipart_46_js__ || {default: $__multipart_46_js__}).formHandler;
var authHandler = ($__auth_46_js__ = require("./auth.js"), $__auth_46_js__ && $__auth_46_js__.__esModule && $__auth_46_js__ || {default: $__auth_46_js__}).authHandler;
var rangeHandler = fileHandler().addMiddleware(byteRangeFilter());
var compressHandler = fileHandler().addMiddleware(httpCompressFilter());
var chunkHandler = simpleHandler((function(args) {
  return buffersToStream(['Hello world. ', 'This content is chunked ', 'manually in Quiver.']);
}), 'void', 'stream').addMiddleware(chunkedResponseFilter());
var main = router().addStaticRoute(singleFileHandler(), '/form').addStaticRoute(formHandler, '/submit').addStaticRoute(authHandler, '/auth').addParamRoute(chunkHandler, '/chunk').addParamRoute(rangeHandler, '/range/:restpath').addParamRoute(compressHandler, '/compress/:restpath').addMiddleware(basicErrorPageFilter()).addMiddleware(requestLoggerFilter());
var config = {
  dirPath: 'test-content',
  filePath: 'test-content/form.html'
};
startServer(main, config).then((function(server) {
  console.log('HTTP test server running at port 8080...');
})).catch((function(err) {
  console.log('error starting server:', err.stack);
}));
