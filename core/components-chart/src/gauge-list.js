import { Canvas }   from '@pres/components-layout'
import { ATTACH }   from '@pres/enum-events'
import { AnsiTerm } from '../utils/AnsiTerm'

export class GaugeList extends Canvas {
  constructor(options = {}) {
    // if (!(this instanceof Node)) { return new GaugeList(options) }
    options.stroke = options.stroke || 'magenta'
    options.fill = options.fill || 'white'
    options.data = options.data || []
    options.showLabel = options.showLabel !== false
    options.gaugeSpacing = options.gaugeSpacing || 0
    options.gaugeHeight = options.gaugeHeight || 1
    if (!options.sku) options.sku = 'gauge'
    super(options, AnsiTerm)
    const self = this
    this.on(ATTACH, function () {
      const gauges = this.gauges = self.options.gauges
      this.setGauges(gauges)
    })
    this.type = 'gauge'
  }
  get canvH() { return this.height }
  get canvW() { return this.width - 2 }
  static build(options) { return new GaugeList(options) }
  setData() { }
  setGauges(gauges) {
    if (!this.context) {
      throw 'error: canvas context does not exist. setData() for gauges must be called after the gauge has been added to the screen via screen.append()'
    }
    const c = this.context
    c.clearRect(0, 0, this.canvW, this.canvH)
    for (let i = 0; i < gauges.length; i++) { this.setSingleGauge(gauges[i], i) }
  }
  setSingleGauge(gauge, offset) {
    const colors = [ 'green', 'magenta', 'cyan', 'red', 'blue' ]
    const stack = gauge.stack
    const c = this.context
    let leftStart = 3
    let textLeft = 5
    c.strokeStyle = 'normal'
    c.fillStyle = 'white'
    c.fillText(offset.toString(), 0, offset * ( this.options.gaugeHeight + this.options.gaugeSpacing ))
    for (let i = 0; i < stack.length; i++) {
      const currentStack = stack[i]
      let percent
      if (typeof ( currentStack ) == typeof ( {} )) {
        percent = currentStack.percent
      }
      else {
        percent = currentStack
      }
      c.strokeStyle = currentStack.stroke || colors[( i % colors.length )] // use specified or choose from the array of colors
      c.fillStyle = this.options.fill//'white'
      textLeft = 5
      const width = percent / 100 * ( this.canvW - 5 )
      c.fillRect(leftStart, offset * ( this.options.gaugeHeight + this.options.gaugeSpacing ), width, this.options.gaugeHeight - 1)
      textLeft = ( width / 2 ) - 1
      // if (textLeft)
      const textX = leftStart + textLeft
      if (( leftStart + width ) < textX) {
        c.strokeStyle = 'normal'
      }
      if (gauge.showLabel) c.fillText(percent + '%', textX, 3)
      leftStart += width
    }
  }
  getOptionsPrototype() {
    return { percent: 10 }
  }
}

