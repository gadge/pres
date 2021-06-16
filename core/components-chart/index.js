import { BarChart }        from './src/bar-chart'
import { DonutChart }      from './src/donut-chart'
import { Gauge }           from './src/gauge'
import { GaugeList }       from './src/gauge-list'
import { LineChart }       from './src/line-chart'
import { Sparkline }       from './src/sparkline'
import { StackedBarChart } from './src/stacked-bar-chart'

const barChart = options => new BarChart(options)
const donutChart = options => new DonutChart(options)
const gauge = options => new Gauge(options)
const gaugeList = options => new GaugeList(options)
const lineChart = options => new LineChart(options)
const sparkline = options => new Sparkline(options)
const stackedBarChart = options => new StackedBarChart(options)

export {
  BarChart, barChart,
  DonutChart, donutChart,
  Gauge, gauge,
  GaugeList, gaugeList,
  LineChart, lineChart,
  Sparkline, sparkline,
  StackedBarChart, stackedBarChart,
}