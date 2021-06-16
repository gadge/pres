import { hexToShort }       from '@palett/convert'
import { mapper }           from '@vect/vector'
import { COLOR_HEXES_BIT4 } from '../../assets'

export const SHORT16 = mapper(COLOR_HEXES_BIT4, hexToShort)

export function hexToBit4(hex) {
  for (
    let i = 0, short = hexToShort(hex);
    i < SHORT16.length;
    i++
  ) if (short === SHORT16[i]) return i
  return null
}