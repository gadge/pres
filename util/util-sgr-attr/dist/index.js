import { CSI, SGR }                                                   from '@palett/enum-ansi-codes'
import { BLINK, BOLD, HIDE, INVERSE, UNDERLINE }                      from '@palett/enum-font-effects'
import { concatSgr }                                                  from '@palett/util-ansi'
import { byteToBackSgra, byteToForeSgra, degrade, rgbToByte, toByte } from '@pres/util-byte-colors'
import { assignMode, assignModeFrom, modeToSgra, styleToMode }        from '@pres/util-sgr-mode'
import { FUN }                                                        from '@typen/enum-data-types'
import { nullish }                                                    from '@typen/nullish'

function attrToSgra(attr, total) {
  const mode = attr >> 18 & 0x1ff,
        fore = attr >> 9 & 0x1ff,
        back = attr & 0x1ff
  let out = modeToSgra(mode)
  if (fore !== 0x1ff) out = concatSgr(out, byteToForeSgra(degrade(fore, total)))
  if (back !== 0x1ff) out = concatSgr(out, byteToBackSgra(degrade(back, total)))
  return CSI + out + SGR
}

function attrToVec(code) {
  const m = code >> 18 & 0x1ff,
        f = code >> 9 & 0x1ff,
        b = code & 0x1ff
  return [ m, f, b ]
}

// ch === 100 ? ( fore = normAttr >> 9 & 0x1ff, back = normAttr & 0x1ff )

function sgraToAttr(sgra, baseAttr, normAttr) {
  const ve = sgra.slice(2, -1).split(';')
  let mode = baseAttr >> 18 & 0x1ff,
      fore = baseAttr >> 9 & 0x1ff,
      back = baseAttr & 0x1ff
  if (!ve[0]) ve[0] = '0'

  for (let i = 0, hi = ve.length, ch, nx; i < hi; i++) {
    ch = +ve[i] || 0
    if (ch === 0) mode = normAttr >> 18 & 0x1ff, fore = normAttr >> 9 & 0x1ff, back = normAttr & 0x1ff
    mode = ch === 1 ? assignMode(mode, BOLD, true) // ( m |= 1 ) // bold
      : ch === 4 ? assignMode(mode, UNDERLINE, true) // ( m |= 2 ) // underline
        : ch === 5 ? assignMode(mode, BLINK, true) // ( m |= 4 ) // blink
          : ch === 7 ? assignMode(mode, INVERSE, true) // ( m |= 8 ) // inverse
            : ch === 8 ? assignMode(mode, HIDE, true) // ( m |= 16 ) // invisible
              : ch === 22 ? assignModeFrom(mode, BOLD, normAttr >> 18 & 0x1ff) // ( m = normAttr >> 18 & 0x1ff )
                : ch === 24 ? assignModeFrom(mode, UNDERLINE, normAttr >> 18 & 0x1ff) // ( m = normAttr >> 18 & 0x1ff )
                  : ch === 25 ? assignModeFrom(mode, BLINK, normAttr >> 18 & 0x1ff) // ( m = normAttr >> 18 & 0x1ff )
                    : ch === 27 ? assignModeFrom(mode, INVERSE, normAttr >> 18 & 0x1ff) // ( m = normAttr >> 18 & 0x1ff )
                      : ch === 28 ? assignModeFrom(mode, HIDE, normAttr >> 18 & 0x1ff) // ( m = normAttr >> 18 & 0x1ff )
                        : mode
    fore = 30 <= ch && ch <= 37 ? ch - 30 : ch === 38 && ( nx = +ve[++i] ) ? nx === 5 ? +ve[++i] : nx === 2 ? rgbToByte(+ve[++i], +ve[++i], +ve[++i]) ?? normAttr >> 9 & 0x1ff : fore : ch === 39 ? normAttr >> 9 & 0x1ff : 90 <= ch && ch <= 97 ? ( fore = ch - 90, fore += 8 ) : fore
    back = 40 <= ch && ch <= 47 ? ch - 40 : ch === 48 && ( nx = +ve[++i] ) ? nx === 5 ? +ve[++i] : nx === 2 ? rgbToByte(+ve[++i], +ve[++i], +ve[++i]) ?? normAttr & 0x1ff : back : ch === 49 ? normAttr & 0x1ff : ch >= 100 && ch <= 107 ? ( back = ch - 100, back += 8 ) : back
  }

  return mode << 18 | fore << 9 | back
}

function styleToAttr(style = {}, fg, bg) {
  if (nullish(fg) && nullish(bg)) {
    fg = style.fore || style.fg, bg = style.back || style.bg
  }

  if (typeof fg === FUN) fg = fg(this)
  if (typeof bg === FUN) bg = bg(this) // console.log(`>> [styleToAttr]`, fg, bg, styleToMode.call(this, style), toByte(fg), toByte(bg))

  return styleToMode.call(this, style) << 18 | ( toByte(fg) ?? 0x1ff ) << 9 | ( toByte(bg) ?? 0x1ff )
}

export { attrToSgra, attrToVec, sgraToAttr, styleToAttr }
