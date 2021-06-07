import bresenham       from 'bresenham'
import { mat2d, vec2 } from 'gl-matrix'
import { Canvas }      from './Canvas'


export class Context {
  constructor(width, height, CanvasClass = Canvas) {
    this._canvas = new CanvasClass(width, height)
    this.canvas = this._canvas //compatability
    this._matrix = mat2d.create()
    this._stack = []
    this._currPath = []
  }
  clearRect(x, y, w, h) {
    quad(this._matrix, x, y, w, h, this._canvas.unset.bind(this._canvas))
  }
  fillRect(x, y, w, h) {
    quad(this._matrix, x, y, w, h, this._canvas.set.bind(this._canvas))
  }
  save() {
    this._stack.push(mat2d.clone(mat2d.create(), this._matrix))
  }
  restore() {
    const top = this._stack.pop()
    if (top) this._matrix = top
  }
  translate(x, y) { mat2d.translate(this._matrix, this._matrix, vec2.fromValues(x, y)) }
  rotate(a) { mat2d.rotate(this._matrix, this._matrix, a / 180 * Math.PI) }
  scale(x, y) { mat2d.scale(this._matrix, this._matrix, vec2.fromValues(x, y)) }
  beginPath() { this._currPath = [] }
  closePath() {
    // this._currentPath.push({ point: this._currentPath[0].point, stroke: false })
  }
  stroke() {

    if (this.lineWidth == 0) return

    const set = this._canvas.set.bind(this._canvas)
    for (let i = 0; i < this._currPath.length - 1; i++) {
      const cur = this._currPath[i]
      const nex = this._currPath[i + 1]
      if (nex.stroke) {
        bresenham(cur.point[0], cur.point[1], nex.point[0], nex.point[1], set)
      }
    }
  }
  moveTo(x, y) {
    addPoint(this._matrix, this._currPath, x, y, false)
  }
  lineTo(x, y) {
    addPoint(this._matrix, this._currPath, x, y, true)
  }
  fillText(str, x, y) {
    const v = vec2.transformMat2d(vec2.create(), vec2.fromValues(x, y), this._matrix)
    this._canvas.writeText(str, ~~( v[0] ), ~~( v[1] ))
  }
  measureText(str) {return this._canvas.measureText(str)}
}

function br(p1, p2) {
  return bresenham(
    ~~( p1[0] ),
    ~~( p1[1] ),
    ~~( p2[0] ),
    ~~( p2[1] )
  )
}

function triangle(pa, pb, pc, f) {
  const a = br(pb, pc)
  const b = br(pa, pc)
  const c = br(pa, pb)
  const s = a.concat(b).concat(c).sort(function (a, b) {
    if (a.y === b.y) {
      return a.x - b.x
    }
    return a.y - b.y
  })
  for (let i = 0; i < s.length - 1; i++) {
    const cur = s[i]
    const nex = s[i + 1]
    if (cur.y === nex.y) {
      for (let j = cur.x; j <= nex.x; j++) {
        f(j, cur.y)
      }
    }
    else {
      f(cur.x, cur.y)
    }
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

Context.prototype.__defineSetter__('fillStyle', function (val) {
  this._canvas.fontFg = val
})

Context.prototype.__defineSetter__('strokeStyle', function (val) {
  this._canvas.color = val
  //this._canvas.fontBg = val
})

function addPoint(m, p, x, y, s) {
  const v = vec2.transformMat2d(vec2.create(), vec2.fromValues(x, y), m)
  p.push({
    point: [ ~~( v[0] ), ~~( v[1] ) ],
    stroke: s
  })
}

