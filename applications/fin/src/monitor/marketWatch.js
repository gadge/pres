import { intExpon, roundD2 } from '@aryth/math'
import {
  Amber, Blue, Cyan, DeepOrange, DeepPurple, Green, Grey, Indigo, LightBlue, LightGreen, Lime, Orange, Pink, Purple,
  Red, Teal, Yellow,
}                            from '@palett/cards'


import { flopGenerator } from '@aryth/rand'
import { MarketIndexes } from '@morpont/market-indexes-fmp'
import { Table }         from '@analys/table'
import { dateToYmd }     from '@valjoux/convert'
import { shiftDay }      from '@valjoux/date-shift'
import { AsyncLooper }   from '@valjoux/linger'
import { unwind }        from '@vect/entries-unwind'
import APIKEY            from '../../../../local/fmp.apikey.json'

const COLOR_COLLECTION = [
  Red.base,
  Pink.base,
  Purple.base,
  DeepPurple.base,
  Indigo.base,
  Blue.base,
  LightBlue.base,
  Cyan.base,
  Teal.base,
  Green.base,
  LightGreen.base,
  Lime.base,
  Yellow.base,
  Amber.base,
  Orange.base,
  DeepOrange.base,
]

const TODAY = new Date() |> dateToYmd
const BEFORE = shiftDay(TODAY.slice(), -60)
let colorGenerator = flopGenerator(COLOR_COLLECTION, Grey.base)

MarketIndexes.login(APIKEY)
export class MarketWatch extends AsyncLooper {
  constructor(lineChart, indicator) {
    super(MarketIndexes.prices.bind(null, { indicator, start: BEFORE }))
    this.chart = lineChart
    this.seriesCollection = []
    this.indicator = indicator
  }
  async run() {
    // const updateData = this.updateData.bind(this)
    await MarketIndexes
      .prices({ indicator: this.indicator, start: BEFORE })
      .then(table => this.updateData(table))
    // await this.setInterval(1000, updateData)
  }

  /**
   *
   * @param {Table} table
   */
  updateData(table) {
    const entries = table.select([ 'date', 'adj.c' ]).rows
    const [ x, y ] = entries |> unwind

    const min = Math.min.apply(null, y)
    const exponMin = intExpon(min)
    let prevMin = min / ( 10 ** exponMin )
    prevMin = Math.floor(prevMin * 10) * ( 10 ** ( exponMin - 1 ) )

    const max = Math.max.apply(null, y)
    const exponMax = intExpon(max)
    let prevMax = max / ( 10 ** exponMax )
    prevMax = Math.ceil(prevMax * 10) * ( 10 ** ( exponMax - 1 ) )

    const series = {
      title: this.indicator,
      style: { line: colorGenerator.next().value },
      x: x.reverse().slice(-45),
      y: y.reverse().slice(-45),
    }
    const seriesCollection = [ series ]
    this.chart.ticks.prev.min = prevMin
    this.chart.ticks.prev.max = prevMax
    this.chart.setData(seriesCollection)

    this.chart.screen.render()
  }
}

