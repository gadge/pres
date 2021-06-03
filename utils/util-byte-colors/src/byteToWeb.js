export const byteToCoord = (i) => {
  i -= 16
  const x = i % 36, y = ~~( i / 36 )
  return [ x, y ]
}

export const coordToWeb = (x, y) => {
  const r = y * 3, g = ( ~~( x / 6 ) ) * 3, b = ( x % 6 ) * 3
  return '#' + r.toString(16) + g.toString(16) + b.toString(16)
}

export const byteToWeb = (i) => {
  i -= 16
  const x = i % 36, y = ~~( i / 36 )
  const r = y * 3, g = ( ~~( x / 6 ) ) * 3, b = ( x % 6 ) * 3
  return '#' + r.toString(16) + g.toString(16) + b.toString(16)
}



