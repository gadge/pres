import { BarChart }        from './src/bar-chart'
import { DonutChart }      from './src/donut-chart'
import { LineChart }       from './src/line-chart'
import { Sparkline }       from './src/sparkline'
import { StackedBarChart } from './src/stacked-bar-chart'

export const barChart = options => new BarChart(options)
export const lineChart = options => new LineChart(options)
export const stackedBarChart = options => new StackedBarChart(options)
export const donutChart = options => new DonutChart(options)
export const sparkline = options => new Sparkline(options)

export {
  BarChart,
  LineChart,
  StackedBarChart,
  DonutChart,
  Sparkline,
}