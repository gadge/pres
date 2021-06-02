import { hexToHsl }                           from '@palett/convert'
import { Fluo }                               from '@palett/fluo'
import { hslToStr }                           from '@palett/stringify'
import { SPARSE_NAMES }                       from '@pres/util-colors'
import { decoMatrix, logger }                 from '@spare/logger'
import { DOT, SP }                            from '@texting/enum-chars'
import { iso }                                from '@vect/matrix'
import { BIT3_COLOR_NAMES, BIT4_COLOR_NAMES } from '../assets'
import { hslToBit3 }                          from '../src/hslToBit3'
import { hslToBit4 }    from '../src/hslToBit4'
import { byteToHex }    from '../src/byteToHex'
import { byteToCoord }  from '../src/byteToWeb'
import { NAME_MAPPING } from './resources/nameMapping'

const matrix = iso(36, 7, null)

for (const [ index, sparseName ] of Object.entries(SPARSE_NAMES)) {
  const [ x, y ] = byteToCoord(index)
  const hex = byteToHex(index)
  const hsl = hexToHsl(hex)
  const bit3Name = BIT4_COLOR_NAMES[hslToBit4(hsl)]
  if (x < 0) {
    Fluo.hex(
      NAME_MAPPING[bit3Name] + DOT + index + DOT + hslToStr(hsl),
      hex
    ) |> logger
  }
  if (0 <= x && 0 <= y) {
    matrix[x][y] = hex
      ? Fluo.hex(
        NAME_MAPPING[bit3Name] + DOT + index + DOT + hslToStr(hsl),
        hex
      )
      : sparseName
  }
}

matrix |> decoMatrix |> logger
