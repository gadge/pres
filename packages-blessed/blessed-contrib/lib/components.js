import { BarChart, Canvas, Carousel, DonutChart, Grid, LineChart, Sparkline, StackedBarChart } from '@pres/components'
import { Gauge }                                                                               from '@pres/components-chart/src/gauge'
import { GaugeList } from '@pres/components-chart/src/gauge-list'
import { LCD }       from '@pres/components-text/src/lcd'
import { Log }       from '@pres/components-text/src/log'
import { Map }      from '../../../packages/components-geo/src/map'
import { Markdown } from '@pres/components-text/markdown'
import { Picture }  from './widget/picture'
import { DataTable } from './widget/table'
import { Tree }      from '@pres/components-data/src/tree'



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