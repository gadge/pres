const { ATTACH, RESIZE, UNCAUGHT_EXCEPTION } = require('@pres/enum-events'),
      { blessed }                            = require('@pres/terminal-interface'),
      { blessed: contrib }                   = require('@pres/terminal-interface'),
      monitor                                = require('./monitor')

const screen = blessed.screen()
const grid = contrib.grid({
  rows: 12,
  cols: 12,
  screen: screen,
})
const button = grid.set(4, 6, 4, 2, blessed.button, {})
const cpuLine = grid.set(0, 0, 4, 12, contrib.lineChart, {
  showNthLabel: 5,
  maxY: 100,
  label: 'CPU History',
  showLegend: true,
})
const memLine = grid.set(4, 0, 4, 8, contrib.lineChart, {
  showNthLabel: 5,
  maxY: 100,
  label: 'Memory and Swap History',
  showLegend: true,
  legend: {
    width: 10,
  },
})
const memDonut = grid.set(4, 8, 2, 4, contrib.donutChart, {
  radius: 8,
  arcWidth: 3,
  yPadding: 2,
  remainColor: 'black',
  label: 'Memory',
})
const swapDonut = grid.set(6, 8, 2, 4, contrib.donutChart, {
  radius: 8,
  arcWidth: 3,
  yPadding: 2,
  remainColor: 'black',
  label: 'Swap',
})
const netSpark = grid.set(8, 0, 2, 6, contrib.sparkline, {
  label: 'Network History',
  tags: true,
  style: { fg: 'blue' },
})
const diskDonut = grid.set(10, 0, 2, 6, contrib.donutChart, {
  radius: 8,
  arcWidth: 3,
  yPadding: 2,
  remainColor: 'black',
  label: 'Disk usage',
})
const procTable = grid.set(8, 6, 4, 6, contrib.dataTable, {
  keys: true,
  label: 'Processes',
  columnSpacing: 1,
  columnWidth: [ 7, 24, 7, 7 ],
})

procTable.focus()

screen.render()
screen.on(RESIZE, function (a) {
  cpuLine.emit(ATTACH)
  memLine.emit(ATTACH)
  memDonut.emit(ATTACH)
  swapDonut.emit(ATTACH)
  netSpark.emit(ATTACH)
  diskDonut.emit(ATTACH)
  procTable.emit(ATTACH)
})

screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))

function init() {
  new monitor.Cpu(cpuLine) //no Windows support
  new monitor.Mem(memLine, memDonut, swapDonut)
  new monitor.Net(netSpark)
  new monitor.Disk(diskDonut)
  new monitor.Proc(procTable) // no Windows support
}

process.on(UNCAUGHT_EXCEPTION, function (err) {
  // avoid exiting due to unsupported system resources in Windows
})

module.exports = {
  init: init,
  monitor: monitor,
}
