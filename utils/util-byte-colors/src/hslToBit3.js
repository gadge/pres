import { BLA, BLU, CYA, GRE, MAG, RED, WHI, YEL } from '../assets/index'


const SLOPE = 5 / 3

export const hslToBit3 = ([ h, s, l ]) => {
  if (l >= 95) return WHI
  if (l <= 5) return BLA
  if (s <= 0) return l <= 50 ? BLA : WHI
  const y = h * SLOPE
  if (h <= 60) return l + y <= 100 ? RED : YEL
  if (h <= 120) return l + 100 <= y ? GRE : YEL
  if (h <= 180) return l + y <= 300 ? GRE : CYA
  if (h <= 240) return l + 300 <= y ? BLU : CYA
  if (h <= 300) return l + y <= 500 ? BLU : MAG
  if (h <= 360) return l + 500 <= y ? RED : MAG
  // return WHI
}

// const fDA = x => -x * SLOPE + 100
// const fUA = x => x * SLOPE - 100
// const fDB = x => -x * SLOPE + 300
// const fUB = x => x * SLOPE - 300
// const fDC = x => -x * SLOPE + 500
// const fUC = x => x * SLOPE - 500