import { flop, rand, ziggurat } from '@aryth/rand'
import { ATTACH, RESIZE }       from '@pres/enum-events'
import { last }                 from '@vect/vector-index'
import { TI }                   from '../src/terminal-interface'

const normDist = ziggurat(0, 5, 0)

const screen = TI.screen()
//create layout and widgets
const grid = TI.grid({ rows: 12, cols: 12, screen: screen })

/**
 * DonutChart Options
 self.options.radius = options.radius || 14; // how wide is it? over 5 is best
 self.options.arcWidth = options.arcWidth || 4; //width of the donutChart
 self.options.yPadding = options.yPadding || 2; //padding from the top
 */
const donut = grid.set(8, 8, 4, 2, TI.donutChart, {
  label: 'Percent DonutChart',
  radius: 16,
  arcWidth: 4,
  yPadding: 2,
  data: [ { label: 'Storage', percent: 87 } ]
})
// var latencyLine = grid.set(8, 8, 4, 2, TI.lineChart,
//   { style: 
//     { line: 'yellow'
//     , text: 'green'
//     , baseline: 'black'}
//   , xLabelPadding: 3
//   , xPadding: 5
//   , label: 'Network Latency (sec)'})
const gauge = grid.set(8, 10, 2, 2, TI.gauge, { label: 'Storage', percent: [ 80, 20 ] })
const gauge_two = grid.set(2, 9, 2, 3, TI.gauge, { label: 'Deployment Progress', percent: 80 })
const sparkline = grid.set(10, 10, 2, 2, TI.sparkline, {
  label: 'Throughput (bits/sec)',
  tags: true,
  style: { fg: 'blue', titleFg: 'white' }
})
const bar = grid.set(4, 6, 4, 3, TI.barChart, {
  label: 'Server Utilization (%)',
  barWidth: 4,
  barSpacing: 6,
  xOffset: 2,
  maxHeight: 9
})
const dataTable = grid.set(4, 9, 4, 3, TI.dataTable, {
  keys: true,
  fg: 'green',
  label: 'Active Processes',
  columnSpacing: 1,
  columnWidth: [ 24, 10, 10 ]
})

