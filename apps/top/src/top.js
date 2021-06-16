import { BlueGrey, Indigo, LightBlue }        from '@palett/cards'
import { ATTACH, RESIZE, UNCAUGHT_EXCEPTION } from '@pres/enum-events'
import { Pres }                               from '@pres/terminal-interface'
import * as monitor                           from './monitor'

const screen = Pres.screen({
  padding: 1,
})
const grid = Pres.grid({
  rows: 12,
  cols: 12,
  screen: screen,
})

const lineChartCPU = grid.set(0, 0, 5, 12, Pres.lineChart, {
  name: 'lineChart',
  showNthLabel: 5,
  maxY: 100,
  label: 'CPU History',
  showLegend: true,
})

const lineChartMem = grid.set(5, 0, 2, 6, Pres.lineChart, {
  showNthLabel: 5,
  maxY: 100,
  label: 'Memory and Swap History',
  showLegend: true,
  legend: { width: 10, },
})
const sparklineNetwork = grid.set(7, 0, 2, 6, Pres.sparkline, {
  label: 'Network History',
  tags: true,
  style: { fg: 'blue' },
})
const tableProcesses = grid.set(5, 6, 4, 6, Pres.dataTable, {
  keys: true,
  label: 'Processes',
  columnSpacing: 1,
  columnWidth: [ 7, 24, 7, 7 ],
})

const donutChartDisk = grid.set(9, 0, 2, 4, Pres.donutChart, {
  radius: 8,
  arcWidth: 3,
  yPadding: 2,
  remainColor: 'black',
  label: 'Disk usage',
})
const donutChartMem = grid.set(9, 4, 2, 4, Pres.donutChart, {
  radius: 8,
  arcWidth: 3,
  yPadding: 2,
  remainColor: 'black',
  label: 'Memory',
})
const donutChartSwap = grid.set(9, 8, 2, 4, Pres.donutChart, {
  radius: 8,
  arcWidth: 3,
  yPadding: 2,
  remainColor: 'black',
  label: 'Swap',
})
const box = grid.set(11, 8, 1, 4, Pres.box, {
  align: 'center',
  valign: 'middle',
  content: '...'
})
const listBar = grid.set(11, 0, 1, 8, Pres.listBar, {
  top: 'center',
  left: 'center',
  mouse: true,
  keys: true,
  autoCommandKeys: true,
  border: 'line',
  vi: true,
  style: {
    // bg: Pink.lighten_4,
    item: { bg: BlueGrey.darken_4, hover: { bg: LightBlue.base } }, // focus: { bg: 'blue' }
    selected: { bg: Indigo.accent_4 }
  },
  commands: {
    home: { keys: [ 'a' ], callback() { box.setContent('Pressed home.'), screen.render() } },
    favorite: { keys: [ 'b' ], callback() { box.setContent('Pressed favorite.'), screen.render() } },
    search: { keys: [ 'c' ], callback() { box.setContent('Pressed search.'), screen.render() } },
    refresh: { keys: [ 'd' ], callback() { box.setContent('Pressed refresh.'), screen.render() } },
    about: { keys: [ 'e' ], callback() { box.setContent('Pressed about.'), screen.render() } },
  }
})

tableProcesses.focus()
screen.render()
screen.on(RESIZE, () => {
  lineChartCPU.emit(ATTACH)
  lineChartMem.emit(ATTACH)
  donutChartMem.emit(ATTACH)
  donutChartSwap.emit(ATTACH)
  sparklineNetwork.emit(ATTACH)
  donutChartDisk.emit(ATTACH)
  tableProcesses.emit(ATTACH)
  listBar.emit(ATTACH)
  box.emit(ATTACH)
})

screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))

export async function init() {
  const cpu = new monitor.Cpu(lineChartCPU) //no Windows support
  new monitor.Mem(lineChartMem, donutChartMem, donutChartSwap)
  new monitor.Net(sparklineNetwork)
  new monitor.Disk(donutChartDisk)
  const proc = new monitor.Proc(tableProcesses) // no Windows support
  screen.emit('adjourn')
  await Promise.all([ cpu.run(), proc.run() ])
}

process.on(UNCAUGHT_EXCEPTION, err => {
  // avoid exiting due to unsupported system resources in Windows
})
