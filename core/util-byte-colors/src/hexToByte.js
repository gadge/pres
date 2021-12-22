import { hexToShort } from '@palett/convert'
import { hexToBit4 }  from './convert/hexToBit4.js'
import { srgbToGrey } from './convert/srgbToGrey.js'
import { srgbToWeb }  from './convert/srgbToWeb.js'

const CACHE = {}

export const hexToByte = hex => {
  // if (!hex?.length) return null
  if (hex.charAt(0) !== '#') return null
  const s = hexToShort(hex)
  const r = s >> 8 & 0xf, g = s >> 4 & 0xf, b = s & 0xf
  return CACHE[hex] ?? ( CACHE[hex] = hexToBit4(hex) ?? srgbToGrey(r, g, b) ?? srgbToWeb(r, g, b) )
}
