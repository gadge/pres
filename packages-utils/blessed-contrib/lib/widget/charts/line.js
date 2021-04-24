import { Box }                  from '@pres/components-core'
import { nullish }              from '@typen/nullish'
import { maxBy }                from '@vect/vector-indicator'
import * as utils               from '../../utils.js'
import { Canvas }               from '../canvas'
import { Labels, Padds, Ticks } from './spareparts'


export class Line extends Canvas {
  constructor(options = {}) {
    if (nullish(options.labelStep)) options.labelStep = options.showNthLabel ?? 1
    const style = options.style ?? (options.style = {})
    if (nullish(style.line)) style.line = 'yellow'
    if (nullish(style.text)) style.text = 'green'
    if (nullish(style.baseline)) style.baseline = 'black'
    if (nullish(options.legend)) options.legend = {}
    const padds = options.padds = Padds.build(options.padds ?? options)
    const ticks = options.ticks = Ticks.build(options.ticks ?? options)
    const labels = options.labels = Labels.build(options.labels ?? options)
    super(options)
    console.log('>>> this.options\n')
    console.log(this.options)
    this.style = style
    this.padds = padds
    this.ticks = ticks
    this.labels = labels
    this.type = 'line'
  }
  get originY() { return this._h - this.padds.y }
  get originX() { return this._w - this.padds.x }
  coordX(val) { return (this.originX / this.labels.length) * val + (this.padds.x * 1.0) + 2 }
  coordY(val) {
    let res = this.originY - (this.originY / this.ticks.dif) * (val - this.ticks.min)
    res -= 2 //to separate the baseline and the data line to separate chars so canvas will show separate colors
    return res
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
  drawAxes() {
    const { context } = this
    context.strokeStyle = this.options.style.baseline
    context.beginPath()
    context.lineTo(this.padds.x, 0)
    context.lineTo(this.padds.x, this.originY)
    context.lineTo(this._w, this.originY)
    context.stroke()
  }
  setData(seriesCollection) {
    if (!this.context) throw 'error: canvas context does not exist. setData() for line charts must be called after the chart has been added to the screen via screen.append()'
    if (!Array.isArray(seriesCollection)) seriesCollection = [ seriesCollection ] //compatible with prev api
    const { padds, ticks, labels, context } = this
    labels.loadLabels(seriesCollection)
    this.ticks.adaptTicks(seriesCollection)
    this.padds.adjustPadding(this.ticks.tickWidth)
    this.drawLegend(seriesCollection)
    context.fillStyle = this.options.style.text
    context.clearRect(0, 0, this._w, this._h)
    // Draw tick labels (y-axis values)
    for (let i = ticks.min; i < ticks.max; i += ticks.incre)
      context.fillText(ticks.formatTick(i), padds.relativeX, this.coordY(i))
    // Draw line bodies
    for (const series of seriesCollection) this.drawLine(series.y, series.style)
    // Draw x and y axes
    this.drawAxes()
    // Draw x-value labels
    const charsLimit = this.originX / 2
    for (let i = 0, step = labels.labelStep(charsLimit); i < labels.length; i += step) {
      if ((this.coordX(i) + (labels.list[i].length * 2)) <= this._w) {
        context.fillText(labels.list[i], this.coordX(i), this.originY + padds.labelY)
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

