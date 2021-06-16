import { Table }    from '@analys/table'
import { bound }    from '@aryth/bound-vector'
import { intExpon } from '@aryth/math'

import { flopGenerator }    from '@aryth/rand'
import { MarketIndexes }    from '@morpont/market-indexes-fmp'
import { Grey }             from '@palett/cards'
import { camelToSnake }     from '@texting/phrasing'
import { dateToYmd }        from '@valjoux/convert'
import { shiftDay }         from '@valjoux/date-shift'
import { AsyncLooper }      from '@valjoux/linger'
import { unwind }           from '@vect/entries-unwind'
import APIKEY               from '../../../../local/fmp.apikey.json'
import { COLOR_COLLECTION } from '../../assets/COLOR_COLLECTION'


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
    const filename = camelToSnake(this.indicator, '_').toUpperCase()
    const filepath = process.cwd() + '/applications/fin/resources/' + filename + '.js'
    const table = await import(filepath).then(fileTrunk => fileTrunk[filename])
    this.updateData(Table.from(table))
    // await MarketIndexes
    //   .prices({ indicator: this.indicator, start: BEFORE })
    //   .then(table => this.updateData(table))
  }

  /**
   *
   * @param {Table} table
   */
  updateData(table) {
    const entries = table.select([ 'date', 'adj.c' ]).rows
    const [ x, y ] = entries.slice(0, 90) |> unwind
    const { min, max } = roundBound(bound(y))
    const series = {
      title: this.indicator,
      style: { line: colorGenerator.next().value },
      x: x.reverse().slice(-45),
      y: y.reverse().slice(-45),
    }
    const seriesCollection = [ series ]
    this.chart.ticks.prev.min = min
    this.chart.ticks.prev.max = max
    this.chart.setData(seriesCollection)
    this.chart.screen.render()
  }
}

export function roundBound({ min, max }) {
  const magMin = 10 ** ( intExpon(min) - 1 )
  const magMax = 10 ** ( intExpon(max) - 1 )
  return {
    min: Math.floor(min / magMin) * magMin,
    max: Math.ceil(max / magMax) * magMax,
  }
}

