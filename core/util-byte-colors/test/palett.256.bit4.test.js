import { hexToHsl }           from '@palett/convert'
import { Fluo }               from '@palett/fluo'
import { hslToStr }           from '@palett/stringify'
import { decoMatrix, logger } from '@spare/logger'
import { DOT }                from '@texting/enum-chars'
import { iso }              from '@vect/matrix'
import { COLOR_NAMES_BIT4 } from '../assets/index.js'
import { byteToCoord }      from '../src/convert/byteToWeb.js'
import { hslToBit4 }        from '../src/convert/hslToBit4.js'
import { COLOR_HEXES_BYTE } from './resources/COLOR_HEXES_BYTE.js'
import { NAME_MAPPING }     from './resources/NAME_MAPPING.js'

const matrix = iso(36, 7, null)

for (const [ index, hex ] of Object.entries(COLOR_HEXES_BYTE)) {
  const hsl = hexToHsl(hex)
  const bit3Name = COLOR_NAMES_BIT4[hslToBit4(hsl)]
  const [ x, y ] = byteToCoord(index)
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
      : null
  }
}

matrix |> decoMatrix |> logger
