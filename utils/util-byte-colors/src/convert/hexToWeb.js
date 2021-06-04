import { hexToShort }             from '@palett/convert'
import { srgbToCoord, srgbToWeb } from './srgbToWeb'

export function hexToWeb(hex) {
  const s = hexToShort(hex)
  return srgbToWeb(s >> 8 & 0xf, s >> 4 & 0xf, s & 0xf)
}

export function hexToCoord(hex) {
  const s = hexToShort(hex)
  return srgbToCoord(s >> 8 & 0xf, s >> 4 & 0xf, s & 0xf)
}