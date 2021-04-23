import { Box }     from '@pres/components-core'
import { nullish } from '@typen/nullish'
import _           from 'lodash'
import * as utils  from '../../utils.js'
import { Canvas }  from '../canvas'

export class Line extends Canvas {
  constructor(options = {}) {
    // if (!(this instanceof Node)) { return new Line(options) }
    if (nullish(options.showNthLabel)) options.showNthLabel = 1
    const style = options.style ?? (options.style = {})
    if (nullish(style.line)) style.line = 'yellow'
    if (nullish(style.text)) style.text = 'green'
    if (nullish(style.baseline)) style.baseline = 'black'
    if (nullish(options.xLabelPadding)) options.xLabelPadding = 5
    if (nullish(options.xPadding)) options.xPadding = 10
    if (nullish(options.numYLabels)) options.numYLabels = 5
    if (nullish(options.legend)) options.legend = {}
    if (nullish(options.wholeNumbersOnly)) options.wholeNumbersOnly = false
    if (nullish(options.minY)) options.minY = 0
    super(options)
    this.type = 'line'
  }
  calcSize() { this.canvasSize = { width: this.width * 2 - 12, height: this.height * 4 - 8 } }
  setData(data) {
    if (!this.context) { throw 'error: canvas context does not exist. setData() for line charts must be called after the chart has been added to the screen via screen.append()' }
    //compatability with older api
    if (!Array.isArray(data)) data = [ data ]
    const self = this
    let xLabelPadding = this.options.xLabelPadding
    const yLabelPadding = 3
    let xPadding = this.options.xPadding
    const yPadding = 11
    const c = this.context
    const labels = data[0].x
    function addLegend() {
      if (!self.options.showLegend) return
      if (self.legend) self.remove(self.legend)
      const legendWidth = self.options.legend.width || 15
      self.legend = new Box({
        height: data.length + 2,
        top: 1,
        width: legendWidth,
        left: self.width - legendWidth - 3,
        content: '',
        fg: 'green',
        tags: true,
        border: {
          type: 'line',
          fg: 'black'
        },
        style: { fg: 'blue' },
        screen: self.screen
      })
      let legendText = ''
      const maxChars = legendWidth - 2
      for (let i = 0; i < data.length; i++) {
        const style = data[i].style || {}
        const color = utils.getColorCode(style.line || self.options.style.line)
        legendText += '{' + color + '-fg}' + data[i].title.substring(0, maxChars) + '{/' + color + '-fg}\r\n'
      }
      self.legend.setContent(legendText)
      self.append(self.legend)
    }
    //iteratee for lodash _.max
    function getMaxY() {
      if (self.options.maxY) return self.options.maxY
      let max = -Infinity
      for (let i = 0; i < data.length; i++) {
        if (data[i].y.length) {
          const current = _.max(data[i].y, parseFloat)
          if (current > max) max = current
        }
      }
      return max + (max - self.options.minY) * 0.2
    }
    function formatYLabel(value, max, min, numLabels, wholeNumbersOnly, abbreviate) {
      const fixed = (((max - min) / numLabels) < 1 && value && !wholeNumbersOnly) ? 2 : 0
      const res = value.toFixed(fixed)
      return abbreviate ? utils.abbreviateNumber(res) : res
    }
    function getMaxXLabelPadding(numLabels, wholeNumbersOnly, abbreviate, min) {
      const max = getMaxY()
      return formatYLabel(max, max, min, numLabels, wholeNumbersOnly, abbreviate).length * 2
    }
    const maxPadding = getMaxXLabelPadding(this.options.numYLabels, this.options.wholeNumbersOnly, this.options.abbreviate, this.options.minY)
    if (xLabelPadding < maxPadding) xLabelPadding = maxPadding
    if ((xPadding - xLabelPadding) < 0) xPadding = xLabelPadding
    function getMaxX() {
      let maxLength = 0
      for (let i = 0; i < labels.length; i++) {
        if (labels[i] === undefined) { } // console.log("label[" + i + "] is undefined");
        else if (labels[i].length > maxLength) maxLength = labels[i].length
      }
      return maxLength
    }
    function getXPixel(val) { return ((self.canvasSize.width - xPadding) / labels.length) * val + (xPadding * 1.0) + 2 }
    function getYPixel(val, minY) {
      let res = self.canvasSize.height - yPadding - (((self.canvasSize.height - yPadding) / (getMaxY() - minY)) * (val - minY))
      res -= 2 //to separate the baseline and the data line to separate chars so canvas will show separate colors
      return res
    }
    // Draw the line graph
    function drawLine(values, style, minY) {
      style = style || {}
      const color = self.options.style.line
      c.strokeStyle = style.line || color
      c.moveTo(0, 0)
      c.beginPath()
      c.lineTo(getXPixel(0), getYPixel(values[0], minY))
      for (let k = 1; k < values.length; k++)
        c.lineTo(getXPixel(k), getYPixel(values[k], minY))
      c.stroke()
    }
    addLegend()
    c.fillStyle = this.options.style.text
    c.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height)
    let yLabelIncrement = (getMaxY() - this.options.minY) / this.options.numYLabels
    if (this.options.wholeNumbersOnly) yLabelIncrement = Math.floor(yLabelIncrement)
    //if (getMaxY()>=10) { yLabelIncrement = yLabelIncrement + (10 - yLabelIncrement % 10) }
    //yLabelIncrement = Math.max(yLabelIncrement, 1) // should not be zero
    if (!yLabelIncrement) yLabelIncrement = 1
    // Draw the Y value texts
    const maxY = getMaxY()
    for (let i = this.options.minY; i < maxY; i += yLabelIncrement)
      c.fillText(
        formatYLabel(i, maxY, this.options.minY, this.options.numYLabels, this.options.wholeNumbersOnly, this.options.abbreviate),
        xPadding - xLabelPadding,
        getYPixel(i, this.options.minY)
      )
    for (let h = 0; h < data.length; h++) drawLine(data[h].y, data[h].style, this.options.minY)
    c.strokeStyle = this.options.style.baseline
    // Draw the axises
    c.beginPath()
    c.lineTo(xPadding, 0)
    c.lineTo(xPadding, this.canvasSize.height - yPadding)
    c.lineTo(this.canvasSize.width, this.canvasSize.height - yPadding)
    c.stroke()
    // Draw the X value texts
    const charsAvailable = (this.canvasSize.width - xPadding) / 2
    const maxLabelsPossible = charsAvailable / (getMaxX() + 2)
    const pointsPerMaxLabel = Math.ceil(data[0].y.length / maxLabelsPossible)
    let showNthLabel = this.options.showNthLabel
    if (showNthLabel < pointsPerMaxLabel) showNthLabel = pointsPerMaxLabel
    for (let i = 0; i < labels.length; i += showNthLabel) {
      if ((getXPixel(i) + (labels[i].length * 2)) <= this.canvasSize.width) {
        c.fillText(labels[i], getXPixel(i), this.canvasSize.height - yPadding + yLabelPadding)
      }
    }
  }
  getOptionsPrototype() {
    return {
      width: 80,
      height: 30,
      left: 15,
      top: 12,
      xPadding: 5,
      label: 'Title',
      showLegend: true,
      legend: { width: 12 },
      data: [ {
        title: 'us-east',
        x: [ 't1', 't2', 't3', 't4' ],
        y: [ 5, 1, 7, 5 ],
        style: {
          line: 'red'
        }
      },
        {
          title: 'us-west',
          x: [ 't1', 't2', 't3', 't4' ],
          y: [ 2, 4, 9, 8 ],
          style: { line: 'yellow' }
        },
        {
          title: 'eu-north-with-some-long-string',
          x: [ 't1', 't2', 't3', 't4' ],
          y: [ 22, 7, 12, 1 ],
          style: { line: 'blue' }
        } ]
    }
  }
}

