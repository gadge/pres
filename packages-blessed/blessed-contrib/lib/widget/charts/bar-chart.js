import { round }  from '@aryth/math'
import { ATTACH } from '@pres/enum-events'
import { maxBy }  from '@vect/vector-indicator'
import { Canvas } from '../canvas'

export class Bars {
  constructor(options) {
    this.width = options.barWidth ?? options.width ?? 6
    this.spacing = options.barSpacing ?? options.spacing ?? 9
    if ((this.spacing - this.width) < 3) this.spacing = this.width + 3
    this.preset = {
      fore: options.barFgColor ?? 'white',
      back: options.barBgColor ?? 'blue',
      label: options.labelColor ?? 'white'
    }
  }
  static build(options) { return new Bars(options) }
}
export class BarChart extends Canvas {
  constructor(options = {}) {
    // if (!(this instanceof Node)) return new BarChart(options)
    super(options, require('ansi-term'))
    const self = this
    this.bars = this.options.bars = Bars.build(options.bars ?? options)
    this.options.xOffset = this.options.xOffset ?? 5
    this.options.showText = this.options.showText !== false
    this.on(ATTACH, () => { if (self.options.data) { self.setData(self.options.data) } })
    this.type = 'bar-chart'
    // console.log('>>> BarChart this.options')
    // console.log(this.options)
  }
  calcSize() { this._w = this.width - 2, this._h = this.height }
  get labelY() { return this._h - 3 }
  get valueY() { return this._h - 4 }
  get barY() { return this._h - 5 }
  setData(series) {
    if (!this.context) throw 'error: canvas context does not exist. setData() for bar charts must be called after the chart has been added to the screen via screen.append()'
    this.clear()
    const labels = series.labels ?? series.x ?? series.titles
    const values = series.values ?? series.y ?? series.data
    const { bars, context } = this
    const max = Math.max(maxBy(values), this.options.maxHeight)
    const { barY, labelY, valueY } = this
    for (
      let i = 0, x = this.options.xOffset;
      i < values.length;
      i++, x += bars.spacing
    ) {
      // draw bar
      if (values[i] <= 0) {
        context.strokeStyle = 'normal'
      }
      else {
        context.strokeStyle = bars.preset.back
        const height = round(barY * (values[i] / max))
        context.fillRect(x, barY - height + 1, bars.width, height)
      }
      // draw values
      context.fillStyle = bars.preset.fore
      if (this.options.showText) context.fillText(values[i].toString(), x + 1, valueY)
      context.strokeStyle = 'normal'
      // draw labels
      context.fillStyle = bars.preset.label
      if (this.options.showText) context.fillText(labels[i], x + 1, labelY)
    }
  }
  getOptionsPrototype() {
    return {
      barWidth: 1,
      barSpacing: 1,
      xOffset: 1,
      maxHeight: 1,
      data: {
        titles: [ 's' ],
        data: [ 1 ]
      }
    }
  }
}

