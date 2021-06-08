import { bound }           from '@aryth/bound-matrix'
import { niceScale }       from '@aryth/nice-scale'
import { OBJECT }          from '@typen/enum-object-types'
import { nullish }         from '@typen/nullish'
import { abbr as abbrNum } from '@aryth/math'

const toNiceScale = niceScale.bind({ mode: OBJECT })
const boundMatrix = bound.bind({ dif: false })

export class Ticks {
  constructor(options) {
    this.count = options.ticks ?? options.tickCount ?? 5
    this.max = options.maxY
    this.min = options.minY ?? 0
    this.abbr = options.abbr
    // this.intOnly = p.intOnly ?? false
    this.pilot = nullish(this.max)
  }

  static build(options) { return new Ticks(options) }

  get incre() { return this.step }
  get dif() { return this.max - this.min }
  get tickWidth() { return this.formatTick(this.max).length * 2 }

  formatTick(v) { return this.abbr ? abbrNum(v) : v }

  setTicks(seriesCollection) {
    const bound = this.pilot ? boundMatrix(seriesCollection.map(({ y }) => y)) : this
    const { max, min, step } = toNiceScale(bound)
    this.max = max
    this.min = min
    this.step = step
    return this
  }
}