import blessed    from '../vendor/blessed'
import Canvas  from './canvas'

const Node = blessed.Node
function Donut(options) {
  if (!(this instanceof Node)) { return new Donut(options) }
  options = options || {}
  this.options = options
  this.options.stroke = options.stroke || 'magenta'
  this.options.fill = options.fill || 'white'
  this.options.radius = options.radius || 14
  this.options.arcWidth = options.arcWidth || 4
  this.options.spacing = options.spacing || 2
  this.options.yPadding = options.yPadding || 2
  this.options.remainColor = options.remainColor || 'black'
  this.options.data = options.data || []
  Canvas.call(this, options)
  const self = this
  this.on('attach', function () { this.setData(self.options.data) })
}
Donut.prototype = Object.create(Canvas.prototype)
Donut.prototype.calcSize = function () {
  this.canvasSize = { width: Math.round(this.width * 2 - 5), height: this.height * 4 - 12 }
  if (this.canvasSize.width % 2 === 1) this.canvasSize.width--
  if (this.canvasSize.height % 4 !== 1) this.canvasSize.height += (this.canvasSize.height % 4)
}
Donut.prototype.type = 'donut'
const cos = Math.cos
const sin = Math.sin
const pi = 3.141592635
Donut.prototype.setData = function (data) { this.update(data) }
Donut.prototype.update = function (data) {
  if (!this.ctx) {
    throw 'error: canvas context does not exist. setData() for line charts must be called after the chart has been added to the screen via screen.append()'
  }
  const c = this.ctx
  c.save()
  c.translate(0, -this.options.yPadding)
  c.strokeStyle = this.options.stroke
  c.fillStyle = this.options.fill
  c.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height)
  const cheight = this.canvasSize.height
  const cwidth = this.canvasSize.width
  function makeRound(percent, radius, width, cx, cy, color) {
    let s = 0
    const points = 370
    c.strokeStyle = color || 'green'
    while (s < radius) {
      if (s < (radius - width)) {
        s++
        continue
      }
      const slice = 2 * pi / points
      c.beginPath()
      const p = parseFloat(percent * 360)
      for (let i = 0; i <= points; i++) {
        if (i > p) continue
        const si = i - 90
        const a = slice * si
        c.lineTo(Math.round(cx + s * cos(a)), Math.round(cy + s * sin(a)))
      }
      c.stroke()
      c.closePath()
      s++
    }
  }
  const donuts = data.length
  var radius = this.options.radius
  var width = this.options.arcWidth
  const remainColor = this.options.remainColor
  const middle = cheight / 2
  const spacing = (cwidth - (donuts * radius * 2)) / (donuts + 1)
  function drawDonut(label, percent, radius, width, cxx, middle, color) {
    makeRound(100, radius, width, cxx, middle, remainColor)
    makeRound(percent, radius, width, cxx, middle, color)
    const ptext = parseFloat(percent * 100).toFixed(0) + '%'
    c.fillText(ptext, cxx - Math.round(parseFloat((c.measureText(ptext).width) / 2)) + 3, middle)
    c.fillText(label, cxx - Math.round(parseFloat((c.measureText(label).width) / 2)) + 3, (middle + radius) + 5)
  }
  function makeDonut(stat, which) {
    const left = radius + (spacing * which) + (radius * 2 * (which - 1))
    let percent = stat.percent
    if (percent > 1.001) {
      percent = parseFloat(percent / 100).toFixed(2)
    }
    const label = stat.label
    const color = stat.color || 'green'
    const cxx = left
    drawDonut(label, percent, radius, width, cxx, middle, color)
  }
  function makeDonuts(stats) {
    for (let l = 0; l <= stats.length - 1; l++) {
      makeDonut(stats[l], l + 1)
    }
  }
  if (data.length) {
    makeDonuts(data)
  }
  this.currentData = data
  c.strokeStyle = 'magenta'
  c.restore()
  return
}
Donut.prototype.getOptionsPrototype = function () {
  return {
    spacing: 1,
    yPadding: 1,
    radius: 1,
    arcWidth: 1,
    data: [ { color: 'red', percent: '50', label: 'a' },
      { color: 'blue', percent: '20', label: 'b' },
      { color: 'yellow', percent: '80', label: 'c' }
    ]
  }
}
export default Donut
