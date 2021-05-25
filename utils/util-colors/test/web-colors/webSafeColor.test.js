import { Fluo }                                   from '@palett/fluo'
import { logger }                                 from '@spare/logger'
import { SP }                                     from '@texting/enum-chars'
import { zipper }                                 from '@vect/vector'
import { webSafeColorHexes, webSafeColorIndexes } from './webSafeColor.tables'


const coordToHex = (i, j) => {
  const n = (j << 8) + (~~(i / 6) << 4) + i % 6
  return '#' + (n * 3).toString(16).padStart(3, '0').toUpperCase()
}
const indexToHex = (index) => {
  index -= 16
  const i = index % 36, j = ~~(index / 36)
  return coordToHex(i, j)
}
zipper(webSafeColorIndexes, webSafeColorHexes, (indexRow, hexRow, i) => {
  let row = ''
  // zipper(indexRow, hexRow, (index, hex, j) => {
  //   row += Fluo.hex(`[${index}](${hex})(${coordToHex(i, j)})`, hex) + SP // ${hex |> hexToHsl |> hslToStr}
  // })
  zipper(indexRow, hexRow, (index, hex, j) => {
    row += Fluo.hex(`[${index}](${hex})(${16 + i},${36 * j})(${indexToHex(index)})`, hex) + SP // ${hex |> hexToHsl |> hslToStr}
  })
  row |> logger
})