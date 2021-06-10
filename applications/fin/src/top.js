import { ATTACH, RESIZE, UNCAUGHT_EXCEPTION } from '@pres/enum-events'
import { Pres }                               from '@pres/terminal-interface'
import { MarketWatch }                        from './monitor'

const screen = Pres.screen()
const grid = Pres.grid({ rows: 12, cols: 12, screen: screen })

const lineChartCollection = {
  A1: grid.set(0, 0, 4, 4, Pres.lineChart, { name: 'lineChart', label: 'S&P 500', showLegend: true }),
  B1: grid.set(0, 4, 4, 4, Pres.lineChart, { name: 'lineChart', label: 'Dow Jones', showLegend: true }),
  C1: grid.set(0, 8, 4, 4, Pres.lineChart, { name: 'lineChart', label: 'Nasdaq', showLegend: true }),
  A2: grid.set(4, 0, 4, 4, Pres.lineChart, { name: 'lineChart', label: 'Shanghai', showLegend: true }),
  B2: grid.set(4, 4, 4, 4, Pres.lineChart, { name: 'lineChart', label: 'FTSE', showLegend: true }),
  C2: grid.set(4, 8, 4, 4, Pres.lineChart, { name: 'lineChart', label: 'Hang Seng', showLegend: true }),
  A3: grid.set(8, 0, 4, 4, Pres.lineChart, { name: 'lineChart', label: 'Nikkei', showLegend: true }),
  B3: grid.set(8, 4, 4, 4, Pres.lineChart, { name: 'lineChart', label: 'Euronext', showLegend: true }),
  C3: grid.set(8, 8, 4, 4, Pres.lineChart, { name: 'lineChart', label: 'Seoul', showLegend: true }),
}

lineChartCollection.A1.focus()
screen.render()
screen.on(RESIZE, () => {
  for (let key in lineChartCollection)
    lineChartCollection[key].emit(ATTACH)
  // listBar.emit(ATTACH)
  // box.emit(ATTACH)
})

screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))

export async function init() {
  const A1 = new MarketWatch(lineChartCollection.A1, 'sp500')
  const B1 = new MarketWatch(lineChartCollection.B1, 'dowJones')
  const C1 = new MarketWatch(lineChartCollection.C1, 'nasdaq')
  const A2 = new MarketWatch(lineChartCollection.A2, 'shanghai')
  const B2 = new MarketWatch(lineChartCollection.B2, 'ftse')
  const C2 = new MarketWatch(lineChartCollection.C2, 'hangSeng')
  const A3 = new MarketWatch(lineChartCollection.A3, 'nikkei')
  const B3 = new MarketWatch(lineChartCollection.B3, 'euronext')
  const C3 = new MarketWatch(lineChartCollection.C3, 'seoul')
  screen.emit('adjourn')
  await Promise.allSettled([
    A1.run(),
    B1.run(),
    C1.run(),
    A2.run(),
    B2.run(),
    C2.run(),
    A3.run(),
    B3.run(),
    C3.run(),
  ])
}

process.on(UNCAUGHT_EXCEPTION, err => {
  // avoid exiting due to unsupported system resources in Windows
})
