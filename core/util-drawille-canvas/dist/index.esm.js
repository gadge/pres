import { CSI, SGR } from '@palett/enum-ansi-codes';
import { byteToForeSgra, toByte, byteToBackSgra } from '@pres/util-byte-colors';
import bresenham from 'bresenham';
import { mat2d, vec2 } from 'gl-matrix';

const MASK_MAP = [[0x1, 0x8], [0x2, 0x10], [0x4, 0x20], [0x40, 0x80]];

class Canvas {
  constructor(width, height) {
    if (width % 2 !== 0) throw new Error('Width must be multiple of 2!');
    if (height % 4 !== 0) throw new Error('Height must be multiple of 4!');
    this.width = width;
    this.height = height;
    const length = width * height / 8;
    this.content = Buffer.alloc(length).fill(0);
    this.colors = new Array(length);
    this.chars = new Array(length);
    this.fontFg = 'normal';
    this.fontBg = 'normal';
    this.color = 'normal';
  }

  set(x, y) {
    if (x < 0 || this.width <= x || y < 0 || this.height <= y) return;
    const coord = this.getCoord(x, y),
          mask = MASK_MAP[y % 4][x % 2];
    this.content[coord] |= mask;
    this.colors[coord] = CSI + byteToForeSgra(toByte(this.color)) + SGR;
    this.chars[coord] = null;
  }

  unset(x, y) {
    if (x < 0 || this.width <= x || y < 0 || this.height <= y) return;
    const coord = this.getCoord(x, y),
          mask = MASK_MAP[y % 4][x % 2];
    this.content[coord] &= ~mask;
    this.colors[coord] = null;
    this.chars[coord] = null;
  }

  toggle(x, y) {
    if (x < 0 || this.width <= x || y < 0 || this.height <= y) return;
    const coord = this.getCoord(x, y),
          mask = MASK_MAP[y % 4][x % 2];
    this.content[coord] ^= mask;
    this.colors[coord] = null;
    this.chars[coord] = null;
  }

  getCoord(x, y) {
    x = ~~x, y = ~~y;
    const nx = ~~(x >> 1),
          ny = ~~(y >> 2);
    return nx + (this.width >> 1) * ny;
  }

  clear() {
    this.content.fill(0);
  }

  measureText(str) {
    return {
      width: str.length * 2 + 2
    };
  }

  writeText(str, x, y) {
    const pos = this.getCoord(x, y);

    for (let i = 0; i < str.length; i++) this.chars[pos + i] = str[i];

    const bg = byteToBackSgra(toByte(this.fontBg));
    const fg = byteToForeSgra(toByte(this.fontFg));
    this.chars[pos] = CSI + fg + bg + SGR + this.chars[pos];
    this.chars[pos + str.length - 1] += CSI + '39;49' + SGR;
  }

  frame(de) {
    de = de || '\n';
    const result = [];

    for (let i = 0, j = 0; i < this.content.length; i++, j++) {
      if (j === this.width >> 1) {
        result.push(de), j = 0;
      }

      this.chars[i] ? result.push(this.chars[i]) : !this.content[i] ? result.push(' ') : result.push(this.colors[i] + String.fromCharCode(0x2800 + this.content[i]) + CSI + '39' + SGR); //result.push(String.fromCharCode(0x2800 + this.content[i]))
    }

    result.push(de);
    return result.join('');
  }

}

class Context {
  #canvas;
  #matrix;
  #stack = [];
  #currPath = [];
  lineWidth;

  constructor(width, height, CanvasClass = Canvas) {
    this.#canvas = new CanvasClass(width, height);
    this.#matrix = mat2d.create();
  }

  get drawille() {
    return this.#canvas;
  }

  set drawille(value) {
    return this.#canvas = value;
  }

  get canvas() {
    return this.#canvas;
  } //compatability


  set canvas(value) {
    this.#canvas = value;
  }

  set fillStyle(value) {
    this.#canvas.fontFg = value;
  }

