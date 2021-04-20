import { FUN } from '@typen/enum-data-types'

export function sattr(style, fg, bg) {
  let
    bold      = style.bold,
    underline = style.underline,
    blink     = style.blink,
    inverse   = style.inverse,
    invisible = style.invisible

  // if (arguments.length === 1) {
  if (fg == null && bg == null) {
    fg = style.fg
    bg = style.bg
  }

  // This used to be a loop, but I decided
  // to unroll it for performance's sake.
  if (typeof bold === FUN) bold = bold(this)
  if (typeof underline === FUN) underline = underline(this)
  if (typeof blink === FUN) blink = blink(this)
  if (typeof inverse === FUN) inverse = inverse(this)
  if (typeof invisible === FUN) invisible = invisible(this)

  if (typeof fg === FUN) fg = fg(this)
  if (typeof bg === FUN) bg = bg(this)

  // return (this.uid << 24)
  //   | ((this.dockBorders ? 32 : 0) << 18)
  return ((invisible ? 16 : 0) << 18)
    | ((inverse ? 8 : 0) << 18)
    | ((blink ? 4 : 0) << 18)
    | ((underline ? 2 : 0) << 18)
    | ((bold ? 1 : 0) << 18)
    | (colors.convert(fg) << 9)
    | colors.convert(bg)
}