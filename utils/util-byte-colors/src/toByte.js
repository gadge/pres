import { STR }       from '@typen/enum-data-types'
import { hexToByte } from './hexToByte'
import { rgbToByte } from './rgbToByte'

export function toByte(...rgb) {
  const [ ini ] = rgb
  if (typeof ini === STR) return ini.startsWith('#') ? hexToByte(ini) : -1
  if (Array.isArray(ini)) rgb = ini
  return rgbToByte(rgb[0], rgb[1], rgb[2])
}


