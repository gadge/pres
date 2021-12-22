import { hexToHsl }  from '@palett/convert'
import { byteToHex } from './byteToHex.js'
import { hslToBit3 } from './convert/hslToBit3.js'
import { hslToBit4 } from './convert/hslToBit4.js'

const CACHE8 = {}
const CACHE16 = {}

export const degrade = (byte, total) => {
  // console.log('>> [degrade]', byte, total)
  if (!total) return byte
  if (total <= 16 && 16 <= byte) return CACHE16[byte] ?? ( CACHE16[byte] = byte |> byteToHex |> hexToHsl |> hslToBit4 )
  if (total <= 8) {
    if (16 <= byte) return CACHE8[byte] ?? ( CACHE8[byte] = byte |> byteToHex |> hexToHsl |> hslToBit3 )
    if (8 <= byte) return byte - 8
  }
  if (total <= 2 && 2 <= byte) return byte % 2
  return byte
}