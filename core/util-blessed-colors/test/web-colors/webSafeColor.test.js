import { Fluo }                                         from '@palett/fluo'
import { logger }                                       from '@spare/logger'
import { SP }                                           from '@texting/enum-chars'
import { zipper }                                       from '@vect/vector'
import { WEB_SAFE_COLOR_HEXES, WEB_SAFE_COLOR_INDEXES } from './webSafeColor.tables.js'


export const coordToHex = (x, y) => {
  const n = ( y << 8 ) + ( ~~( x / 6 ) << 4 ) + x % 6
  return '#' + ( n * 3 ).toString(16).padStart(3, '0').toUpperCase()
}
export const indexToCoord = (i) => {
  i -= 16
  const x = i % 36, y = ~~( i / 36 )
  return [ x, y ]
}
export const indexToHex = (i) => coordToHex.apply(null, indexToCoord(i))

zipper(WEB_SAFE_COLOR_INDEXES, WEB_SAFE_COLOR_HEXES, (indexRow, hexRow, i) => {
  let row = ''
  // zipper(indexRow, hexRow, (index, hex, j) => {
  //   row += Fluo.hex(`[${index}](${hex})(${coordToWeb(i, j)})`, hex) + SP // ${hex |> hexToHsl |> hslToStr}
  // })
  zipper(indexRow, hexRow, (index, hex, j) => {
    row += Fluo.hex(`[${index}](${hex})(${16 + i},${36 * j})(${indexToHex(index)})`, hex) + SP // ${hex |> hexToHsl |> hslToStr}
  })
  row |> logger
})