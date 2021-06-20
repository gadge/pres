import { bound }           from '@aryth/bound-matrix'
import { abbr as abbrNum } from '@aryth/math'
import { niceScale }       from '@aryth/nice-scale'
import { OBJECT }          from '@typen/enum-object-types'
import { nullish }         from '@typen/nullish'
import { roundBound }      from './roundBound'

const boundMatrix = bound.bind({ dif: false })

export class Ticks {
  mode = OBJECT // to fit niceScale api
  min = 0
  max = 0
  step = 0
  constructor(options) {
    this.ticks = options.tickCount ?? 6
    this.prev = { max: options.maxY, min: options.minY }
    this.abbr = options.abbr ?? false
    this.extend = options.extend ?? null
  }
  static build(options) { return new Ticks(options) }

  get incre() { return this.step }
  get dif() { return this.max - this.min }
  get tickWidth() { return this.formatValue(this.max).length * 2 }

  formatValue(v) { return this.abbr ? abbrNum(v) : String(v) }
  setPrev({ min, max }) { return this.prev.min = min, this.prev.max = max, this }
  setup(seriesCollection) {
    let curr = boundMatrix(seriesCollection.map(({ y }) => y))
    if (!nullish(this.extend)) curr = roundBound(curr, this.extend)
    const { max, min, step } = niceScale.call(this, {
      max: this.prev.max ?? curr.max,
      min: this.prev.min ?? curr.min
    })
    this.max = this.prev.max ?? max
    this.min = this.prev.min ?? min
    this.step = step
    return this
  }
  toObject() { return { min: this.formatValue(this.min), max: this.formatValue(this.max), step: this.step }}
}