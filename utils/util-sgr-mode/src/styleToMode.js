import { FUN } from '@typen/enum-data-types'

export function styleToMode(style) {
  let { bold, underline, blink, inverse, invisible } = style
  if (typeof bold === FUN) bold = bold(this)
  if (typeof underline === FUN) underline = underline(this)
  if (typeof blink === FUN) blink = blink(this)
  if (typeof inverse === FUN) inverse = inverse(this)
  if (typeof invisible === FUN) invisible = invisible(this)
  let v = 0
  if (bold) v |= 1
  if (underline) v |= 2
  if (blink) v |= 4
  if (inverse) v |= 8
  if (invisible) v |= 16
  return v
}