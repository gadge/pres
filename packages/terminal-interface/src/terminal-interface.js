import * as components from '@pres/components'
import {
  ANSIImage, BarChart, BigText, Box, Button, Canvas, Carousel, Checkbox, DataTable, DonutChart, FileManager, Form,
  Gauge, GaugeList, Grid, Image, Input, Layout, LCD, Line, LineChart, List, ListBar, ListTable, Loading, Log, LogList,
  Map, Markdown, Message, Node, OverlayImage, Picture, ProgressBar, Prompt, Question, RadioButton, RadioSet, Screen,
  ScrollableBox, ScrollableText, Sparkline, StackedBarChart, Table, Terminal, Text, Textarea, Textbox, Tree, Video
}                      from '@pres/components'
import { Program }     from '@pres/program'
import { Tput }        from '@pres/terminfo-parser'
import * as colors     from '@pres/util-colors'
import * as helpers    from '@pres/util-helpers'
import * as unicode    from '@pres/util-unicode'

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
export class TI {
  static program = Program.build
  static build = Program.build
  static helpers = helpers
  static unicode = unicode
  static colors = colors
  static Tput = Tput
}

Object.assign(TI, components)

// // chart
// static barChart = barChart
// static donutChart = donutChart
// static gauge = gauge
// static gaugeList = gaugeList
// static lineChart = lineChart
// static sparkline = sparkline
// static stackedBarChart = stackedBarChart
// // core
// static box = box
// static element = element
// static node = node
// static screen = screen
// static layout = layout
// static line = line
// static log = log
// static scrollableBox = scrollableBox
// static scrollableText = scrollableText
// static terminal = terminal
// // data
// static  dataTable = dataTable
// static  list = list
// static  listBar = listBar
// static  listTable = listTable
// static  table = table
// static  tree = tree
// // form
// static  button = button
// static  checkbox = checkbox
// static  fileManager = fileManager
// static  form = form
// static  input = input
// static  prompt = prompt
// static  question = question
// static  radioButton = radioButton
// static  radioSet = radioSet
// static  textbox = textbox
// static  textarea = textarea
// // geo
// static map = map
// // inform
// static lcd = lcd
// static loading = loading
// static message = message
// static progressBar = progressBar
// // layout
// static canvas = canvas
// static carousel = carousel
// static grid = grid
// // text
// static logList = logList
// static markdown = markdown
// static text = text
// // visual
// static ansiImage = ansiImage
// static bigText = bigText
// static image = image
// static overlayImage = overlayImage
// static picture = picture
// static png = png
// static video = video


