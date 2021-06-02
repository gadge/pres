import { XTERM_COLORS }   from '../assets'
import { indexToGrey }    from './indexToGrey'
import { indexToWebSafe } from './indexToWebSafe'

export const indexToHex = (i) => (
  i &= 0xff,
    i < 16 ? XTERM_COLORS[i]
      : i >= 232 ? indexToGrey(i)
      : indexToWebSafe(i)
)