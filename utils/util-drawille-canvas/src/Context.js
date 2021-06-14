import bresenham       from 'bresenham'
import { mat2d, vec2 } from 'gl-matrix'
import { Canvas }      from './Canvas'

export class Context {
  #canvas
  #matrix
  #stack = []
  #currPath = []
  lineWidth
  constructor(width, height, CanvasClass = Canvas) {
    this.#canvas = new CanvasClass(width, height)
    this.#matrix = mat2d.create()
  }
  get drawille() { return this.#canvas }
  set drawille(value) { return this.#canvas = value }
  get canvas() { return this.#canvas } //compatability
  set canvas(value) { this.#canvas = value }
  set fillStyle(value) { this.#canvas.fontFg = value }
  set strokeStyle(value) { this.#canvas.color = value }
  clearRect(x, y, w, h) { quad(this.#matrix, x, y, w, h, this.#canvas.unset.bind(this.#canvas)) }
  fillRect(x, y, w, h) { quad(this.#matrix, x, y, w, h, this.#canvas.set.bind(this.#canvas)) }
  save() { this.#stack.push(mat2d.clone(mat2d.create(), this.#matrix)) }
  restore() {
    const top = this.#stack.pop()
    if (top) this.#matrix = top
  }
  translate(x, y) { mat2d.translate(this.#matrix, this.#matrix, vec2.fromValues(x, y)) }
  rotate(a) { mat2d.rotate(this.#matrix, this.#matrix, a / 180 * Math.PI) }
  scale(x, y) { mat2d.scale(this.#matrix, this.#matrix, vec2.fromValues(x, y)) }
  beginPath() { this.#currPath = [] }
  closePath() { } // this._currentPath.push({ point: this._currentPath[0].point, stroke: false })
  fill() { }
  stroke() {
    if (this.lineWidth == 0) return
    const set = this.#canvas.set.bind(this.#canvas)
    for (let i = 1, curr = this.#currPath[0], next; i < this.#currPath.length; i++) {
      next = this.#currPath[i]
      if (next.stroke) bresenham(curr.point[0], curr.point[1], next.point[0], next.point[1], set)
      curr = next
    }
  }
  moveTo(x, y) { addPoint(this.#matrix, this.#currPath, x, y, false) }
  lineTo(x, y) { addPoint(this.#matrix, this.#currPath, x, y, true) }
  fillText(str, x, y) {
    const v = vec2.transformMat2d(vec2.create(), vec2.fromValues(x, y), this.#matrix)
    this.#canvas.writeText(str, ~~v[0], ~~v[1])
  }
  measureText(str) {return this.#canvas.measureText(str)}
  getContext() { return this }
}

function br([ x_, Y_ ], [ _x, _y ]) { return bresenham(~~x_, ~~Y_, ~~_x, ~~_y) }

function triangle(pa, pb, pc, fn) {
  const a = br(pb, pc)
  const b = br(pa, pc)
  const c = br(pa, pb)
  const s = a.concat(b).concat(c).sort((a, b) => a.y === b.y ? a.x - b.x : a.y - b.y)
  for (let i = 1, curr = s[0], next; i < s.length; i++) {
    next = s[i]
    if (curr.y === next.y) { for (let j = curr.x; j <= next.x; j++) fn(j, curr.y) }
    else { fn(curr.x, curr.y) }
    curr = next
  }
}

function quad(m, x, y, w, h, f) {
  const p1 = vec2.transformMat2d(vec2.create(), vec2.fromValues(x, y), m)
  const p2 = vec2.transformMat2d(vec2.create(), vec2.fromValues(x + w, y), m)
  const p3 = vec2.transformMat2d(vec2.create(), vec2.fromValues(x, y + h), m)
  const p4 = vec2.transformMat2d(vec2.create(), vec2.fromValues(x + w, y + h), m)
  triangle(p1, p2, p3, f)
  triangle(p3, p2, p4, f)
}

function addPoint(m, p, x, y, s) {
  const v = vec2.transformMat2d(vec2.create(), vec2.fromValues(x, y), m)
  p.push({
    point: [ ~~v[0], ~~v[1] ],
    stroke: s
  })
}

