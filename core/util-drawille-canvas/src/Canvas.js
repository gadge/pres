import { CSI, SGR }                               from '@palett/enum-ansi-codes'
import { byteToBackSgra, byteToForeSgra, toByte } from '@pres/util-byte-colors'
import { MASK_MAP }                               from '../assets/MASK_MAP.js'

export class Canvas {
  constructor(width, height) {
    if (width % 2 !== 0) throw new Error('Width must be multiple of 2!')
    if (height % 4 !== 0) throw new Error('Height must be multiple of 4!')
    this.width = width
    this.height = height
    const length = width * height / 8
    this.content = Buffer.alloc(length).fill(0)
    this.colors = new Array(length)
    this.chars = new Array(length)
    this.fontFg = 'normal'
    this.fontBg = 'normal'
    this.color = 'normal'
  }
  set(x, y) {
    if (x < 0 || this.width <= x || y < 0 || this.height <= y) return
    const coord = this.getCoord(x, y), mask = MASK_MAP[y % 4][x % 2]
    this.content[coord] |= mask
    this.colors[coord] = CSI + ( byteToForeSgra(toByte(this.color)) ) + SGR
    this.chars[coord] = null
  }
  unset(x, y) {
    if (x < 0 || this.width <= x || y < 0 || this.height <= y) return
    const coord = this.getCoord(x, y), mask = MASK_MAP[y % 4][x % 2]
    this.content[coord] &= ~mask
    this.colors[coord] = null
    this.chars[coord] = null
  }
  toggle(x, y) {
    if (x < 0 || this.width <= x || y < 0 || this.height <= y) return
    const coord = this.getCoord(x, y), mask = MASK_MAP[y % 4][x % 2]
    this.content[coord] ^= mask
    this.colors[coord] = null
    this.chars[coord] = null
  }
  getCoord(x, y) {
    x = ~~x, y = ~~y
    const nx = ~~( x >> 1 ), ny = ~~( y >> 2 )
    return nx + ( this.width >> 1 ) * ny
  }
  clear() { this.content.fill(0) }
  measureText(str) { return { width: str.length * 2 + 2 } }
  writeText(str, x, y) {
    const pos = this.getCoord(x, y)
    for (let i = 0; i < str.length; i++) this.chars[pos + i] = str[i]
    const bg = byteToBackSgra(toByte(this.fontBg))
    const fg = byteToForeSgra(toByte(this.fontFg))
    this.chars[pos] = ( CSI + fg + bg + SGR ) + this.chars[pos]
    this.chars[pos + str.length - 1] += CSI + '39;49' + SGR
  }
  frame(de) {
    de = de || '\n'
    const result = []
    for (let i = 0, j = 0; i < this.content.length; i++, j++) {
      if (j === this.width >> 1) { result.push(de), j = 0 }
      this.chars[i] ? result.push(this.chars[i])
        : !this.content[i] ? result.push(' ')
          : result.push(this.colors[i] + String.fromCharCode(0x2800 + this.content[i]) + CSI + '39' + SGR)
      //result.push(String.fromCharCode(0x2800 + this.content[i]))
    }
    result.push(de)
    return result.join('')
  }
}




