'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var mixin = require('@ject/mixin');
var components = require('@pres/components');
var program = require('@pres/program');
var terminfoParser = require('@pres/terminfo-parser');
var colors = require('@pres/util-blessed-colors');
var helpers = require('@pres/util-helpers');
var unicode = require('@pres/util-unicode');
var url = require('url');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var components__namespace = /*#__PURE__*/_interopNamespace(components);
var colors__namespace = /*#__PURE__*/_interopNamespace(colors);
var helpers__namespace = /*#__PURE__*/_interopNamespace(helpers);
var unicode__namespace = /*#__PURE__*/_interopNamespace(unicode);
var url__default = /*#__PURE__*/_interopDefaultLegacy(url);

/**
 // chart
 * @property {function(Object?):BarChart} barChart
 * @property {function(Object?):DonutChart} donutChart
 * @property {function(Object?):Gauge} gauge
 * @property {function(Object?):GaugeList} gaugeList
 * @property {function(Object?):LineChart} lineChart
 * @property {function(Object?):Sparkline} sparkline
 * @property {function(Object?):StackedBarChart} stackedBarChart
 // core
 * @property {function(Object?):Box} box
 * @property {function(Object?):Element} element
 * @property {function(Object?):Node} node
 * @property {function(Object?):Screen} screen
 * @property {function(Object?):Layout} layout
 * @property {function(Object?):Line} line
 * @property {function(Object?):Log} log
 * @property {function(Object?):ScrollableBox} scrollableBox
 * @property {function(Object?):ScrollableText} scrollableText
 * @property {function(Object?):Terminal} terminal
 // data
 * @property {function(Object?):DataTable} dataTable
 * @property {function(Object?):List} list
 * @property {function(Object?):ListBar} listBar
 * @property {function(Object?):ListTable} listTable
 * @property {function(Object?):Table} table
 * @property {function(Object?):Tree} tree
 // form
 * @property {function(Object?):Button} button
 * @property {function(Object?):Checkbox} checkbox
 * @property {function(Object?):FileManager} fileManager
 * @property {function(Object?):Form} form
 * @property {function(Object?):Input} input
 * @property {function(Object?):Prompt} prompt
 * @property {function(Object?):Question} question
 * @property {function(Object?):RadioButton} radioButton
 * @property {function(Object?):RadioSet} radioSet
 * @property {function(Object?):Textbox} textbox
 * @property {function(Object?):Textarea} textarea
 // geo
 * @property {function(Object?):Map} map
 // inform
 * @property {function(Object?):LCD} lcd
 * @property {function(Object?):Loading} loading
 * @property {function(Object?):Message} message
 * @property {function(Object?):ProgressBar} progressBar
 // layout
 * @property {function(Object?):Canvas} canvas
 * @property {function(Object?):Carousel} carousel
 * @property {function(Object?):Grid} grid
 * @property {function(Object?):Page} page
 // text
 * @property {function(Object?):LogList} logList
 * @property {function(Object?):Markdown} markdown
 * @property {function(Object?):Text} text
 // visual
 * @property {function(Object?):ANSIImage} ansiImage
 * @property {function(Object?):BigText} bigText
 * @property {function(Object?):Image} image
 * @property {function(Object?):OverlayImage} overlayImage
 * @property {function(Object?):Picture} picture
 * @property {function(Object?):PNG} png
 * @property {function(Object?):Video} video
 */

class TI {
  static program = program.Program.build;
  static build = program.Program.build;
  static helpers = helpers__namespace;
  static unicode = unicode__namespace;
  static colors = colors__namespace;
  static Tput = terminfoParser.Tput;
}
mixin.assign(TI, components__namespace);

function OutputBuffer(options) {
  this.isTTY = true;
  this.columns = options.cols;
  this.rows = options.rows;

  this.write = function (s) {
    s = s.replace('\x1b8', ''); //not clear from where in TI this code comes from. It forces the terminal to clear and loose existing content.

    options.res.write(s);
  };

  this.on = function () {};
}

function InputBuffer() {
  this.isTTY = true;
  this.isRaw = true;

  this.emit = function () {};

  this.setRawMode = function () {};

  this.resume = function () {};

  this.pause = function () {};

  this.on = function () {};
}

function serverError(req, res, err) {
  setTimeout(function () {
    if (!res.headersSent) res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.write('\r\n\r\n' + err + '\r\n\r\n'); //restore cursor

    res.end('\u001b[?25h');
  }, 0);
  return true;
}

function createScreen(req, res) {
  const query = url__default["default"].parse(req.url, true).query;
  const cols = query.cols || 250;
  const rows = query.rows || 50;

  if (cols <= 35 || cols >= 500 || rows <= 5 || rows >= 300) {
    serverError(req, res, 'cols must be bigger than 35 and rows must be bigger than 5');
    return null;
  }

  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  const output = new OutputBuffer({
    res: res,
    cols: cols,
    rows: rows
  });
  const input = new InputBuffer(); //required to run under forever since it replaces stdin to non-tty

  const program = TI.program({
    output: output,
    input: input
  });
  if (query.terminal) program.terminal = query.terminal;
  if (query.isOSX) program.isOSXTerm = query.isOSX;
  if (query.isiTerm2) program.isiTerm2 = query.isiTerm2;
  return TI.screen({
    program: program
  });
}

