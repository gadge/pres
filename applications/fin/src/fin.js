import { ATTACH, PRESS, RESIZE, UNCAUGHT_EXCEPTION } from '@pres/enum-events'
import { Pres }                                      from '@pres/terminal-interface'
import { MarketWatch }                               from './monitor'

const screen = Pres.screen({ smartCSR: true, title: 'Leagyun Financial Dashboard' })

const grid = Pres.grid({ rows: 12, cols: 12, margin: { t: 4, b: 4, l: 4, r: 4 }, screen: screen })

const lineChartCollection = {
  A1: grid.set(1, 0, 3, 4, Pres.lineChart, { label: 'S&P 500', showLegend: true }),
  B1: grid.set(1, 4, 3, 4, Pres.lineChart, { label: 'Dow Jones', showLegend: true }),
  C1: grid.set(1, 8, 3, 4, Pres.lineChart, { label: 'Nasdaq', showLegend: true }),
  A2: grid.set(4, 0, 3, 4, Pres.lineChart, { label: 'Shanghai', showLegend: true }),
  B2: grid.set(4, 4, 3, 4, Pres.lineChart, { label: 'FTSE', showLegend: true }),
  C2: grid.set(4, 8, 3, 4, Pres.lineChart, { label: 'Hang Seng', showLegend: true }),
  A3: grid.set(7, 0, 3, 4, Pres.lineChart, { label: 'Nikkei', showLegend: true }),
  B3: grid.set(7, 4, 3, 4, Pres.lineChart, { label: 'Euronext', showLegend: true }),
  C3: grid.set(7, 8, 3, 4, Pres.lineChart, { label: 'Seoul', showLegend: true }),
}
const label = grid.set(0, 0, 1, 2, Pres.box, {
  content: 'SYMBOL',
  border: { type: 'bg' },
  align: 'right',
  valign: 'middle',
})

// const form = Pres.form({
//   sup: screen,
//   // width: '90%',
//   // left: 'center',
//   keys: true,
//   vi: true
// })
// const form = grid.set(0, 0, 12, 12, Pres.form, {
//   // sup: screen,
//   // width: '90%',
//   // left: 'center',
//   keys: true,
//   vi: true,
//   // hideBorder: true,
// })

const textbox = grid.set(0, 2, 1, 8, Pres.textbox, {
  name: 'symbol',
  // top: 0,
  // left: 0,
  height: 3,
  inputOnFocus: true,
  content: 'symbol',
  border: { type: 'line' },
  focus: { fg: 'blue' }
})

// Submit/Cancel buttons
const submit = grid.set(0, 10, 1, 2, Pres.button, {
  name: 'submit',
  content: 'Submit',
  // shrink: true,
  // padding: { top: 1, right: 2, bottom: 1, left: 2 },
  align: 'center',
  valign: 'middle',
  style: { bold: true, fg: 'white', bg: 'green', focus: { inverse: true }, hover: { bg: 'red' } },
  border: { type: 'bg' },
  // hideBorder: true,
})

// form.append(textbox)
// form.append(submit)

// lineChartCollection.A1.focus()
textbox.focus()
screen.render()
submit.on(PRESS, () => {
  console.log('pressed')
  // form.submit()
})
// form.on(SUBMIT, data => { console.log(data) })

screen.on(RESIZE, () => {
  label.emit(ATTACH)
  textbox.emit(ATTACH)
  screen.emit(ATTACH)
  // form.emit(ATTACH)
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
  await Promise.all([
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