  set strokeStyle(value) {
    this.#canvas.color = value;
  }

  clearRect(x, y, w, h) {
    quad(this.#matrix, x, y, w, h, this.#canvas.unset.bind(this.#canvas));
  }

  fillRect(x, y, w, h) {
    quad(this.#matrix, x, y, w, h, this.#canvas.set.bind(this.#canvas));
  }

  save() {
    this.#stack.push(mat2d.clone(mat2d.create(), this.#matrix));
  }

  restore() {
    const top = this.#stack.pop();
    if (top) this.#matrix = top;
  }

  translate(x, y) {
    mat2d.translate(this.#matrix, this.#matrix, vec2.fromValues(x, y));
  }

  rotate(a) {
    mat2d.rotate(this.#matrix, this.#matrix, a / 180 * Math.PI);
  }

  scale(x, y) {
    mat2d.scale(this.#matrix, this.#matrix, vec2.fromValues(x, y));
  }

  beginPath() {
    this.#currPath = [];
  }

  closePath() {} // this._currentPath.push({ point: this._currentPath[0].point, stroke: false })


  fill() {}

  stroke() {
    if (this.lineWidth === 0) return;
    const set = this.#canvas.set.bind(this.#canvas);

    for (let i = 1, curr = this.#currPath[0], next; i < this.#currPath.length; i++) {
      next = this.#currPath[i];
      if (next.stroke) bresenham(curr.point[0], curr.point[1], next.point[0], next.point[1], set);
      curr = next;
    }
  }

  moveTo(x, y) {
    addPoint(this.#matrix, this.#currPath, x, y, false);
  }

  lineTo(x, y) {
    addPoint(this.#matrix, this.#currPath, x, y, true);
  }

  fillText(str, x, y) {
    const v = vec2.transformMat2d(vec2.create(), vec2.fromValues(x, y), this.#matrix);
    this.#canvas.writeText(str, ~~v[0], ~~v[1]);
  }

  measureText(str) {
    return this.#canvas.measureText(str);
  }

  getContext() {
    return this;
  }

}

function br([x_, Y_], [_x, _y]) {
  return bresenham(~~x_, ~~Y_, ~~_x, ~~_y);
}

function triangle(pa, pb, pc, fn) {
  const a = br(pb, pc);
  const b = br(pa, pc);
  const c = br(pa, pb);
  const s = a.concat(b).concat(c).sort((a, b) => a.y === b.y ? a.x - b.x : a.y - b.y);

  for (let i = 1, curr = s[0], next; i < s.length; i++) {
    next = s[i];

    if (curr.y === next.y) {
      for (let j = curr.x; j <= next.x; j++) fn(j, curr.y);
    } else {
      fn(curr.x, curr.y);
    }

    curr = next;
  }
}

function quad(m, x, y, w, h, f) {
  const p1 = vec2.transformMat2d(vec2.create(), vec2.fromValues(x, y), m);
  const p2 = vec2.transformMat2d(vec2.create(), vec2.fromValues(x + w, y), m);
  const p3 = vec2.transformMat2d(vec2.create(), vec2.fromValues(x, y + h), m);
  const p4 = vec2.transformMat2d(vec2.create(), vec2.fromValues(x + w, y + h), m);
  triangle(p1, p2, p3, f);
  triangle(p3, p2, p4, f);
}

function addPoint(m, p, x, y, s) {
  const v = vec2.transformMat2d(vec2.create(), vec2.fromValues(x, y), m);
  p.push({
    point: [~~v[0], ~~v[1]],
    stroke: s
  });
}

class Canvas2 {
  constructor(width, height, canvasClass) {
    this._width = width;
    this._height = height;
    this._canvasClass = canvasClass;
  }

  getContext() {
    return this.ctx ?? (this.ctx = new Context(this._width, this._height, this._canvasClass));
  }

}

export { Canvas, Canvas2, Context };
