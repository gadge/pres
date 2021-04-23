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
    const padding = options.padding ?? (options.padding = {})
    if (nullish(padding.labelX)) padding.labelX = options.xLabelPadding ?? padding.labelX ?? 5
    if (nullish(padding.labelY)) padding.labelY = 3
    if (nullish(padding.x)) padding.x = options.xPadding ?? padding.x ?? 10
    if (nullish(padding.y)) padding.y = 11
    const ticks = options.ticks ?? (options.ticks = {})
    if (nullish(options.tickCount)) options.tickCount = 5
    if (nullish(ticks.count)) ticks.count = options.tickCount ?? padding.labelX ?? 5
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
    this.padding = padding
    this.ticks = ticks
    this.type = 'line'
  }
  calcSize() { this._w = this.width * 2 - 12, this._h = this.height * 4 - 8 }
  labelWidth(labels) { return maxBy(labels, x => x?.length) ?? 0 }
  calcTicks(seriesCollection) {
    if (this.options.maxY) {
      this.ticks.max = this.options.maxY
    }
    else {
      let curr, max = -Infinity
      for (const series of seriesCollection)
        if (series.y.length && (curr = maxBy(series.y, parseFloat)) > max)
          max = curr
      return this.ticks.max = max + (max - this.ticks.min) * 0.2
    }

    let incre = (this.ticks.max - this.ticks.min) / this.ticks.count
    // let tickIncre = (self.tickMax(seriesCollection) - this.ticks.min) / this.ticks.count
    if (this.ticks.intOnly) incre = ~~incre
    //if (tickMax()>=10) { tickIncre = tickIncre + (10 - tickIncre % 10) }
    //tickIncre = Math.max(tickIncre, 1) // should not be zero
    if (!incre) incre = 1
    this.ticks.incre = incre
  }
  addLegend(seriesCollection) {
    const self = this
    if (!self.options.showLegend) return
    if (self.legend) self.remove(self.legend)
    const legendWidth = self.options.legend.width || 15
    self.legend = new Box({
      height: seriesCollection.length + 2,
      top: 1,
      width: legendWidth,
      left: self.width - legendWidth - 3,
      content: '',
      fg: 'green',
      tags: true,
      border: { type: 'line', fg: 'black' },
      style: { fg: 'blue' },
      screen: self.screen
    })
    let legendText = ''
    const maxChars = legendWidth - 2
    for (let i = 0; i < seriesCollection.length; i++) {
      const style = seriesCollection[i].style || {}
      const color = utils.getColorCode(style.line || self.options.style.line)
      legendText += '{' + color + '-fg}' + seriesCollection[i].title.substring(0, maxChars) + '{/' + color + '-fg}\r\n'
    }
    self.legend.setContent(legendText)
    self.append(self.legend)
  }
  coordX(val) { return ((this._w - this.padding.x) / this.labels.length) * val + (this.padding.x * 1.0) + 2 }
  coordY(val) {
    let res = (this._h - this.padding.y) - (
      ((this._h - this.padding.y) / (this.ticks.max - this.ticks.min)) * (val - this.ticks.min)
    )
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
    const context = this.context
    const color = this.options.style.line
    context.strokeStyle = style.line || color
    context.moveTo(0, 0)
    context.beginPath()
    context.lineTo(this.coordX(0), this.coordY(values[0]))
    for (let k = 1; k < values.length; k++)
      context.lineTo(this.coordX(k), this.coordY(values[k]))
    context.stroke()
  }
  setData(seriesCollection) {
    if (!this.context) throw 'error: canvas context does not exist. setData() for line charts must be called after the chart has been added to the screen via screen.append()'
    if (!Array.isArray(seriesCollection)) seriesCollection = [ seriesCollection ] //compatible with prev api
    const self = this
    const padding = this.padding ?? this.options.padding
    const c = this.context
    this.labels = seriesCollection[0].x
    //iteratee for lodash _.max
    // console.log('>>> this.ticks.max = ' + this.ticks.max)
    self.calcTicks(seriesCollection)
    const paddingMax = this.tickPaddingMax()
    if (padding.labelX < paddingMax) padding.labelX = paddingMax
    if ((padding.x - padding.labelX) < 0) padding.x = padding.labelX

    this.addLegend(seriesCollection)
    c.fillStyle = this.options.style.text
    c.clearRect(0, 0, this._w, this._h)

    // Draw the Y value texts
    for (let i = this.ticks.min; i < this.ticks.max; i += this.ticks.incre)
      c.fillText(
        this.formatTick(i),
        padding.x - padding.labelX,
        this.coordY(i)
      )
    for (let h = 0; h < seriesCollection.length; h++)
      this.drawLine(seriesCollection[h].y, seriesCollection[h].style)
    c.strokeStyle = this.options.style.baseline
    // Draw the axises
    c.beginPath()
    c.lineTo(padding.x, 0)
    c.lineTo(padding.x, this._h - padding.y)
    c.lineTo(this._w, this._h - padding.y)
    c.stroke()
    // Draw the X value texts
    const charsAvailable = (this._w - padding.x) / 2
    const maxLabelsPossible = charsAvailable / (self.labelWidth(this.labels) + 2)
    const pointsPerMaxLabel = Math.ceil(seriesCollection[0].y.length / maxLabelsPossible)
    let showNthLabel = this.options.showNthLabel
    if (showNthLabel < pointsPerMaxLabel) showNthLabel = pointsPerMaxLabel
    for (let i = 0; i < this.labels.length; i += showNthLabel) {
      if ((this.coordX(i) + (this.labels[i].length * 2)) <= this._w) {
        c.fillText(this.labels[i], this.coordX(i), this._h - padding.y + padding.labelY)
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

