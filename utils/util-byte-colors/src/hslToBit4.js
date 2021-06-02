import {
  BLA, BLA_LITE, BLU, BLU_LITE, CYA, CYA_LITE, GRE, GRE_LITE, MAG, MAG_LITE, RED, RED_LITE, WHI, WHI_LITE, YEL, YEL_LITE
} from '../assets/index'

const SLOPE = 5 / 3

export const hslToBit4 = ([ h, s, l ]) => {
  if (l >= 95) return WHI_LITE
  if (l <= 5) return BLA
  if (s <= 3) return l <= 50 ? BLA_LITE : WHI
  const y = h * SLOPE
  if (h <= 60) return l + y <= 100 ? l < 50 ? RED : RED_LITE : l < 50 ? YEL : YEL_LITE
  if (h <= 120) return l + 100 <= y ? l < 50 ? GRE : GRE_LITE : l < 50 ? YEL : YEL_LITE
  if (h <= 180) return l + y <= 300 ? l < 50 ? GRE : GRE_LITE : l < 50 ? CYA : CYA_LITE
  if (h <= 240) return l + 300 <= y ? l < 50 ? BLU : BLU_LITE : l < 50 ? CYA : CYA_LITE
  if (h <= 300) return l + y <= 500 ? l < 50 ? BLU : BLU_LITE : l < 50 ? MAG : MAG_LITE
  if (h <= 360) return l + 500 <= y ? l < 50 ? RED : RED_LITE : l < 50 ? MAG : MAG_LITE
  // return WHI
}

// const fDA = x => -x * SLOPE + 100
// const fUA = x => x * SLOPE - 100
// const fDB = x => -x * SLOPE + 300
// const fUB = x => x * SLOPE - 300
// const fDC = x => -x * SLOPE + 500
// const fUC = x => x * SLOPE - 500