import { BarChart, Canvas, Carousel, DonutChart, Grid, LineChart, Sparkline, StackedBarChart } from '@pres/components'
import { Gauge }                                                                               from '@pres/components-chart/src/gauge.js'
import { GaugeList }                                                                           from '@pres/components-chart/src/gauge-list.js'
import { LCD }                                                                                 from '@pres/components-text/src/lcd'
import { Log }                                                                                 from '@pres/components-text/src/log'
import { Map }                                                                                 from '@pres/components-geo/src/map.js'
import { Markdown }                                                                            from '@pres/components-text/markdown'
import { Picture }  from './widget/picture'
import { DataTable }                                                                           from './widget/table'
import { Tree }                                                                                from '@pres/components-data/src/tree.js'



export const picture = options => new Picture(options)



export {
  Carousel,
  Grid,
  Canvas,
  BarChart,
  LineChart,
  StackedBarChart,
  DonutChart,
  Sparkline,
  Gauge,
  GaugeList,
  LCD,
  Log,
  Map,
  Markdown,
  Picture,
  DataTable,
  Tree,
}