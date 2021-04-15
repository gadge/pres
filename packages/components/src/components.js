import {
  Box,
  Element,
  Layout,
  Line,
  Log,
  Node,
  Screen,
  ScrollableBox,
  ScrollableText,
  Terminal,
}                from '@pres/components-core'
import {
  List,
  Listbar,
  ListTable,
  Table,
}                from '@pres/components-data'
import {
  Button,
  Checkbox,
  FileManager,
  Form,
  Input,
  Prompt,
  Question,
  RadioButton,
  RadioSet,
}                from '@pres/components-form'
import {
  Loading,
  Message,
  ProgressBar,
}                from '@pres/components-inform'
import { Text, } from '@pres/components-text'
import {
  ANSIImage,
  BigText,
  Image,
  OverlayImage,
  PNG,
  Video,
}                from '@pres/components-visual'

export const box = (options) => new Box(options)
export const element = function (options) {
  // return options.scrollable && !this._ignore && this.type !== 'scrollable-box'
  //   ? new ScrollableElement(options)
  //   :
    return new Element(options)
}
export const node = (options) => new Node(options)
export const screen = (options) => new Screen(options)
export const log = (options) => new Log(options)
export const scrollablebox = (options) => new ScrollableBox(options)
export const scrollabletext = (options) => new ScrollableText(options)
export const layout = (options) => new Layout(options)
export const line = (options) => new Line(options)
export const terminal = (options) => new Terminal(options)

export const list = (options) => new List(options)
export const listbar = (options) => new Listbar(options)
export const listtable = (options) => new ListTable(options)
export const table = (options) => new Table(options)

export const button = (options) => new Button(options)
export const checkbox = (options) => new Checkbox(options)
export const filemanager = (options) => new FileManager(options)
export const form = (options) => new Form(options)
export const input = (options) => new Input(options)
export const prompt = (options) => new Prompt(options)
export const question = (options) => new Question(options)
export const radiobutton = (options) => new RadioButton(options)
export const radioset = (options) => new RadioSet(options)

export const loading = (options) => new Loading(options)
export const message = (options) => new Message(options)
export const progressbar = (options) => new ProgressBar(options)

export const text = (options) => new Text(options)

export const ansiimage = (options) => new ANSIImage(options)
export const bigtext = (options) => new BigText(options)
export const image = (options) => new Image(options)
export const overlayimage = (options) => new OverlayImage(options)
export const png = (options) => new PNG(options)
export const video = (options) => new Video(options)

































