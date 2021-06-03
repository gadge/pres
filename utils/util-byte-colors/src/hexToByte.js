import { hexToInt } from '@palett/convert'

export function hexToByte(hex) {
  const n = hexToInt(hex)
  const r = Math.round(( n >> 20 & 0xf ) / 3) // get R from RrGgBb
  const g = Math.round(( n >> 12 & 0xf ) / 3) // get G from RrGgBb
  const b = Math.round(( n >> 4 & 0xf ) / 3) // get B from RrGgBb
  return ( r * 36 ) + ( g * 6 + b ) + 16 //  x = g * 6 + b, y = r
}

export function hexToCoord(hex) {
  const n = hexToInt(hex)
  const r = Math.round(( n >> 20 & 0xf ) / 3) // get R from RrGgBb
  const g = Math.round(( n >> 12 & 0xf ) / 3) // get G from RrGgBb
  const b = Math.round(( n >> 4 & 0xf ) / 3) // get B from RrGgBb
  return [ g * 6 + b, r ] //  x = g * 6 + b, y = r
}

export function coordToByte(x, y) {
  return ( y * 36 ) + x + 16
}