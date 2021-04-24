import { BarChart, Canvas, Carousel, Grid, LineChart, StackedBarChart } from '@pres/components'
import { Donut }                                                        from './widget/donut'
import { Gauge }                                                        from './widget/gauge'
import { GaugeList }                                                    from './widget/gauge-list'
import { LCD }                                                          from './widget/lcd'
import { Log }                                                          from './widget/log'
import { Map }                                                          from './widget/map'
import { Markdown }                                                     from './widget/markdown'
import { Picture }                                                      from './widget/picture'
import { Sparkline }                                                    from './widget/sparkline'
import { Table }                                                        from './widget/table'
import { Tree }                                                         from './widget/tree'

export const carousel = (pages, options) => new Carousel(pages, options)
export const grid = options => new Grid(options)
export const canvas = (options, canvasType) => new Canvas(options, canvasType)
export const barChart = options => new BarChart(options)
export const line = options => new LineChart(options)
export const stackedBarChart = options => new StackedBarChart(options)
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
  Carousel,
  Grid,
  Canvas,
  BarChart,
  LineChart,
  StackedBarChart,
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
}