import { bound }           from '@aryth/bound-matrix'
import { abbr as abbrNum } from '@aryth/math'
import { niceScale }       from '@aryth/nice-scale'
import { OBJECT }          from '@typen/enum-object-types'

const boundMatrix = bound.bind({ dif: false })

export class Ticks {
  mode = OBJECT // to fit niceScale api
  max = 100
  min = 0
  step = 10
  constructor(options) {
    this.ticks = options.tickCount ?? 6
    this.prev = { max: options.maxY, min: options.minY }
    this.abbr = options.abbr
  }
  static build(options) { return new Ticks(options) }

  get incre() { return this.step }
  get dif() { return this.max - this.min }
  get tickWidth() { return this.formatTick(this.max).length * 2 }

  formatTick(v) { return this.abbr ? abbrNum(v) : String(v) }

  setTicks(seriesCollection) {
    const prev = this.prev,
          next = boundMatrix(seriesCollection.map(({ y }) => y))
    const { max, min, step } = niceScale.call(this, {
      max: prev.max ?? next.max,
      min: prev.min ?? next.min
    })
    this.max = this.prev.max ?? max
    this.min = this.prev.min ?? min
    this.step = step
    return this
  }
}