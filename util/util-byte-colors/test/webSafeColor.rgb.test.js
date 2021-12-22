import { hexToRgb }                                   from '@palett/convert'
import { rgbToStr }                                   from '@palett/stringify'
import { decoMatrix, logger }                         from '@spare/logger'
import { zipper }                                     from '@vect/matrix'
import { WEB_SAFE_MATRIX_HEX, WEB_SAFE_MATRIX_INDEX } from '../assets'

const matrix = zipper(
  WEB_SAFE_MATRIX_INDEX,
  WEB_SAFE_MATRIX_HEX,
  (index, hex, x, y) => `[${index}](${x},${y})${rgbToStr(hex|>hexToRgb)}`
)
matrix |> decoMatrix |> logger
