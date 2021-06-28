import { NUM, OBJ, STR } from '@typen/enum-data-types'
import { nullish }       from '@typen/nullish'

export const parseMargin = margin => {
  const t = typeof margin
  if (nullish(margin)) return { t: 0, b: 0, l: 0, r: 0 }
  if (t === NUM) return { t: margin, b: margin, l: margin, r: margin }
  if (t === STR) return parseInt(margin)
  if (t === OBJ) return { t: margin.t ?? 0, b: margin.b ?? 0, l: margin.l ?? 0, r: margin.r ?? 0 }
  return { t: 0, b: 0, l: 0, r: 0 }
}