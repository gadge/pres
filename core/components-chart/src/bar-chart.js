import { round }  from '@aryth/math'
import { Canvas } from '@pres/components-layout'
import { ATTACH } from '@pres/enum-events'
import { maxBy }  from '@vect/vector-indicator'
import { Bars }   from '../utils'

export class BarChart extends Canvas {
  constructor(options = {}) {
    if (!options.sku) options.sku = 'bar-chart'
    // if (!(this instanceof Node)) return new BarChart(options)
    super(options, ansi_term)
    const self = this
    this.bars = this.options.bars = Bars.build(options.bars ?? options)
    this.options.xOffset = this.options.xOffset ?? 5
    this.options.showText = this.options.showText !== false
    this.on(ATTACH, () => { if (self.options.data) { self.setData(self.options.data) } })
    this.type = 'bar-chart'
    // console.log('>>> BarChart this.options')
    // console.log(this.options)
  }
  get canvH() { return this.height }
  get canvW() { return this.width - 2 }
  get labelY() { return this.canvH - 3 }
  get valueY() { return this.canvH - 4 }
  get barY() { return this.canvH - 5 }
  static build(options) { return new BarChart(options) }
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
        context.strokeStyle = bars.preset?.back
        const height = round(barY * ( values[i] / max ))
        context.fillRect(x, barY - height + 1, bars.width, height)
      }
      // draw values
      context.fillStyle = bars.preset?.fore
      if (this.options.showText) context.fillText(values[i].toString(), x + 1, valueY)
      context.strokeStyle = 'normal'
      // draw labels
      context.fillStyle = bars.preset?.label
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

