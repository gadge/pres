import { logger, xr }       from '@spare/logger'
import { hexToBit4 }        from '../src/convert/hexToBit4'
import { COLOR_HEXES_BYTE } from './resources/COLOR_HEXES_BYTE'

for (let i = 0; i < COLOR_HEXES_BYTE.length; i++) {
  const hex = COLOR_HEXES_BYTE[i]
  xr().index(i).hex(hex).bit4(hexToBit4(hex)) |> logger
}