import { hexToRgb }                                   from '@palett/convert'
import { Fluo }                                       from '@palett/fluo'
import { rgbToStr }                                   from '@palett/stringify'
import { logger }                                     from '@spare/logger'
import { SP }                                         from '@texting/enum-chars'
import { zipper }                                     from '@vect/vector'
import { WEB_SAFE_MATRIX_HEX, WEB_SAFE_MATRIX_INDEX } from '../assets'
import { byteToWeb, hexToByte }                       from '../src/byteToWeb'

zipper(WEB_SAFE_MATRIX_INDEX, WEB_SAFE_MATRIX_HEX, (indexRow, hexRow, i) => {
  let row = ''
  // zipper(indexRow, hexRow, (index, hex, j) => {
  //   row += Fluo.hex(`[${index}](${hex})(${coordToWeb(i, j)})`, hex) + SP // ${hex |> hexToHsl |> hslToStr}
  // })
  zipper(indexRow, hexRow, (index, hex, j) => {
    const webHex = byteToWeb(index)
    const phrase = `[${ index }](${ hex })(${ 16 + i },${ 36 * j })(${ webHex }){${ hexToByte(webHex) }}`
    row += Fluo.hex(phrase, hex) + rgbToStr(hex|>hexToRgb) + SP // ${hex |> hexToHsl |> hslToStr}
  })
  row |> logger
})