"use strict";
var $__traceur_64_0_46_0_46_6__,
    $__quiver_45_http__,
    $__quiver_45_component__,
    $__quiver_45_file_45_component__,
    $__quiver_45_stream_45_util__,
    $__multipart_46_js__,
    $___46__46__47_lib_47_byte_45_range_46_js__,
    $___46__46__47_lib_47_compress_46_js__,
    $___46__46__47_lib_47_chunked_46_js__;
($__traceur_64_0_46_0_46_6__ = require("traceur"), $__traceur_64_0_46_0_46_6__ && $__traceur_64_0_46_0_46_6__.__esModule && $__traceur_64_0_46_0_46_6__ || {default: $__traceur_64_0_46_0_46_6__});
var startServer = ($__quiver_45_http__ = require("quiver-http"), $__quiver_45_http__ && $__quiver_45_http__.__esModule && $__quiver_45_http__ || {default: $__quiver_45_http__}).startServer;
var $__1 = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}),
    router = $__1.router,
    simpleHandler = $__1.simpleHandler;
var $__2 = ($__quiver_45_file_45_component__ = require("quiver-file-component"), $__quiver_45_file_45_component__ && $__quiver_45_file_45_component__.__esModule && $__quiver_45_file_45_component__ || {default: $__quiver_45_file_45_component__}),
    fileHandler = $__2.fileHandler,
    singleFileHandler = $__2.singleFileHandler;
var buffersToStream = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}).buffersToStream;
var formHandler = ($__multipart_46_js__ = require("./multipart.js"), $__multipart_46_js__ && $__multipart_46_js__.__esModule && $__multipart_46_js__ || {default: $__multipart_46_js__}).formHandler;
var byteRangeFilter = ($___46__46__47_lib_47_byte_45_range_46_js__ = require("../lib/byte-range.js"), $___46__46__47_lib_47_byte_45_range_46_js__ && $___46__46__47_lib_47_byte_45_range_46_js__.__esModule && $___46__46__47_lib_47_byte_45_range_46_js__ || {default: $___46__46__47_lib_47_byte_45_range_46_js__}).byteRangeFilter;
var httpCompressFilter = ($___46__46__47_lib_47_compress_46_js__ = require("../lib/compress.js"), $___46__46__47_lib_47_compress_46_js__ && $___46__46__47_lib_47_compress_46_js__.__esModule && $___46__46__47_lib_47_compress_46_js__ || {default: $___46__46__47_lib_47_compress_46_js__}).httpCompressFilter;
var chunkedResponseFilter = ($___46__46__47_lib_47_chunked_46_js__ = require("../lib/chunked.js"), $___46__46__47_lib_47_chunked_46_js__ && $___46__46__47_lib_47_chunked_46_js__.__esModule && $___46__46__47_lib_47_chunked_46_js__ || {default: $___46__46__47_lib_47_chunked_46_js__}).chunkedResponseFilter;
var rangeHandler = fileHandler().addMiddleware(byteRangeFilter);
var compressHandler = fileHandler().addMiddleware(httpCompressFilter);
var chunkHandler = simpleHandler((function(args) {
  return buffersToStream(['Hello world. ', 'This content is chunked ', 'manually in Quiver.']);
}), 'void', 'stream').addMiddleware(chunkedResponseFilter);
var main = router().addStaticRoute(singleFileHandler(), '/form').addStaticRoute(formHandler, '/submit').addParamRoute(chunkHandler, '/chunk').addParamRoute(rangeHandler, '/range/:restpath').addParamRoute(compressHandler, '/compress/:restpath');
var config = {
  dirPath: 'test-content',
  filePath: 'test-content/form.html'
};
startServer(main, config).then((function(server) {
  console.log('HTTP test server running at port 8080...');
})).catch((function(err) {
  console.log('error starting server:', err.stack);
}));
