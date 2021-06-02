export const coordToHex = (x, y) => {
  const n = ( y << 8 ) + ( ~~( x / 6 ) << 4 ) + x % 6
  return '#' + ( n * 3 ).toString(16).padStart(3, '0').toUpperCase()
}

export const indexToCoord = (i) => {
  i -= 16
  const x = i % 36, y = ~~( i / 36 )
  return [ x, y ]
}

export const indexToWebSafe = (i) => coordToHex.apply(null, indexToCoord(i))