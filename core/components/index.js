import { BarChart, DonutChart, Gauge, GaugeList, LineChart, Sparkline, StackedBarChart } from '@pres/components-chart'
import {
  Box, Element, Layout, Line, Log, Screen, ScrollableBox, ScrollableText, Terminal
}                                                                                        from '@pres/components-core'
import {
  DataTable, List, ListBar, ListTable, Table, Tree
}                                                                                        from '@pres/components-data'
import {
  Button, Checkbox, FileManager, Form, Input, Prompt, Question, RadioButton, RadioSet, Textarea, Textbox
}                                                                                        from '@pres/components-form'
import { Map }                                                                           from '@pres/components-geo'
import {
  LCD, Loading, Message, ProgressBar
}                                                                                        from '@pres/components-inform'
import {
  Canvas, Carousel, Grid
}                                                                                        from '@pres/components-layout'
import {
  LogList, Markdown, Text
}                                                                                        from '@pres/components-text'
import {
  ANSIImage as PNG, ANSIImage, BigText, Image, OverlayImage, Picture, Video
}                                                                                        from '@pres/components-visual'

export class Pres {
  // chart
  static barChart(options) { return new BarChart(options) }
  static donutChart(options) { return new DonutChart(options) }
  static gauge(options) { return new Gauge(options) }
  static gaugeList(options) { return new GaugeList(options) }
  static lineChart(options) { return new LineChart(options) }
  static sparkline(options) { return new Sparkline(options) }
  static stackedBarChart(options) { return new StackedBarChart(options) }
  // core
  static box(options) { return new Box(options) }
  static element(options) { return new Element(options) }
  static screen(options) { return new Screen(options) }
  static layout(options) { return new Layout(options) }
  static line(options) { return new Line(options) }
  static log(options) { return new Log(options) }
  static scrollableBox(options) { return new ScrollableBox(options) }
  static scrollableText(options) { return new ScrollableText(options) }
  static terminal(options) { return new Terminal(options) }
  // data
  static dataTable(options) { return new DataTable(options) }
  static list(options) { return new List(options) }
  static listBar(options) { return new ListBar(options) }
  static listTable(options) { return new ListTable(options) }
  static table(options) { return new Table(options) }
  static tree(options) { return new Tree(options) }
  // form
  static button(options) { return new Button(options) }
  static checkbox(options) { return new Checkbox(options) }
  static fileManager(options) { return new FileManager(options) }
  static form(options) { return new Form(options) }
  static input(options) { return new Input(options) }
  static prompt(options) { return new Prompt(options) }
  static question(options) { return new Question(options) }
  static radioButton(options) { return new RadioButton(options) }
  static radioSet(options) { return new RadioSet(options) }
  static textbox(options) { return new Textbox(options) }
  static textarea(options) { return new Textarea(options) }
  // geo
  static map(options) { return new Map(options) }
  // inform
  static lcd(options) { return new LCD(options) }
  static loading(options) { return new Loading(options) }
  static message(options) { return new Message(options) }
  static progressBar(options) { return new ProgressBar(options) }
  // layout
  static canvas(options, canvasType) { return new Canvas(options, canvasType) }
  static carousel(pages, options) { return new Carousel(pages, options) }
  static grid(options) { return new Grid(options) }
  // text
  static logList(options) { return new LogList(options) }
  static markdown(options) { return new Markdown(options) }
  static text(options) { return new Text(options) }
  // visual
  static ansiImage(options) { return new ANSIImage(options) }
  static bigText(options) { return new BigText(options) }
  static image(options) { return new Image(options) }
  static overlayImage(options) { return new OverlayImage(options) }
  static picture(options) { return new Picture(options) }
  static png(options) { return new PNG(options) }
  static video(options) { return new Video(options) }
}
