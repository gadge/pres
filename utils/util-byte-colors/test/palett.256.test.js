import { hexToHsl }                  from '@palett/convert'
import { Fluo }                      from '@palett/fluo'
import { hslToStr }                  from '@palett/stringify'
import { COLOR_NAMES, SPARSE_NAMES } from '@pres/util-colors'
import { decoMatrix, logger }        from '@spare/logger'
import { iso }                       from '@vect/matrix'
import { hslToBit3 }                 from '../src/hslToBit3'
import { indexToHex }                from '../src/indexToHex'
import { indexToCoord }              from '../src/indexToWebSafe'
import { NAME_MAPPING }              from './resources/nameMapping'



const matrix = iso(36, 7, null)

for (const [ index, value ] of Object.entries(SPARSE_NAMES)) {
  const [ x, y ] = indexToCoord(index)
  const hex = indexToHex(index)
  const hsl = hexToHsl(hex)
  if (x < 0) {
    Fluo.hex(
      NAME_MAPPING[value] + '.' + index + '.' + NAME_MAPPING[COLOR_NAMES[hslToBit3(hsl)]] + '.' + hslToStr(hsl),
      hex
    ) |> logger
  }
  if (0 <= x && 0 <= y) {
    matrix[x][y] = hex
      ? Fluo.hex(
        NAME_MAPPING[value] + '.' + index + '.' + NAME_MAPPING[COLOR_NAMES[hslToBit3(hsl)]] + '.' + hslToStr(hsl),
        hex
      )
      : value
  }
}

matrix |> decoMatrix |> logger
