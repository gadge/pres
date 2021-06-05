import { toByte }      from '@pres/util-byte-colors'
import { styleToMode } from '@pres/util-sgr-mode'
import { FUN }         from '@typen/enum-data-types'
import { nullish }     from '@typen/nullish'


// sattr
export function styleToAttr(style = {}, fg, bg) {
  if (nullish(fg) && nullish(bg)) { ( fg = style.fore || style.fg ), ( bg = style.back || style.bg ) }
  if (typeof fg === FUN) fg = fg(this)
  if (typeof bg === FUN) bg = bg(this)
  return styleToMode.call(this, style) << 18 | toByte(fg) << 9 | toByte(bg)
}

