import { ATTACH } from '@pres/enum-events'
import { Canvas } from './canvas'

export class Gauge extends Canvas {
  constructor(options = {}) {
    // if (!(this instanceof Node)) { return new Gauge(options) }
    options.stroke = options.stroke || 'magenta'
    options.fill = options.fill || 'white'
    options.data = options.data || []
    options.showLabel = options.showLabel !== false
    super(options, require('ansi-term'))
    const self = this
    this.on(ATTACH, function () {
      if (self.options.stack) {
        const stack = this.stack = self.options.stack
        this.setStack(stack)
      }
      else {
        const percent = this.percent = self.options.percent || 0
        this.setData(percent)
      }
    })
    this.type = 'gauge'
  }
  calcSize() { this._w = this.width - 2, this._h = this.height }
  setData(data) {
    if (typeof (data) === typeof ([]) && data.length > 0) this.setStack(data)
    else if (typeof (data) === typeof (1)) this.setPercent(data)
  }
  setPercent(percent) {
    if (!this.context) throw 'error: canvas context does not exist. setData() for gauges must be called after the gauge has been added to the screen via screen.append()'
    const c = this.context
    c.strokeStyle = this.options.stroke//'magenta'
    c.fillStyle = this.options.fill//'white'
    c.clearRect(0, 0, this._w, this._h)
    if (percent < 1.001) percent = percent * 100
    const width = percent / 100 * (this._w - 3)
    c.fillRect(1, 2, width, 2)
    const textX = 7
    if (width < textX) c.strokeStyle = 'normal'
    if (this.options.showLabel) c.fillText(Math.round(percent) + '%', textX, 3)
  }
  setStack(stack) {
    const colors = [ 'green', 'magenta', 'cyan', 'red', 'blue' ]
    if (!this.context) throw 'error: canvas context does not exist. setData() for gauges must be called after the gauge has been added to the screen via screen.append()'
    const c = this.context
    let leftStart = 1
    let textLeft = 5
    c.clearRect(0, 0, this._w, this._h)
    for (let i = 0; i < stack.length; i++) {
      const currentStack = stack[i]
      let percent = typeof (currentStack) === typeof ({}) ? currentStack.percent : currentStack
      c.strokeStyle = currentStack.stroke || colors[(i % colors.length)] // use specified or choose from the array of colors
      c.fillStyle = this.options.fill //'white'
      textLeft = 5
      if (percent < 1.001) percent = percent * 100
      const width = percent / 100 * (this._w - 3)
      c.fillRect(leftStart, 2, width, 2)
      textLeft = (width / 2) - 1
      // if (textLeft)
      const textX = leftStart + textLeft
      if ((leftStart + width) < textX) c.strokeStyle = 'normal'
      if (this.options.showLabel) c.fillText(percent + '%', textX, 3)
      leftStart += width
    }
  }
  getOptionsPrototype() { return { percent: 10 } }
}

