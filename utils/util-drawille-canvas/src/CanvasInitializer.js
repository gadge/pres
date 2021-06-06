import { CSI, SGR } from '@palett/enum-ansi-codes'
import { Canvas }   from './Canvas'
import { Context }  from './Context'

export function CanvasInitializer(width, height, canvasClass) {
  let ctx
  this.getContext = function () {
    return ctx = ctx || new Context(width, height, canvasClass)
  }
}

CanvasInitializer.prototype.__proto__ = Canvas.prototype

CanvasInitializer.prototype.writeText = function (str, x, y) {
  const coord = this.getCoord(x, y)
  for (let i = 0; i < str.length; i++) {
    this.chars[coord + i] = str[i]
  }

  const bg = getBgCode(this.fontBg)
  const fg = getFgCode(this.fontFg)

  this.chars[coord] = fg + bg + this.chars[coord]
  this.chars[coord + str.length - 1] += CSI + '39' + SGR + CSI + '49' + SGR
}

const map = [
  [ 0x1, 0x8 ],
  [ 0x2, 0x10 ],
  [ 0x4, 0x20 ],
  [ 0x40, 0x80 ]
]

CanvasInitializer.prototype.set = function (x, y) {
  if (!( x >= 0 && x < this.width && y >= 0 && y < this.height )) return

  const coord = this.getCoord(x, y)
  const mask = map[y % 4][x % 2]

  this.content[coord] |= mask
  this.colors[coord] = getFgCode(this.color)
  this.chars[coord] = null
}

CanvasInitializer.prototype.frame = function frame(delimiter) {
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