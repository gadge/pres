import blessed from 'blessed'
import utils   from '../../utils.js'
import Canvas  from '../canvas'

const Node = blessed.Node
function StackedBar(options) {
  if (!(this instanceof Node)) { return new StackedBar(options) }
  const self = this
  Canvas.call(this, options, require('ansi-term'))
  this.options.barWidth = this.options.barWidth || 6
  this.options.barSpacing = this.options.barSpacing || 9
  if ((this.options.barSpacing - this.options.barWidth) < 3)
    this.options.barSpacing = this.options.barWidth + 3
  this.options.xOffset = this.options.xOffset == null ? 5 : this.options.xOffset
  this.options.showText = this.options.showText === false ? false : true
  this.options.legend = this.options.legend || {}
  this.options.showLegend = this.options.showLegend === false ? false : true
  this.on('attach', () => { if (self.options.data) self.setData(self.options.data) })
}
StackedBar.prototype = Object.create(Canvas.prototype)
StackedBar.prototype.calcSize = function () { this.canvasSize = { width: this.width - 2, height: this.height } }
StackedBar.prototype.getSummedBars = function (bars) {
  const res = []
  bars.forEach(function (stackedValues) {
    const sum = stackedValues.reduce(function (a, b) {
      return a + b
    }, 0)
    res.push(sum)
  })
  return res
}
StackedBar.prototype.setData = function (bars) {
  if (!this.ctx) {
    throw 'error: canvas context does not exist. setData() for bar charts must be called after the chart has been added to the screen via screen.append()'
  }
  this.clear()
  const summedBars = this.getSummedBars(bars.data)
  let maxBarValue = Math.max.apply(Math, summedBars)
  if (this.options.maxValue)
    maxBarValue = Math.max(maxBarValue, this.options.maxValue)
  let x = this.options.xOffset
  for (let i = 0; i < bars.data.length; i++) {
    this.renderBar(x, bars.data[i], summedBars[i], maxBarValue, bars.barCategory[i])
    x += this.options.barSpacing
  }
  this.addLegend(bars, x)
}
StackedBar.prototype.renderBar = function (x, bar, curBarSummedValue, maxBarValue, category) {
  /*
    var c = this.ctx
    c.strokeStyle = 'red';
    c.fillRect(0,7,4,0)
    c.strokeStyle = 'blue';
    c.fillRect(0,4,4,1)
    c.strokeStyle = 'green';
    c.fillRect(5,7,4,2)
    return
  */
  //first line is for label
  const BUFFER_FROM_TOP = 2
  const BUFFER_FROM_BOTTOM = (this.options.border ? 2 : 0) + (this.options.showText ? 1 : 0)
  const c = this.ctx
  c.strokeStyle = 'normal'
  c.fillStyle = 'white'
  if (this.options.labelColor)
    c.fillStyle = this.options.labelColor
  if (this.options.showText) {
    c.fillText(category, x + 1, this.canvasSize.height - BUFFER_FROM_BOTTOM)
  }
  if (curBarSummedValue < 0) return
  const maxBarHeight = this.canvasSize.height - BUFFER_FROM_TOP - BUFFER_FROM_BOTTOM
  const currentBarHeight = Math.round(maxBarHeight * (curBarSummedValue / maxBarValue))
  //start painting from bottom of bar, section by section
  let y = maxBarHeight + BUFFER_FROM_TOP
  let availableBarHeight = currentBarHeight
  for (let i = 0; i < bar.length; i++) {
    const currStackHeight = this.renderBarSection(
      x,
      y,
      bar[i],
      curBarSummedValue,
      currentBarHeight,
      availableBarHeight,
      this.options.barBgColor[i])
    y -= currStackHeight
    availableBarHeight -= currStackHeight
  }
}
StackedBar.prototype.renderBarSection = function (
  x,
  y,
  data,
  curBarSummedValue,
  currentBarHeight,
  availableBarHeight,
  bg) {
  const c = this.ctx
  const currStackHeight = currentBarHeight <= 0 ?
    0 :
    Math.min(
      availableBarHeight, //round() can make total stacks excceed curr bar height so we limit it
      Math.round(currentBarHeight * (data / curBarSummedValue))
    )
  c.strokeStyle = bg
  if (currStackHeight > 0) {
    const calcY = y - currStackHeight
    /*fillRect starts from the point bottom of start point so we compensate*/
    const calcHeight = Math.max(0, currStackHeight - 1)
    c.fillRect(
      x,
      calcY,
      this.options.barWidth,
      calcHeight
    )
    c.fillStyle = 'white'
    if (this.options.barFgColor)
      c.fillStyle = this.options.barFgColor
    if (this.options.showText) {
      const str = utils.abbreviateNumber(data.toString())
      c.fillText(
        str,
        Math.floor(x + this.options.barWidth / 2 + str.length / 2),
        calcY + Math.round(calcHeight / 2))
    }
  }
  return currStackHeight
}
StackedBar.prototype.getOptionsPrototype = function () {
  return {
    barWidth: 1,
    barSpacing: 1,
    xOffset: 1,
    maxValue: 1,
    barBgColor: 's',
    data: {
      barCategory: [ 's' ],
      stackedCategory: [ 's' ],
      data: [ [ 1 ] ]
    }
  }
}
StackedBar.prototype.addLegend = function (bars, x) {
  const self = this
  if (!self.options.showLegend) return
  if (self.legend) self.remove(self.legend)
  const legendWidth = self.options.legend.width || 15
  self.legend = blessed.box({
    height: bars.stackedCategory.length + 2,
    top: 1,
    width: legendWidth,
    left: x,
    content: '',
    fg: 'green',
    tags: true,
    border: {
      type: 'line',
      fg: 'black'
    },
    style: {
      fg: 'blue',
    },
    screen: self.screen
  })
  let legandText = ''
  const maxChars = legendWidth - 2
  for (let i = 0; i < bars.stackedCategory.length; i++) {
    const color = utils.getColorCode(self.options.barBgColor[i])
    legandText += '{' + color + '-fg}' + bars.stackedCategory[i].substring(0, maxChars) + '{/' + color + '-fg}\r\n'
  }
  self.legend.setContent(legandText)
  self.append(self.legend)
}
StackedBar.prototype.type = 'bar'
export default StackedBar
