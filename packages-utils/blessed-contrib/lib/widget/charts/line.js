import { Box }     from '@pres/components-core'
import { nullish } from '@typen/nullish'
import { maxBy }   from '@vect/vector-indicator'
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
    const padds = options.padds ?? (options.padds = {})
    if (nullish(padds.labelX)) padds.labelX = options.xLabelPadding ?? padds.labelX ?? 5
    if (nullish(padds.labelY)) padds.labelY = 3
    if (nullish(padds.x)) padds.x = options.xPadding ?? padds.x ?? 10
    if (nullish(padds.y)) padds.y = 11
    const ticks = options.ticks ?? (options.ticks = {})
    if (nullish(ticks.count)) ticks.count = options.tickCount ?? padds.labelX ?? 5
    if (nullish(ticks.max)) ticks.max = options.maxY
    if (nullish(ticks.min)) ticks.min = options.minY ?? 0
    if (nullish(ticks.intOnly)) ticks.intOnly = options.intOnly ?? false
    if (nullish(ticks.abbr)) ticks.abbr = options.abbr
    if (nullish(options.legend)) options.legend = {}
    super(options)
    if (!this.options) {
      console.log('>>> this.options does not exist')
      this.options = options
    }
    else {
      console.log(this.options)
    }
    this.style = style
    this.padds = padds
    this.ticks = ticks
    this.type = 'line'
  }
  calcSize() { this._w = this.width * 2 - 12, this._h = this.height * 4 - 8 }
  labelWidth(labels) { return maxBy(labels, x => x?.length) ?? 0 }
  calcTicks(seriesCollection) {
    // set ticks.max
    if (this.options.maxY) {
      this.ticks.max = this.options.maxY
    }
    else {
      let curr, max = -Infinity
      for (const series of seriesCollection)
        if (series.y.length && (curr = maxBy(series.y, parseFloat)) > max)
          max = curr
      this.ticks.max = max + (max - this.ticks.min) * 0.2
    }
    // set ticks.incre
    let incre = (this.ticks.max - this.ticks.min) / this.ticks.count
    // let tickIncre = (self.tickMax(seriesCollection) - this.ticks.min) / this.ticks.count
    if (this.ticks.intOnly) incre = ~~incre
    //if (tickMax()>=10) { tickIncre = tickIncre + (10 - tickIncre % 10) }
    //tickIncre = Math.max(tickIncre, 1) // should not be zero
    if (!incre) incre = 1
    this.ticks.incre = incre
  }
  drawLegend(seriesCollection) {
    if (!this.options.showLegend) return
    if (this.legend) this.remove(this.legend)
    const legendWidth = this.options.legend.width || 15
    this.legend = new Box({
      height: seriesCollection.length + 2,
      top: 1,
      width: legendWidth,
      left: this.width - legendWidth - 3,
      content: '',
      fg: 'green',
      tags: true,
      border: { type: 'line', fg: 'black' },
      style: { fg: 'blue' },
      screen: this.screen
    })
    let legendText = ''
    const maxChars = legendWidth - 2
    for (const series of seriesCollection) {
      const style = series.style || {}
      const color = utils.getColorCode(style.line || this.options.style.line)
      legendText += '{' + color + '-fg}' + series.title.substring(0, maxChars) + '{/' + color + '-fg}\r\n'
    }
    this.legend.setContent(legendText)
    this.append(this.legend)
    // console.log(`>>> maxChars:${maxChars} legendText:\n${legendText}`)
    // console.log('>>> this.legend appended to this')
  }
  coordX(val) { return ((this._w - this.padds.x) / this.labels.length) * val + (this.padds.x * 1.0) + 2 }
  coordY(val) {
    let res = (this._h - this.padds.y) - (((this._h - this.padds.y) / (this.ticks.max - this.ticks.min)) * (val - this.ticks.min))
    res -= 2 //to separate the baseline and the data line to separate chars so canvas will show separate colors
    return res
  }
  tickPaddingMax() { return this.formatTick(this.ticks.max).length * 2 }
  formatTick(value) {
    const { max, min, count, intOnly, abbr } = this.ticks
    const fixed = (((max - min) / count) < 1 && value && !intOnly) ? 2 : 0
    const v = value.toFixed(fixed)
    return abbr ? utils.abbrNumber(v) : v
  }
  // Draw the line graph
  drawLine(values, style = {}) {
    const { context } = this
    const color = this.options.style.line
    context.strokeStyle = style.line || color
    context.moveTo(0, 0)
    context.beginPath()
    context.lineTo(this.coordX(0), this.coordY(values[0]))
    for (let i = 1; i < values.length; i++)
      context.lineTo(this.coordX(i), this.coordY(values[i]))
    context.stroke()
  }
  setData(seriesCollection) {
    if (!this.context) throw 'error: canvas context does not exist. setData() for line charts must be called after the chart has been added to the screen via screen.append()'
    if (!Array.isArray(seriesCollection)) seriesCollection = [ seriesCollection ] //compatible with prev api
    const { padds, context } = this
    this.labels = seriesCollection[0].x
    //iteratee for lodash _.max
    // console.log('>>> this.ticks.max = ' + this.ticks.max)
    this.calcTicks(seriesCollection)
    const paddingMax = this.tickPaddingMax()
    if (padds.labelX < paddingMax) padds.labelX = paddingMax
    if ((padds.x - padds.labelX) < 0) padds.x = padds.labelX

    this.drawLegend(seriesCollection)
    context.fillStyle = this.options.style.text
    context.clearRect(0, 0, this._w, this._h)
    // console.log(`>>> this.canvasSize: ${this._w},${this._h}`)
    // Draw tick labels (y-axis values)
    for (let i = this.ticks.min; i < this.ticks.max; i += this.ticks.incre)
      context.fillText(this.formatTick(i), padds.x - padds.labelX, this.coordY(i))
    // Draw line bodies
    for (let h = 0; h < seriesCollection.length; h++)
      this.drawLine(seriesCollection[h].y, seriesCollection[h].style)
    context.strokeStyle = this.options.style.baseline
    // Draw x and y axes
    context.beginPath()
    context.lineTo(padds.x, 0)
    context.lineTo(padds.x, this._h - padds.y)
    context.lineTo(this._w, this._h - padds.y)
    context.stroke()
    // Draw x-value labels
    const charsAvailable = (this._w - padds.x) / 2
    const maxLabelsPossible = charsAvailable / (this.labelWidth(this.labels) + 2)
    const pointsPerMaxLabel = Math.ceil(seriesCollection[0].y.length / maxLabelsPossible)
    let showNthLabel = this.options.showNthLabel
    if (showNthLabel < pointsPerMaxLabel) showNthLabel = pointsPerMaxLabel
    for (let i = 0; i < this.labels.length; i += showNthLabel) {
      if ((this.coordX(i) + (this.labels[i].length * 2)) <= this._w) {
        context.fillText(this.labels[i], this.coordX(i), this._h - padds.y + padds.labelY)
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

