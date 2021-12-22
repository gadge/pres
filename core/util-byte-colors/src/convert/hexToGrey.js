import { hexToShort } from '@palett/convert'
import { srgbToGrey } from './srgbToGrey.js'

export const hexToGrey = (hex) => {
  const s = hexToShort(hex)
  return srgbToGrey(s >> 8 & 0xf, s >> 4 & 0xf, s & 0xf)
}