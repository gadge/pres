import { nullish } from '@typen/nullish'
import { maxBy }   from '@vect/vector-indicator'
import * as utils  from '../../../utils'

export class Ticks {
  constructor(options) {
    this.count = options.tickCount ?? 5
    this.max = options.maxY
    this.min = options.minY ?? 0
    this.intOnly = options.intOnly ?? false
    this.abbr = options.abbr
    this.pilot = nullish(this.max)
  }
  static build(options) { return new Ticks(options) }
  get dif() { return this.max - this.min }
  adaptMax(seriesCollection) {
    if (this.pilot) {
      let curr, max = -Infinity
      for (const series of seriesCollection)
        if (series.y.length && (curr = maxBy(series.y, parseFloat)) > max)
          max = curr
      this.max = max + (max - this.min) * 0.2
    }
    return this.max
  }
  adaptIncre() {
    let incre = this.dif / this.count // let tickIncre = (self.tickMax(seriesCollection) - this.min) / this.count
    if (this.intOnly) incre = ~~incre
    // if (tickMax()>=10) { tickIncre = tickIncre + (10 - tickIncre % 10) }
    // tickIncre = Math.max(tickIncre, 1) // should not be zero
    if (!incre) incre = 1
    this.incre = incre
  }
  adaptTicks(seriesCollection) {
    this.adaptMax(seriesCollection)
    this.adaptIncre()
  }
  get tickWidth() { return this.formatTick(this.max).length * 2 }
  formatTick(value) {
    const { dif, count, intOnly, abbr } = this
    const fixed = ((dif / count) < 1 && value && !intOnly) ? 2 : 0
    const v = value.toFixed(fixed)
    return abbr ? utils.abbrNumber(v) : v
  }
}