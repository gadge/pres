import { BlueGrey, Indigo, LightBlue }                                             from '@palett/cards'
import { Box, DataTable, DonutChart, Grid, LineChart, ListBar, Screen, Sparkline } from '@pres/components'
import { ATTACH, RESIZE, UNCAUGHT_EXCEPTION }                                      from '@pres/enum-events'
import si                                                                          from 'systeminformation'
import { Cpu }                                                                     from './src/cpu.js'
import { Disk }                                                                    from './src/disk.js'
import { Mem }                                                                     from './src/mem.js'
import { Net }                                                                     from './src/net.js'
import { Proc }                                                                    from './src/proc.js'

const screen = Screen.build({ padding: 1, })
const grid = Grid.build({ rows: 12, cols: 12, screen: screen, })
/**
 *
 * @type {{
 * cpuLine: LineChart,
 * memLine: LineChart
 * memDonut: DonutChart,
 * swapDonut: DonutChart,
 * diskDonut: DonutChart,
 * networkSparkline: Sparkline,
 * }}
 */
const charts = {
  cpuLine: grid.set(0, 0, 5, 12, LineChart.build, {
    name: 'lineChart',
    showNthLabel: 5,
    maxY: 100,
    label: 'CPU History',
    showLegend: true,
  }),
  memLine: grid.set(5, 0, 2, 6, LineChart.build, {
    showNthLabel: 5,
    maxY: 100,
    label: 'Memory and Swap History',
    showLegend: true,
    legend: { width: 10, },
  }),
  networkSparkline: grid.set(7, 0, 2, 6, Sparkline.build, {
    label: 'Network History',
    tags: true,
    style: { fg: 'blue' },
  }),
  diskDonut: grid.set(9, 0, 2, 4, DonutChart.build, {
    radius: 8,
    arcWidth: 3,
    yPadding: 2,
    remainColor: 'black',
    label: 'Disk usage',
  }),
  memDonut: grid.set(9, 4, 2, 4, DonutChart.build, {
    radius: 8,
    arcWidth: 3,
    yPadding: 2,
    remainColor: 'black',
    label: 'Memory',
  }),
  swapDonut: grid.set(9, 8, 2, 4, DonutChart.build, {
    radius: 8,
    arcWidth: 3,
    yPadding: 2,
    remainColor: 'black',
    label: 'Swap',
  })
}
const tables = {
  process: grid.set(5, 6, 4, 6, DataTable.build, {
    keys: true,
    label: 'Processes',
    columnSpacing: 1,
    columnWidth: [ 7, 24, 7, 7 ],
  })
}

const box = grid.set(11, 8, 1, 4, Box.build, {
  align: 'center',
  valign: 'middle',
  content: '...'
})
const listBar = grid.set(11, 0, 1, 8, ListBar.build, {
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

tables.process.focus()
screen.render()
screen.on(RESIZE, () => {
  charts.cpuLine.emit(ATTACH)
  charts.memLine.emit(ATTACH)
  charts.memDonut.emit(ATTACH)
  charts.swapDonut.emit(ATTACH)
  charts.networkSparkline.emit(ATTACH)
  charts.diskDonut.emit(ATTACH)
  tables.process.emit(ATTACH)
  listBar.emit(ATTACH)
  box.emit(ATTACH)
})

screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))

export async function init() {
  const cpu = new Cpu() //no Windows support
  const mem = new Mem()
  const net = new Net()
  const disk = new Disk()
  const proc = new Proc() // no Windows support
  screen.key([ 'm', 'c', 'p' ], async (ch, key) => {
    proc.readKey = ch
    proc.resetIndex = true
    await si.processes().then(data => {
      tables.process.update(proc.dataToTable(data))
      proc.tryReset(tables.process)
      screen.render()
    })
  })
  screen.emit('adjourn')
  await Promise.allSettled([
    cpu.setInterval(1000, seriesCollection => { charts.cpuLine.update(seriesCollection), screen.render() }),
    mem.setInterval(1000, seriesCollection => {
      charts.memLine.update(seriesCollection)
      charts.memDonut.update(mem.memSnapshot())
      charts.swapDonut.update(mem.swapSnapshot())
      screen.render()
    }),
    net.setInterval(1000, seriesCollection => { charts.networkSparkline.update(seriesCollection), screen.render() }),
    proc.setInterval(3000, table => { tables.process.update(table), proc.tryReset(tables.process), screen.render() }),
    disk.setInterval(10000, seriesCollection => { charts.diskDonut.update(seriesCollection), screen.render() })
  ])
}

process.on(UNCAUGHT_EXCEPTION, err => {
  // avoid exiting due to unsupported system resources in Windows
})
