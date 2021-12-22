import { shortToBit4 } from './convert/shortToBit4.js'
import { srgbToGrey }  from './convert/srgbToGrey.js'
import { srgbToWeb }   from './convert/srgbToWeb.js'


const CACHE = {}

export const rgbToByte = (r, g, b) => {
  r = r >> 4 & 0xf
  g = g >> 4 & 0xf
  b = b >> 4 & 0xf
  const s = r << 8 | g << 4 | b
  return CACHE[s] ?? ( CACHE[s] = shortToBit4(s) ?? srgbToGrey(r, g, b) ?? srgbToWeb(r, g, b) )
}