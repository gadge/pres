export function srgbToWeb(r, g, b) {
  r = Math.round(r / 3) // get R from RrGgBb
  g = Math.round(g / 3) // get G from RrGgBb
  b = Math.round(b / 3) // get B from RrGgBb
  return ( r * 36 ) + ( g * 6 + b ) + 16 //  x = g * 6 + b, y = r
}

export function srgbToCoord(r, g, b) {
  r = Math.round(r / 3) // get R from RrGgBb
  g = Math.round(g / 3) // get G from RrGgBb
  b = Math.round(b / 3) // get B from RrGgBb
  return [ g * 6 + b, r ] //  x = g * 6 + b, y = r
}

export function coordToByte(x, y) {
  return ( y * 36 ) + x + 16
}