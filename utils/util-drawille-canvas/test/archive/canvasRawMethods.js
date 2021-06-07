import { CSI, SGR } from '@palett/enum-ansi-codes'
import { MASK_MAP } from '../../assets/MASK_MAP'
import { Canvas }   from '../../src/Canvas'

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

Canvas.prototype.set = function (x, y) {
  if (x < 0 || this.width <= x || y < 0 || this.height <= y) return
  const coord = this.getCoord(x, y)
  const mask = MASK_MAP[y % 4][x % 2]

  this.content[coord] |= mask
  colors[coord] = colors[this.color]
  this.chars[coord] = null
}

Canvas.prototype.writeText = function (str, x, y) {
  const coord = this.getCoord(x, y)
  for (let i = 0; i < str.length; i++) this.chars[coord + i] = str[i]
  const bg = colors[this.fontBg]
  const fg = colors[this.fontFg]

  this.chars[coord] = CSI + '3' + fg + SGR + CSI + '4' + bg + SGR + this.chars[coord]
  this.chars[coord + str.length - 1] += CSI + '39' + SGR + CSI + '49' + SGR
}

Canvas.prototype.frame = function frame(de) {
  de = de || '\n'
  const result = []
  for (let i = 0, j = 0; i < this.content.length; i++, j++) {
    if (j === this.width / 2) { result.push(de), j = 0 }
    if (this.chars[i]) { result.push(this.chars[i]) }
    else if (!this.content[i]) { result.push(' ') }
    else {
      result.push(CSI + '3' + this.colors[i] + SGR + String.fromCharCode(0x2800 + this.content[i]) + CSI + '39' + SGR) //result.push(String.fromCharCode(0x2800 + this.content[i]))
    }
  }
  result.push(de)
  return result.join('')
}