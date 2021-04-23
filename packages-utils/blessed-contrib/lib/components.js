import { Carousel }   from './layout/carousel'
import { Grid }       from './layout/grid'
import { Canvas }     from './widget/canvas'
import { Bar }        from './widget/charts/bar'
import { Line }       from './widget/charts/line'
import { StackedBar } from './widget/charts/stacked-bar'
import { Donut }      from './widget/donut'
import { Gauge }      from './widget/gauge'
import { GaugeList }  from './widget/gauge-list'
import { LCD }        from './widget/lcd'
import { Log }        from './widget/log'
import { Map }        from './widget/map'
import { Markdown }   from './widget/markdown'
import { Picture }    from './widget/picture'
import { Sparkline }  from './widget/sparkline'
import { Table }      from './widget/table'
import { Tree }       from './widget/tree'

export const carousel = (pages, options) => new Carousel(pages, options)
export const grid = options => new Grid(options)
export const canvas = (options, canvasType) => new Canvas(options, canvasType)
export const bar = options => new Bar(options)
export const line = options => new Line(options)
export const stackedBar = options => new StackedBar(options)
export const donut = options => new Donut(options)
export const gauge = options => new Gauge(options)
export const gaugeList = options => new GaugeList(options)
export const lcd = options => new LCD(options)
export const log = options => new Log(options)
export const map = options => new Map(options)
export const markdown = options => new Markdown(options)
export const picture = options => new Picture(options)
export const sparkline = options => new Sparkline(options)
export const table = options => new Table(options)
export const tree = options => new Tree(options)
export {
  Canvas,
  Donut,
  Gauge,
  GaugeList,
  LCD,
  Log,
  Map,
  Markdown,
  Picture,
  Sparkline,
  Table,
  Tree,
  Bar,
  Line,
  StackedBar,
  Carousel,
  Grid,
}