import { assign } from '@ject/mixin'
import * as components
                  from '@pres/components'
import {
  Program
}                 from '@pres/program'
import {
  TerminfoParser
}                 from '@pres/terminfo-parser'
import * as colors
                  from '@pres/util-blessed-colors'
import * as helpers
                  from '@pres/util-helpers'
import * as unicode
                  from '@pres/util-unicode'
import url
                  from 'url'

export { ANSIImage, BarChart, BigText, Box, Button, Canvas, Carousel, Checkbox, DataTable, DonutChart, FileManager, Form, Gauge, GaugeList, Grid, Image, Input, LCD, Layout, Line, LineChart, List, ListBar, ListTable, Loading, Log, LogList, Map, Message, OverlayImage, Picture, ProgressBar, Prompt, Question, RadioButton, RadioSet, Screen, ScrollableBox, ScrollableText, Sparkline, StackedBarChart, Table, Terminal, Text, Textarea, Textbox, Tree, Video }from '@pres/components';

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
  static program = Program.build;
  static build = Program.build;
  static helpers = helpers;
  static unicode = unicode;
  static colors = colors;
  static TerminfoParser = TerminfoParser;
}
assign(TI, components);

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
  const query = url.parse(req.url, true).query;
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
  return Screen.build({
    program: program
  });
}

export { InputBuffer, OutputBuffer, TI as Pres, TI, TI as TerminalInterface, TI as blessed, TI as contrib, createScreen, serverError };
