'use strict'
import blessed from 'blessed'
import Canvas  from './canvas'
const Node = blessed.Node
function GaugeList(options) {
  if (!(this instanceof Node)) {
    return new GaugeList(options)
  }
  const self = this
  options = options || {}
  self.options = options
  self.options.stroke = options.stroke || 'magenta'
  self.options.fill = options.fill || 'white'
  self.options.data = options.data || []
  self.options.showLabel = options.showLabel !== false
  self.options.gaugeSpacing = options.gaugeSpacing || 0
  self.options.gaugeHeight = options.gaugeHeight || 1
  Canvas.call(this, options, require('ansi-term'))
  this.on('attach', function () {
    const gauges = this.gauges = self.options.gauges
    this.setGauges(gauges)
  })
}
GaugeList.prototype = Object.create(Canvas.prototype)
GaugeList.prototype.calcSize = function () {
  this.canvasSize = { width: this.width - 2, height: this.height }
}
GaugeList.prototype.type = 'gauge'
GaugeList.prototype.setData = function () {
}
GaugeList.prototype.setGauges = function (gauges) {
  if (!this.ctx) {
    throw 'error: canvas context does not exist. setData() for gauges must be called after the gauge has been added to the screen via screen.append()'
  }
  const c = this.ctx
  c.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height)
  for (let i = 0; i < gauges.length; i++) {
    this.setSingleGauge(gauges[i], i)
  }
}
GaugeList.prototype.setSingleGauge = function (gauge, offset) {
  const colors = [ 'green', 'magenta', 'cyan', 'red', 'blue' ]
  const stack = gauge.stack
  const c = this.ctx
  let leftStart = 3
  let textLeft = 5
  c.strokeStyle = 'normal'
  c.fillStyle = 'white'
  c.fillText(offset.toString(), 0, offset * (this.options.gaugeHeight + this.options.gaugeSpacing))
  for (let i = 0; i < stack.length; i++) {
    const currentStack = stack[i]
    let percent
    if (typeof (currentStack) == typeof ({})) {
      percent = currentStack.percent
    }
    else {
      percent = currentStack
    }
    c.strokeStyle = currentStack.stroke || colors[(i % colors.length)] // use specified or choose from the array of colors
    c.fillStyle = this.options.fill//'white'
    textLeft = 5
    const width = percent / 100 * (this.canvasSize.width - 5)
    c.fillRect(leftStart, offset * (this.options.gaugeHeight + this.options.gaugeSpacing), width, this.options.gaugeHeight - 1)
    textLeft = (width / 2) - 1
    // if (textLeft)
    const textX = leftStart + textLeft
    if ((leftStart + width) < textX) {
      c.strokeStyle = 'normal'
    }
    if (gauge.showLabel) c.fillText(percent + '%', textX, 3)
    leftStart += width
  }
}
GaugeList.prototype.getOptionsPrototype = function () {
  return { percent: 10 }
}
module.exports = GaugeList
