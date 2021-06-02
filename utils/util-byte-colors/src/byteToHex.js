import { COLOR_HEXES_BIT4 } from '../assets'
import { byteToGrey }       from './byteToGrey'
import { byteToWeb }        from './byteToWeb'

export const byteToHex = (i) => (
  i &= 0xff,
    i < 16 ? COLOR_HEXES_BIT4[i]
      : i >= 232 ? byteToGrey(i)
      : byteToWeb(i)
)