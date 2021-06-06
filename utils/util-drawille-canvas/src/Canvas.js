import { CSI, SGR }                               from '@palett/enum-ansi-codes'
import { byteToBackSgra, byteToForeSgra, toByte } from '@pres/util-byte-colors'

const map = [
  [ 0x1, 0x8 ],
  [ 0x2, 0x10 ],
  [ 0x4, 0x20 ],
  [ 0x40, 0x80 ]
]
// String Value
// RGB Value
// Number
// Default
function getFgCode(color) {
  const byte = toByte(color)
  if (byte === 0x1ff) return CSI + '39' + SGR
  return CSI + byteToForeSgra(byte) + SGR
  // if (typeof color == 'number') return CSI + '38;5;' + color + SGR
  // if (typeof color == 'string' && color !== 'normal') return CSI + '38;5;' + toByte(color) + SGR
  // if (Array.isArray(color)) return CSI + '38;5;' + rgbToByte.apply(null, color) + SGR
  // return CSI + '39' + SGR
}

function getBgCode(color) {
  const byte = toByte(color)
  if (byte === 0x1ff) return CSI + '49' + SGR
  return CSI + byteToBackSgra(byte) + SGR
  // if (typeof color == 'number') return CSI + '48;5;' + color + SGR
  // if (typeof color == 'string' && color !== 'normal') return CSI + '4' + exports.colors[color] + SGR
  // if (Array.isArray(color)) return CSI + '48;5;' + rgbToByte.apply(null, color) + SGR
  // return CSI + '49' + SGR
}

export function Canvas(width, height) {
  if (width % 2 !== 0) throw new Error('Width must be multiple of 2!')
  if (height % 4 !== 0) throw new Error('Height must be multiple of 4!')
  this.width = width
  this.height = height
  this.content = new Buffer(width * height / 8)
  this.colors = new Array(width * height / 8)
  this.chars = new Array(width * height / 8)
  this.content.fill(0)
  this.fontFg = 'normal'
  this.fontBg = 'normal'
  this.color = 'normal'
}

export const colors = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  normal: 9
}

const methods = {
  set(coord, mask) {
    this.content[coord] |= mask
    colors[coord] = colors[this.color]
    this.chars[coord] = null
  },
  unset(coord, mask) {
    this.content[coord] &= ~mask
    colors[coord] = null
    this.chars[coord] = null
  },
  toggle(coord, mask) {
    this.content[coord] ^= mask
    colors[coord] = null
    this.chars[coord] = null
  }
}

Object.keys(methods).forEach(function (method) {
  Canvas.prototype[method] = function (x, y) {
    if (!( x >= 0 && x < this.width && y >= 0 && y < this.height )) {
      return
    }
    const coord = this.getCoord(x, y)
    const mask = map[y % 4][x % 2]
    methods[method].call(this, coord, mask)
  }
})

Canvas.prototype.getCoord = function (x, y) {
  x = Math.floor(x)
  y = Math.floor(y)
  const nx = Math.floor(x / 2)
  const ny = Math.floor(y / 4)
  const coord = nx + this.width / 2 * ny
  return coord
}

Canvas.prototype.clear = function () {
  this.content.fill(0)
}

Canvas.prototype.measureText = function (str) {
  return { width: str.length * 2 + 2 }
}

Canvas.prototype.rawWriteText = function (str, x, y) {
  const coord = this.getCoord(x, y)
  for (let i = 0; i < str.length; i++) {
    this.chars[coord + i] = str[i]
  }
  const bg = colors[this.fontBg]
  const fg = colors[this.fontFg]

  this.chars[coord] = CSI + '3' + fg + SGR + CSI + '4' + bg + SGR + this.chars[coord]
  this.chars[coord + str.length - 1] += CSI + '39' + SGR + CSI + '49' + SGR
}

Canvas.prototype.rawFrame = function frame(delimiter) {
  delimiter = delimiter || '\n'
  const result = []

  let i = 0, j = 0
  for (; i < this.content.length; i++, j++) {
    if (j === this.width / 2) {
      result.push(delimiter)
      j = 0
    }
    if (this.chars[i]) {
      result.push(this.chars[i])
    }
    else if (this.content[i] == 0) {
      result.push(' ')
    }
    else {
      result.push(CSI + '3' + this.colors[i] + SGR + String.fromCharCode(0x2800 + this.content[i]) + CSI + '39' + SGR)
      //result.push(String.fromCharCode(0x2800 + this.content[i]))
    }
  }
  result.push(delimiter)
  return result.join('')
}

Canvas.prototype.writeText = function (str, x, y) {
  const coord = this.getCoord(x, y)
  for (let i = 0; i < str.length; i++) {
    this.chars[coord + i] = str[i]
  }

  const bg = getBgCode(this.fontBg)
  const fg = getFgCode(this.fontFg)

  this.chars[coord] = fg + bg + this.chars[coord]
  this.chars[coord + str.length - 1] += CSI + '39' + SGR + CSI + '49' + SGR
}

// const map = [
//   [ 0x1, 0x8 ],
//   [ 0x2, 0x10 ],
//   [ 0x4, 0x20 ],
//   [ 0x40, 0x80 ]
// ]

Canvas.prototype.set = function (x, y) {
  if (!( x >= 0 && x < this.width && y >= 0 && y < this.height )) return

  const coord = this.getCoord(x, y)
  const mask = map[y % 4][x % 2]

  this.content[coord] |= mask
  this.colors[coord] = getFgCode(this.color)
  this.chars[coord] = null
}

Canvas.prototype.frame = function frame(delimiter) {
  delimiter = delimiter || '\n'
  const result = []

  let i = 0, j = 0
  for (; i < this.content.length; i++, j++) {
    if (j == this.width / 2) {
      result.push(delimiter)
      j = 0
    }
    if (this.chars[i]) {
      result.push(this.chars[i])
    }
    else if (this.content[i] == 0) {
      result.push(' ')
    }
    else {
      const colorCode = this.colors[i]
      result.push(colorCode + String.fromCharCode(0x2800 + this.content[i]) + CSI + '39' + SGR)
      //result.push(String.fromCharCode(0x2800 + this.content[i]))
    }
  }
  result.push(delimiter)
  return result.join('')
}
