import { NUM, STR }   from '@typen/enum-data-types'
import { hexToByte }  from './hexToByte'
import { nameToByte } from './nameToByte'
import { rgbToByte }  from './rgbToByte'

export function toByte(color) {
  const t = typeof color
  if (t === NUM) return color & 0x1ff
  if (t === STR) return hexToByte(color) ?? nameToByte(color) ?? 0x1ff
  if (Array.isArray(color)) return rgbToByte.apply(null, color)
  return 0x1ff
}




