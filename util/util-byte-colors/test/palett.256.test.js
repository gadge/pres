import { hexToHsl }           from '@palett/convert'
import { Fluo }               from '@palett/fluo'
import { hslToStr }           from '@palett/stringify'
import { SPARSE_NAMES }       from '@pres/util-colors'
import { decoMatrix, logger } from '@spare/logger'
import { iso }                from '@vect/matrix'
import { COLOR_NAMES_BIT3 }   from '../assets'
import { byteToHex }          from '../src/byteToHex'
import { byteToCoord }        from '../src/convert/byteToWeb'
import { hslToBit3 }          from '../src/convert/hslToBit3'
import { NAME_MAPPING }       from './resources/NAME_MAPPING'

const matrix = iso(36, 7, null)

for (const [ index, sparseName ] of Object.entries(SPARSE_NAMES)) {
  const [ x, y ] = byteToCoord(index)
  const hex = byteToHex(index)
  const hsl = hexToHsl(hex)
  const bit3Name = COLOR_NAMES_BIT3[hslToBit3(hsl)]
  if (x < 0) {
    Fluo.hex(
      NAME_MAPPING[sparseName] + '.' + index + '.' + NAME_MAPPING[bit3Name] + '.' + hslToStr(hsl),
      hex
    ) |> logger
  }
  if (0 <= x && 0 <= y) {
    matrix[x][y] = hex
      ? Fluo.hex(
        NAME_MAPPING[sparseName] + '.' + index + '.' + NAME_MAPPING[bit3Name] + '.' + hslToStr(hsl),
        hex
      )
      : sparseName
  }
}

matrix |> decoMatrix |> logger
