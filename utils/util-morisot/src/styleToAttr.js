import { toByte }      from '@pres/util-byte-colors'
import { styleToMode } from '@pres/util-sgr-mode'
import { FUN }         from '@typen/enum-data-types'
import { nullish }     from '@typen/nullish'

// sattr
export function styleToAttr(style = {}, fg, bg) {
  if (nullish(fg) && nullish(bg)) { ( fg = style.fore || style.fg ), ( bg = style.back || style.bg ) }
  if (typeof fg === FUN) fg = fg(this)
  if (typeof bg === FUN) bg = bg(this)
  // console.log(`>> [styleToAttr]`, fg, bg, styleToMode.call(this, style), toByte(fg), toByte(bg))
  return (
    ( styleToMode.call(this, style) << 18 ) |
    ( ( toByte(fg) ?? 0x1ff ) << 9 ) |
    ( toByte(bg) ?? 0x1ff )
  )
}

