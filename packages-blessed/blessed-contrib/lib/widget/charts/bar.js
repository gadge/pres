import blessed from '../../vendor/blessed'
import Canvas  from '../canvas'

const Node = blessed.Node
function Bar(options) {
  if (!(this instanceof Node)) return new Bar(options)
  const self = this
  Canvas.call(this, options, require('ansi-term'))
  this.options.barWidth = this.options.barWidth || 6
  this.options.barSpacing = this.options.barSpacing || 9
  if ((this.options.barSpacing - this.options.barWidth) < 3) this.options.barSpacing = this.options.barWidth + 3
  this.options.xOffset = this.options.xOffset == null ? 5 : this.options.xOffset
  this.options.showText = this.options.showText === false ? false : true
  this.on('attach', () => { if (self.options.data) { self.setData(self.options.data) } })
}
Bar.prototype = Object.create(Canvas.prototype)
Bar.prototype.calcSize = function () { this.canvasSize = { width: this.width - 2, height: this.height } }
Bar.prototype.setData = function (bar) {
  if (!this.ctx) throw 'error: canvas context does not exist. setData() for bar charts must be called after the chart has been added to the screen via screen.append()'
  this.clear()
  const c = this.ctx
  let max = Math.max.apply(Math, bar.data)
  max = Math.max(max, this.options.maxHeight)
  let x = this.options.xOffset
  const barY = this.canvasSize.height - 5
  for (let i = 0; i < bar.data.length; i++) {
    const h = Math.round(barY * (bar.data[i] / max))
    if (bar.data[i] > 0) {
      c.strokeStyle = 'blue'
      if (this.options.barBgColor) c.strokeStyle = this.options.barBgColor
      c.fillRect(x, barY - h + 1, this.options.barWidth, h)
    }
    else { c.strokeStyle = 'normal' }
    c.fillStyle = 'white'
    if (this.options.barFgColor) c.fillStyle = this.options.barFgColor
    if (this.options.showText)
      c.fillText(bar.data[i].toString(), x + 1, this.canvasSize.height - 4)
    c.strokeStyle = 'normal'
    c.fillStyle = 'white'
    if (this.options.labelColor) c.fillStyle = this.options.labelColor
    if (this.options.showText) c.fillText(bar.titles[i], x + 1, this.canvasSize.height - 3)
    x += this.options.barSpacing
  }
}
Bar.prototype.getOptionsPrototype = function () {
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
Bar.prototype.type = 'bar'
export default Bar
