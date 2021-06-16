import { SHORT16 } from './hexToBit4'

export function shortToBit4(short) {
  for (let i = 0; i < SHORT16.length; i++) if (short === SHORT16[i]) return i
  return null
}