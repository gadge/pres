import { FUN }     from '@typen/enum-data-types'
import { convert } from './convert'


export function sattr(style, fg, bg) {
  let { bold, underline, blink, inverse, invisible } = style
  if (fg == null && bg == null) { ( fg = style.fg ), ( bg = style.bg ) }
  if (typeof bold === FUN) bold = bold(this)
  if (typeof underline === FUN) underline = underline(this)
  if (typeof blink === FUN) blink = blink(this)
  if (typeof inverse === FUN) inverse = inverse(this)
  if (typeof invisible === FUN) invisible = invisible(this)
  if (typeof fg === FUN) fg = fg(this)
  if (typeof bg === FUN) bg = bg(this)
  // console.log('>> [element.sattr]', this.codename, fg ?? AEU, 'to', colors.convert(fg), bg ?? AEU, 'to', colors.convert(bg))
  return (
    ( ( invisible ? 16 : 0 ) << 18 ) |
    ( ( inverse ? 8 : 0 ) << 18 ) |
    ( ( blink ? 4 : 0 ) << 18 ) |
    ( ( underline ? 2 : 0 ) << 18 ) |
    ( ( bold ? 1 : 0 ) << 18 ) |
    ( convert(fg) << 9 ) |
    ( convert(bg) )
  ) // return (this.uid << 24) | ((this.dockBorders ? 32 : 0) << 18)
}