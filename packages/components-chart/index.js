import { BarChart }        from './src/bar-chart'
import { DonutChart }      from './src/donut-chart'
import { LineChart }       from './src/line-chart'
import { Sparkline }       from './src/sparkline'
import { StackedBarChart } from './src/stacked-bar-chart'

const barChart = options => new BarChart(options)
const lineChart = options => new LineChart(options)
const stackedBarChart = options => new StackedBarChart(options)
const donutChart = options => new DonutChart(options)
const sparkline = options => new Sparkline(options)

export {
  BarChart, barChart,
  LineChart, lineChart,
  StackedBarChart, stackedBarChart,
  DonutChart, donutChart,
  Sparkline, sparkline,
}