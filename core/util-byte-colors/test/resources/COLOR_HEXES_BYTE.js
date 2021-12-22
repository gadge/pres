import { range }            from '@vect/vector'
import { COLOR_HEXES_BIT4 } from '../../assets/index.js'
import { byteToGrey }       from '../../src/convert/byteToGrey.js'
import { byteToWeb }        from '../../src/convert/byteToWeb.js'

export const COLOR_HEXES_BYTE = [].concat(
  COLOR_HEXES_BIT4,
  range(16, 231).map(byteToWeb),
  range(232, 255).map(byteToGrey)
)
