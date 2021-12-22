'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var boundMatrix$1 = require('@aryth/bound-matrix')
var math = require('@aryth/math')
var niceScale = require('@aryth/nice-scale')
var enumObjectTypes = require('@typen/enum-object-types')
var nullish = require('@typen/nullish')

function roundBound({
                      min,
                      max
                    }, extend = 1) {
  const minMag = ( 10 ** extend ) ** ( math.intExpon(min) - extend )
  const maxMag = ( 10 ** extend ) ** ( math.intExpon(max) - extend )
  return {
    min: Math.floor(min / minMag) * minMag,
    max: Math.ceil(max / maxMag) * maxMag
  }
}

const boundMatrix = boundMatrix$1.bound.bind({
  dif: false
})
class Ticks {
  mode = enumObjectTypes.OBJECT // to fit niceScale api

  min = 0
  max = 0
  step = 0

  constructor(options) {
    this.ticks = options.tickCount ?? 6
    this.prev = {
      max: options.maxY,
      min: options.minY
    }
    this.abbr = options.abbr ?? false
    this.extend = options.extend ?? null
  }
  get incre() {
    return this.step
  }
  get dif() {
    return this.max - this.min
  }
  get tickWidth() {
    return this.formatValue(this.max).length * 2
  }
  static build(options) {
    return new Ticks(options)
  }
  formatValue(v) {
    return this.abbr ? math.abbr(v) : String(v)
  }

  setPrev({
            min,
            max
          }) {
    return this.prev.min = min, this.prev.max = max, this
  }

  setup(seriesCollection) {
    let curr = boundMatrix(seriesCollection.map(({
                                                   y
                                                 }) => y))
    if (!nullish.nullish(this.extend)) curr = roundBound(curr, this.extend)
    const {
            max,
            min,
            step
          } = niceScale.niceScale.call(this, {
      max: this.prev.max ?? curr.max,
      min: this.prev.min ?? curr.min
    })
    this.max = this.prev.max ?? max
    this.min = this.prev.min ?? min
    this.step = step
    return this
  }

  toObject() {
    return {
      min: this.formatValue(this.min),
      max: this.formatValue(this.max),
      step: this.step
    }
  }

}

exports.Ticks = Ticks