Object.defineProperty(exports, 'ANSIImage', {
  enumerable: true,
  get: function () { return components.ANSIImage; }
});
Object.defineProperty(exports, 'BarChart', {
  enumerable: true,
  get: function () { return components.BarChart; }
});
Object.defineProperty(exports, 'BigText', {
  enumerable: true,
  get: function () { return components.BigText; }
});
Object.defineProperty(exports, 'Box', {
  enumerable: true,
  get: function () { return components.Box; }
});
Object.defineProperty(exports, 'Button', {
  enumerable: true,
  get: function () { return components.Button; }
});
Object.defineProperty(exports, 'Canvas', {
  enumerable: true,
  get: function () { return components.Canvas; }
});
Object.defineProperty(exports, 'Carousel', {
  enumerable: true,
  get: function () { return components.Carousel; }
});
Object.defineProperty(exports, 'Checkbox', {
  enumerable: true,
  get: function () { return components.Checkbox; }
});
Object.defineProperty(exports, 'DataTable', {
  enumerable: true,
  get: function () { return components.DataTable; }
});
Object.defineProperty(exports, 'DonutChart', {
  enumerable: true,
  get: function () { return components.DonutChart; }
});
Object.defineProperty(exports, 'FileManager', {
  enumerable: true,
  get: function () { return components.FileManager; }
});
Object.defineProperty(exports, 'Form', {
  enumerable: true,
  get: function () { return components.Form; }
});
Object.defineProperty(exports, 'Gauge', {
  enumerable: true,
  get: function () { return components.Gauge; }
});
Object.defineProperty(exports, 'GaugeList', {
  enumerable: true,
  get: function () { return components.GaugeList; }
});
Object.defineProperty(exports, 'Grid', {
  enumerable: true,
  get: function () { return components.Grid; }
});
Object.defineProperty(exports, 'Image', {
  enumerable: true,
  get: function () { return components.Image; }
});
Object.defineProperty(exports, 'Input', {
  enumerable: true,
  get: function () { return components.Input; }
});
Object.defineProperty(exports, 'LCD', {
  enumerable: true,
  get: function () { return components.LCD; }
});
Object.defineProperty(exports, 'Layout', {
  enumerable: true,
  get: function () { return components.Layout; }
});
Object.defineProperty(exports, 'Line', {
  enumerable: true,
  get: function () { return components.Line; }
});
Object.defineProperty(exports, 'LineChart', {
  enumerable: true,
  get: function () { return components.LineChart; }
});
Object.defineProperty(exports, 'List', {
  enumerable: true,
  get: function () { return components.List; }
});
Object.defineProperty(exports, 'ListBar', {
  enumerable: true,
  get: function () { return components.ListBar; }
});
Object.defineProperty(exports, 'ListTable', {
  enumerable: true,
  get: function () { return components.ListTable; }
});
Object.defineProperty(exports, 'Loading', {
  enumerable: true,
  get: function () { return components.Loading; }
});
Object.defineProperty(exports, 'Log', {
  enumerable: true,
  get: function () { return components.Log; }
});
Object.defineProperty(exports, 'LogList', {
  enumerable: true,
  get: function () { return components.LogList; }
});
Object.defineProperty(exports, 'Map', {
  enumerable: true,
  get: function () { return components.Map; }
});
Object.defineProperty(exports, 'Message', {
  enumerable: true,
  get: function () { return components.Message; }
});
Object.defineProperty(exports, 'OverlayImage', {
  enumerable: true,
  get: function () { return components.OverlayImage; }
});
Object.defineProperty(exports, 'Picture', {
  enumerable: true,
  get: function () { return components.Picture; }
});
Object.defineProperty(exports, 'ProgressBar', {
  enumerable: true,
  get: function () { return components.ProgressBar; }
});
Object.defineProperty(exports, 'Prompt', {
  enumerable: true,
  get: function () { return components.Prompt; }
});
Object.defineProperty(exports, 'Question', {
  enumerable: true,
  get: function () { return components.Question; }
});
Object.defineProperty(exports, 'RadioButton', {
  enumerable: true,
  get: function () { return components.RadioButton; }
});
Object.defineProperty(exports, 'RadioSet', {
  enumerable: true,
  get: function () { return components.RadioSet; }
});
Object.defineProperty(exports, 'Screen', {
  enumerable: true,
  get: function () { return components.Screen; }
});
Object.defineProperty(exports, 'ScrollableBox', {
  enumerable: true,
  get: function () { return components.ScrollableBox; }
});
Object.defineProperty(exports, 'ScrollableText', {
  enumerable: true,
  get: function () { return components.ScrollableText; }
});
Object.defineProperty(exports, 'Sparkline', {
  enumerable: true,
  get: function () { return components.Sparkline; }
});
Object.defineProperty(exports, 'StackedBarChart', {
  enumerable: true,
  get: function () { return components.StackedBarChart; }
});
Object.defineProperty(exports, 'Table', {
  enumerable: true,
  get: function () { return components.Table; }
});
Object.defineProperty(exports, 'Terminal', {
  enumerable: true,
  get: function () { return components.Terminal; }
});
Object.defineProperty(exports, 'Text', {
  enumerable: true,
  get: function () { return components.Text; }
});
Object.defineProperty(exports, 'Textarea', {
  enumerable: true,
  get: function () { return components.Textarea; }
});
Object.defineProperty(exports, 'Textbox', {
  enumerable: true,
  get: function () { return components.Textbox; }
});
Object.defineProperty(exports, 'Tree', {
  enumerable: true,
  get: function () { return components.Tree; }
});
Object.defineProperty(exports, 'Video', {
  enumerable: true,
  get: function () { return components.Video; }
});
exports.InputBuffer = InputBuffer;
exports.OutputBuffer = OutputBuffer;
exports.Pres = TI;
exports.TI = TI;
exports.TerminalInterface = TI;
exports.blessed = TI;
exports.contrib = TI;
exports.createScreen = createScreen;
exports.serverError = serverError;
