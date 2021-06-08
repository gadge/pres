import { bound }           from '@aryth/bound-matrix'
import { niceScale }       from '@aryth/nice-scale'
import { OBJECT }          from '@typen/enum-object-types'
import { nullish }         from '@typen/nullish'
import { abbr as abbrNum } from '@aryth/math'

const boundMatrix = bound.bind({ dif: false })

export class Ticks {
  constructor(options) {
    this.ticks = options.ticks ?? options.tickCount ?? 5
    this.mode = OBJECT // to fit niceScale api
    this.max = options.maxY
    this.min = options.minY ?? 0
    this.step = 1
    this.abbr = options.abbr
    // this.intOnly = p.intOnly ?? false
    this.pilot = nullish(this.max)
  }

  static build(options) { return new Ticks(options) }

  get incre() { return this.step }
  get dif() { return this.max - this.min }
  get tickWidth() { return this.formatTick(this.max).length * 2 }

  formatTick(v) { return this.abbr ? abbrNum(v) : String(v) }

  setTicks(seriesCollection) {
    const bound = this.pilot ? boundMatrix(seriesCollection.map(({ y }) => y)) : this
    const { max, min, step } = niceScale.call(this, bound)
    // console.log('bound', bound, 'niceScale', { max, min, step }, 'tickWidth', this.tickWidth)
    if (this.pilot) {
      this.max = max
      if (nullish(this.min)) this.min = min
    }
    this.step = step
    return this
  }
}