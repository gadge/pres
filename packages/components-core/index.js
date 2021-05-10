import { Box }            from './core/box'
import { Element }        from './core/element'
import { Node }           from './core/node'
import { Screen }         from './core/screen'
import { Layout }         from './src/layout'
import { Line }           from './src/line'
import { Log }            from './src/log'
import { ScrollableBox }  from './src/scrollable-box'
import { ScrollableText } from './src/scrollable-text'
import { Terminal }       from './src/terminal'

const box = (options) => new Box(options)
const element = (options) => new Element(options)
const node = (options) => new Node(options)
const screen = (options) => new Screen(options)
const layout = (options) => new Layout(options)
const line = (options) => new Line(options)
const log = (options) => new Log(options)
const scrollableBox = (options) => new ScrollableBox(options)
const scrollableText = (options) => new ScrollableText(options)
const terminal = (options) => new Terminal(options)

export {
  Box, box,
  Element, element,
  Node, node,
  Screen, screen,
  Layout, layout,
  Line, line,
  Log, log,
  ScrollableBox, scrollableBox,
  ScrollableText, scrollableText,
  Terminal, terminal,
}