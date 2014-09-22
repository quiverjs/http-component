"use strict";
var $__traceur_64_0_46_0_46_6__,
    $__quiver_45_promise__,
    $__quiver_45_stream_45_util__,
    $___46__46__47_lib_47_multipart_45_stream_46_js__,
    $__chai__,
    $__chai_45_as_45_promised__;
($__traceur_64_0_46_0_46_6__ = require("traceur"), $__traceur_64_0_46_0_46_6__ && $__traceur_64_0_46_0_46_6__.__esModule && $__traceur_64_0_46_0_46_6__ || {default: $__traceur_64_0_46_0_46_6__});
var async = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}).async;
var $__1 = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}),
    streamToText = $__1.streamToText,
    createChannel = $__1.createChannel,
    buffersToStream = $__1.buffersToStream;
var $__2 = ($___46__46__47_lib_47_multipart_45_stream_46_js__ = require("../lib/multipart-stream.js"), $___46__46__47_lib_47_multipart_45_stream_46_js__ && $___46__46__47_lib_47_multipart_45_stream_46_js__.__esModule && $___46__46__47_lib_47_multipart_45_stream_46_js__ || {default: $___46__46__47_lib_47_multipart_45_stream_46_js__}),
    pipeMultipart = $__2.pipeMultipart,
    handleMultipart = $__2.handleMultipart;
var chai = ($__chai__ = require("chai"), $__chai__ && $__chai__.__esModule && $__chai__ || {default: $__chai__}).default;
var chaiAsPromised = ($__chai_45_as_45_promised__ = require("chai-as-promised"), $__chai_45_as_45_promised__ && $__chai_45_as_45_promised__.__esModule && $__chai_45_as_45_promised__ || {default: $__chai_45_as_45_promised__}).default;
chai.use(chaiAsPromised);
var should = chai.should();
describe('multipart stream test', (function() {
  it('simple boundary', async($traceurRuntime.initGeneratorFunction(function $__6() {
    var boundary,
        testBoundary;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            boundary = new Buffer('--boundary--');
            testBoundary = async($traceurRuntime.initGeneratorFunction(function $__7(testBuffers, partContent, restContent) {
              var wholeStream,
                  $__5,
                  partContent,
                  restStream,
                  $__8,
                  $__9,
                  $__10,
                  $__11;
              return $traceurRuntime.createGeneratorInstance(function($ctx) {
                while (true)
                  switch ($ctx.state) {
                    case 0:
                      wholeStream = buffersToStream(testBuffers);
                      $ctx.state = 14;
                      break;
                    case 14:
                      $__8 = handleMultipart(wholeStream, boundary, streamToText);
                      $ctx.state = 6;
                      break;
                    case 6:
                      $ctx.state = 2;
                      return $__8;
                    case 2:
                      $__9 = $ctx.sent;
                      $ctx.state = 4;
                      break;
                    case 4:
                      $__5 = $__9;
                      $__10 = $__5[0];
                      partContent = $__10;
                      $__11 = $__5[1];
                      restStream = $__11;
                      $ctx.state = 8;
                      break;
                    case 8:
                      partContent.should.equal(partContent);
                      $ctx.state = 16;
                      break;
                    case 16:
                      $ctx.state = 10;
                      return streamToText(restStream).should.eventually.equal(restContent);
                    case 10:
                      $ctx.maybeThrow();
                      $ctx.state = -2;
                      break;
                    default:
                      return $ctx.end();
                  }
              }, $__7, this);
            }));
            $ctx.state = 34;
            break;
          case 34:
            $ctx.state = 2;
            return testBoundary(['hello', '--boundary--', 'goodbye'], 'hello', 'goodbye');
          case 2:
            $ctx.maybeThrow();
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = 6;
            return testBoundary(['hello--b', 'oundar', 'y--goodbye'], 'hello', 'goodbye');
          case 6:
            $ctx.maybeThrow();
            $ctx.state = 8;
            break;
          case 8:
            $ctx.state = 10;
            return testBoundary(['he', 'll', 'o--boundary--g', 'ood', 'bye'], 'hello', 'goodbye');
          case 10:
            $ctx.maybeThrow();
            $ctx.state = 12;
            break;
          case 12:
            $ctx.state = 14;
            return testBoundary(['he', 'll', 'o--b', 'oun', 'dary--g', 'ood', 'bye'], 'hello', 'goodbye');
          case 14:
            $ctx.maybeThrow();
            $ctx.state = 16;
            break;
          case 16:
            $ctx.state = 18;
            return testBoundary(['--boundary--', 'goodbye'], '', 'goodbye');
          case 18:
            $ctx.maybeThrow();
            $ctx.state = 20;
            break;
          case 20:
            $ctx.state = 22;
            return testBoundary(['--b', 'oundar', 'y--go', 'odbye'], '', 'goodbye');
          case 22:
            $ctx.maybeThrow();
            $ctx.state = 24;
            break;
          case 24:
            $ctx.state = 26;
            return testBoundary(['hello', '--boundary--'], 'hello', '');
          case 26:
            $ctx.maybeThrow();
            $ctx.state = 28;
            break;
          case 28:
            $ctx.state = 30;
            return testBoundary(['hel', 'lo--b', 'ound', 'ary--'], 'hello', '');
          case 30:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__6, this);
  })));
}));