/*
 *
 * LCD Options
//these options need to be modified epending on the resulting positioning/size
  options.segmentWidth = options.segmentWidth || 0.06; // how wide are the segments in % so 50% = 0.5
  options.segmentInterval = options.segmentInterval || 0.11; // spacing between the segments in % so 50% = 0.5
  options.strokeWidth = options.strokeWidth || 0.11; // spacing between the segments in % so 50% = 0.5
//default display settings
  options.elements = options.elements || 3; // how many elements in the display. or how many characters can be displayed.
  options.display = options.display || 321; // what should be displayed before anything is set
  options.elementSpacing = options.spacing || 4; // spacing between each element
  options.elementPadding = options.padding || 2; // how far away from the edges to put the elements
//coloring
  options.color = options.color || 'white';
*/
const lcdLineOne = grid.set(0, 9, 2, 3, TI.lcd, {
  label: 'LCD Test',
  segmentWidth: 0.06,
  segmentInterval: 0.11,
  strokeWidth: 0.1,
  elements: 5,
  display: 3210,
  elementSpacing: 4,
  elementPadding: 2
})
const errorsLine = grid.set(0, 6, 4, 3, TI.lineChart, {
  style: {
    line: 'red',
    text: 'white',
    baseline: 'black'
  },
  label: 'Errors Rate',
  maxY: 60,
  showLegend: true
})
const transactionsLine = grid.set(0, 0, 6, 6, TI.lineChart, {
  showNthLabel: 5,
  maxY: 100,
  label: 'Total Transactions',
  showLegend: true,
  legend: { width: 10 }
})
const map = grid.set(6, 0, 6, 6, TI.map, { label: 'Servers Location' })
const logList = grid.set(8, 6, 4, 2, TI.logList, {
  fg: 'green',
  selectedFg: 'green',
  label: 'Server Log'
})
//dummy data
const servers = [ 'US1', 'US2', 'EU1', 'AU1', 'AS1', 'JP1' ]
const commands = [ 'grep', 'node', 'java', 'timer', '~/ls -l', 'netns', 'watchdog', 'gulp', 'tar -xvf', 'awk', 'npm install' ]
//set dummy data on gauge
let gauge_percent = 0
setInterval(() => {
  gauge.setData([ gauge_percent, 100 - gauge_percent ])
  gauge_percent++
  if (gauge_percent >= 100) gauge_percent = 0
}, 200)
let gauge_percent_two = 0
setInterval(() => {
  gauge_two.setData(gauge_percent_two)
  gauge_percent_two++
  if (gauge_percent_two >= 100) gauge_percent_two = 0
}, 200)
//set dummy data on barchart chart
function fillBar() {
  const arr = []
  for (let i = 0; i < servers.length; i++) arr.push(rand(10))
  bar.setData({ titles: servers, data: arr })
}
fillBar()
setInterval(fillBar, 2000)
//set dummy data for dataTable
function generateTable() {
  const data = []
  for (let i = 0; i < 30; i++) {
    const row = []
    row.push(commands[rand(commands.length - 1)])
    row.push(rand(5))
    row.push(rand(100))
    data.push(row)
  }
  dataTable.setData({ headers: [ 'Process', 'Cpu (%)', 'Memory' ], data: data })
}
generateTable()
dataTable.focus()
setInterval(generateTable, 3000)
//set logList dummy data
setInterval(function () {
  const rnd = rand(2)
  if (rnd === 0) logList.log('starting process ' + flop(commands))
  else if (rnd === 1) logList.log('terminating server ' + flop(servers))
  else if (rnd === 2) logList.log('avg. wait time ' + Math.random().toFixed(2))
  screen.render()
}, 500)
//set spark dummy data
const spark1 = [ 1, 2, 5, 2, 1, 5, 1, 2, 5, 2, 1, 5, 4, 4, 5, 4, 1, 5, 1, 2, 5, 2, 1, 5, 1, 2, 5, 2, 1, 5, 1, 2, 5, 2, 1, 5 ]
const spark2 = [ 4, 4, 5, 4, 1, 5, 1, 2, 5, 2, 1, 5, 4, 4, 5, 4, 1, 5, 1, 2, 5, 2, 1, 5, 1, 2, 5, 2, 1, 5, 1, 2, 5, 2, 1, 5 ]
refreshSpark()
setInterval(refreshSpark, 1000)
function refreshSpark() {
  spark1.shift()
  spark1.push(Math.random() * 5 + 1)
  spark2.shift()
  spark2.push(Math.random() * 5 + 1)
  sparkline.setData([ 'Server1', 'Server2' ], [ spark1, spark2 ])
}
//set map dummy markers
let marker = true
setInterval(() => {
  if (marker) {
    map.addMarker({ 'lon': '-79.0000', 'lat': '37.5000', color: 'yellow', char: 'X' })
    map.addMarker({ 'lon': '-122.6819', 'lat': '45.5200' })
    map.addMarker({ 'lon': '-6.2597', 'lat': '53.3478' })
    map.addMarker({ 'lon': '103.8000', 'lat': '1.3000' })
  }
  else { map.clearMarkers() }
  marker = !marker
  screen.render()
}, 1000)
//set line charts dummy data
const transactionsUSA = {
  title: 'USA',
  style: { line: 'red' },
  x: [ '00:00', '00:05', '00:10', '00:15', '00:20', '00:30', '00:40', '00:50', '01:00', '01:10', '01:20', '01:30', '01:40', '01:50', '02:00', '02:10', '02:20', '02:30', '02:40', '02:50', '03:00', '03:10', '03:20', '03:30', '03:40', '03:50', '04:00', '04:10', '04:20', '04:30' ],
  y: [ 0, 20, 40, 45, 45, 50, 55, 70, 65, 58, 50, 55, 60, 65, 70, 80, 70, 50, 40, 50, 60, 70, 82, 88, 89, 89, 89, 80, 72, 70 ]
}
const transactionsEuro = {
  title: 'Europe',
  style: { line: 'yellow' },
  x: [ '00:00', '00:05', '00:10', '00:15', '00:20', '00:30', '00:40', '00:50', '01:00', '01:10', '01:20', '01:30', '01:40', '01:50', '02:00', '02:10', '02:20', '02:30', '02:40', '02:50', '03:00', '03:10', '03:20', '03:30', '03:40', '03:50', '04:00', '04:10', '04:20', '04:30' ],
  y: [ 0, 5, 5, 10, 10, 15, 20, 30, 25, 30, 30, 20, 20, 30, 30, 20, 15, 15, 19, 25, 30, 25, 25, 20, 25, 30, 35, 35, 30, 30 ]
}
const errorsData = {
  title: 'server 1',
  x: [ '00:00', '00:05', '00:10', '00:15', '00:20', '00:25' ],
  y: [ 30, 50, 70, 40, 50, 20 ]
}
const latencyData = {
  x: [ 't1', 't2', 't3', 't4' ],
  y: [ 5, 1, 7, 5 ]
}
setLineData([ transactionsUSA, transactionsEuro ], transactionsLine)
setLineData([ errorsData ], errorsLine)
// setLineData([latencyData], latencyLine)
setInterval(() => {
  setLineData([ transactionsUSA, transactionsEuro ], transactionsLine)
  screen.render()
}, 500)
setInterval(() => setLineData([ errorsData ], errorsLine), 1500)
setInterval(() => {
  const colors = [ 'green', 'magenta', 'cyan', 'red', 'blue' ]
  const text = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L' ]
  const value = rand(100)
  lcdLineOne.setDisplay(value + text[value % 12])
  lcdLineOne.setOptions({
    color: colors[value % 5],
    elementPadding: 4
  })
  screen.render()
}, 1500)
let pct = 0.00
function updateDonut() {
  if (pct > 0.99) pct = 0.00
  let color = 'green'
  if (pct >= 0.25) color = 'cyan'
  if (pct >= 0.5) color = 'yellow'
  if (pct >= 0.75) color = 'red'
  donut.setData([
    { percent: parseFloat(( pct + 0.00 ) % 1).toFixed(2), label: 'storage', 'color': color } ])
  pct += 0.01
}
setInterval(() => { updateDonut(), screen.render() }, 500)

/**
 *
 * @param {{x:*[],y:number[]}[]} seriesCollection
 * @param line
 */
function setLineData(seriesCollection, line) {
  for (let series of seriesCollection) {
    let v = series.y|> last
    series.y.shift()
    v = Math.max(v + normDist.next().value, 10)
    series.y.push(v)
  }
  line.setData(seriesCollection)
}

screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))
// fixes https://github.com/yaronn/TerminalInterface-contrib/issues/10

screen.on(RESIZE, () => {
  donut.emit(ATTACH)
  gauge.emit(ATTACH)
  gauge_two.emit(ATTACH)
  sparkline.emit(ATTACH)
  bar.emit(ATTACH)
  dataTable.emit(ATTACH)
  lcdLineOne.emit(ATTACH)
  errorsLine.emit(ATTACH)
  transactionsLine.emit(ATTACH)
  map.emit(ATTACH)
  logList.emit(ATTACH)
})
screen.render()
screen.emit('adjourn')
