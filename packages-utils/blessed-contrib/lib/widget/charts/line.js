import { Box }          from '@pres/components-core'
import { nullish }      from '@typen/nullish'
import { maxBy }        from '@vect/vector-indicator'
import * as utils       from '../../utils.js'
import { Canvas }       from '../canvas'
import { Padds, Ticks } from './spareparts'


export class Line extends Canvas {
  constructor(options = {}) {
    // if (!(this instanceof Node)) { return new Line(options) }
    if (nullish(options.showNthLabel)) options.showNthLabel = 1
    const style = options.style ?? (options.style = {})
    if (nullish(style.line)) style.line = 'yellow'
    if (nullish(style.text)) style.text = 'green'
    if (nullish(style.baseline)) style.baseline = 'black'
    const padds = options.padds = Padds.build(options.padds ?? options)
    const ticks = options.ticks = Ticks.build(options.ticks ?? options)
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
  coordX(val) { return (this.originX / this.labels.length) * val + (this.padds.x * 1.0) + 2 }
  coordY(val) {
    let res = this.originY - (this.originY / this.ticks.dif) * (val - this.ticks.min)
    res -= 2 //to separate the baseline and the data line to separate chars so canvas will show separate colors
    return res
  }
  drawLine(values, style = {}) {
    // Draw the line graph
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
  get originY() { return this._h - this.padds.y }
  get originX() { return this._w - this.padds.x }
  setData(seriesCollection) {
    if (!this.context) throw 'error: canvas context does not exist. setData() for line charts must be called after the chart has been added to the screen via screen.append()'
    if (!Array.isArray(seriesCollection)) seriesCollection = [ seriesCollection ] //compatible with prev api
    const { padds, ticks, context } = this
    this.labels = seriesCollection[0].x

    this.ticks.adaptTicks(seriesCollection)
    this.padds.adjustPadding(this.ticks.tickWidth)

    this.drawLegend(seriesCollection)
    context.fillStyle = this.options.style.text
    context.clearRect(0, 0, this._w, this._h)
    // console.log(`>>> this.canvasSize: ${this._w},${this._h}`)
    // Draw tick labels (y-axis values)
    for (let i = ticks.min; i < ticks.max; i += ticks.incre)
      context.fillText(ticks.formatTick(i), padds.relativeX, this.coordY(i))
    // Draw line bodies
    for (let h = 0; h < seriesCollection.length; h++)
      this.drawLine(seriesCollection[h].y, seriesCollection[h].style)
    context.strokeStyle = this.options.style.baseline
    // Draw x and y axes
    context.beginPath()
    context.lineTo(padds.x, 0)
    context.lineTo(padds.x, this.originY)
    context.lineTo(this._w, this.originY)
    context.stroke()
    // Draw x-value labels
    const charsLimit = this.originX / 2
    const labelCount = charsLimit / (this.labelWidth(this.labels) + 2)
    const pointsPerLabel = Math.ceil(seriesCollection[0].y.length / labelCount)
    let showNthLabel = this.options.showNthLabel
    if (showNthLabel < pointsPerLabel) showNthLabel = pointsPerLabel
    for (let i = 0; i < this.labels.length; i += showNthLabel) {
      if ((this.coordX(i) + (this.labels[i].length * 2)) <= this._w) {
        context.fillText(this.labels[i], this.coordX(i), this.originY + padds.labelY)
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

