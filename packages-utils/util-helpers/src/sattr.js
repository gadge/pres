import * as colors from '@pres/util-colors'
import { FUN }     from '@typen/enum-data-types'
import { nullish } from '@typen/nullish'

export const sattr = function (style, fg, bg) {
  let { bold, underline, blink, inverse, invisible } = style
  if (nullish(fg) && nullish(bg)) (fg = style.fg), (bg = style.bg)
  // This used to be a loop, but I decided
  // to unroll it for performance's sake.
  if (typeof bold === FUN) bold = bold(this)
  if (typeof underline === FUN) underline = underline(this)
  if (typeof blink === FUN) blink = blink(this)
  if (typeof inverse === FUN) inverse = inverse(this)
  if (typeof invisible === FUN) invisible = invisible(this)
  if (typeof fg === FUN) fg = fg(this)
  if (typeof bg === FUN) bg = bg(this)
  return (
    ((invisible ? 16 : 0) << 18) |
    ((inverse ? 8 : 0) << 18) |
    ((blink ? 4 : 0) << 18) |
    ((underline ? 2 : 0) << 18) |
    ((bold ? 1 : 0) << 18) |
    (colors.convert(fg) << 9) |
    (colors.convert(bg))
  )
}

// return (this.uid << 24)
//   | ((this.dockBorders ? 32 : 0) << 18)