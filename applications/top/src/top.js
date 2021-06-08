import { BlueGrey, Indigo, LightBlue, Pink, Red } from '@palett/cards'
import { ATTACH, RESIZE, UNCAUGHT_EXCEPTION }     from '@pres/enum-events'
import { Pres }                                   from '@pres/terminal-interface'
import * as monitor                               from './monitor'

const screen = Pres.screen()
const grid = Pres.grid({
  rows: 12,
  cols: 12,
  screen: screen,
})

const cpuLine = grid.set(0, 0, 5, 12, Pres.lineChart, {
  name: 'lineChart',
  showNthLabel: 5,
  maxY: 100,
  label: 'CPU History',
  showLegend: true,
})

const memLine = grid.set(5, 0, 2, 6, Pres.lineChart, {
  showNthLabel: 5,
  maxY: 100,
  label: 'Memory and Swap History',
  showLegend: true,
  legend: { width: 10, },
})
const netSpark = grid.set(7, 0, 2, 6, Pres.sparkline, {
  label: 'Network History',
  tags: true,
  style: { fg: 'blue' },
})
const procTable = grid.set(5, 6, 4, 6, Pres.dataTable, {
  keys: true,
  label: 'Processes',
  columnSpacing: 1,
  columnWidth: [ 7, 24, 7, 7 ],
})

const diskDonut = grid.set(9, 0, 2, 4, Pres.donutChart, {
  radius: 8,
  arcWidth: 3,
  yPadding: 2,
  remainColor: 'black',
  label: 'Disk usage',
})
const memDonut = grid.set(9, 4, 2, 4, Pres.donutChart, {
  radius: 8,
  arcWidth: 3,
  yPadding: 2,
  remainColor: 'black',
  label: 'Memory',
})
const swapDonut = grid.set(9, 8, 2, 4, Pres.donutChart, {
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

procTable.focus()
screen.render()
screen.on(RESIZE, () => {
  cpuLine.emit(ATTACH)
  memLine.emit(ATTACH)
  memDonut.emit(ATTACH)
  swapDonut.emit(ATTACH)
  netSpark.emit(ATTACH)
  diskDonut.emit(ATTACH)
  procTable.emit(ATTACH)
  listBar.emit(ATTACH)
  box.emit(ATTACH)
})

screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))

export async function init() {
  new monitor.Cpu(cpuLine) //no Windows support
  new monitor.Mem(memLine, memDonut, swapDonut)
  new monitor.Net(netSpark)
  new monitor.Disk(diskDonut)
  const proc = new monitor.Proc(procTable) // no Windows support
  screen.emit('adjourn')
  await proc.run()
}

process.on(UNCAUGHT_EXCEPTION, err => {
  // avoid exiting due to unsupported system resources in Windows
})
