import { hexToHsl }  from '@palett/convert'
import { byteToHex } from './byteToHex'
import { hslToBit3 } from './hslToBit3'
import { hslToBit4 } from './hslToBit4'

export const degrade = (index, total) => {
  if (total <= 16 && 16 <= index) return index |> byteToHex |> hexToHsl |> hslToBit4
  if (total <= 8) {
    if (16 <= index) return index |> byteToHex |> hexToHsl |> hslToBit3
    if (8 <= index) return index - 8
  }
  if (total <= 2 && 2 <= index) return index % 2
  return index
}