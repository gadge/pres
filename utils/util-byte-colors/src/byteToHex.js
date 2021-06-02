import { XTERM_COLORS }   from '../assets'
import { byteToGrey } from './byteToGrey'
import { byteToWeb }  from './byteToWeb'

export const byteToHex = (i) => (
  i &= 0xff,
    i < 16 ? XTERM_COLORS[i]
      : i >= 232 ? byteToGrey(i)
      : byteToWeb(i)
)