import { Fluo }                                         from '@palett/fluo'
import { logger }                                       from '@spare/logger'
import { SP }                                           from '@texting/enum-chars'
import { zipper }                                       from '@vect/vector'
import { WEB_SAFE_COLOR_HEXES, WEB_SAFE_COLOR_INDEXES } from '../assets'
import { indexToWebSafe }                               from '../src/indexToWebSafe'

zipper(WEB_SAFE_COLOR_INDEXES, WEB_SAFE_COLOR_HEXES, (indexRow, hexRow, i) => {
  let row = ''
  // zipper(indexRow, hexRow, (index, hex, j) => {
  //   row += Fluo.hex(`[${index}](${hex})(${coordToHex(i, j)})`, hex) + SP // ${hex |> hexToHsl |> hslToStr}
  // })
  zipper(indexRow, hexRow, (index, hex, j) => {
    row += Fluo.hex(`[${ index }](${ hex })(${ 16 + i },${ 36 * j })(${ indexToWebSafe(index) })`, hex) + SP // ${hex |> hexToHsl |> hslToStr}
  })
  row |> logger
})