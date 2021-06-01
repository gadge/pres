import { NUM, STR }    from '@typen/enum-data-types'
import { COLOR_NAMES } from '../assets'
import { match }       from './match'

export function RGBToHex(r, g, b) {
  if (Array.isArray(r)) [ r, g, b ] = r
  function tx(n) { return ( n = n.toString(16) ).length < 2 ? '0' + n : n }
  return '#' + tx(r) + tx(g) + tx(b)
}

export function hexToRGB(hex) {
  if (hex.length === 4) {
    const [ sharp, r, g, b ] = hex
    hex = sharp + r + r + g + g + b + b
  }
  const n = parseInt(hex.slice(1), 16)
  return [ ( n >> 16 ) & 0xff, ( n >> 8 ) & 0xff, n & 0xff ]
}

export function convert(color) {
  color = typeof color === NUM ? color
    : typeof color === STR ? COLOR_NAMES[color = color.replace(/[\- ]/g, '')] ?? match(color)
      : Array.isArray(color)
        ? match(color)
        : -1
  return color !== -1 ? color : 0x1ff
}