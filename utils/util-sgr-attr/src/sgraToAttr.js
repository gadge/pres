import { BLINK, BOLD, INVERSE, UNDERLINE,HIDE } from '@palett/enum-font-effects'
import { toByte }                          from '@pres/util-byte-colors'
import { assignMode, assignModeFrom }      from '@pres/util-sgr-mode'

// attrCode
export function sgraToAttr(sgra, baseAttr, normAttr) {
  const ve = sgra.slice(2, -1).split(';')
  let mode = baseAttr >> 18 & 0x1ff, fore = baseAttr >> 9 & 0x1ff, back = baseAttr & 0x1ff
  if (!ve[0]) ve[0] = '0'
  for (let i = 0, hi = ve.length, ch, nx; i < hi; i++) {
    ch = +ve[i] || 0
    if (ch === 0) ( mode = normAttr >> 18 & 0x1ff, fore = normAttr >> 9 & 0x1ff, back = normAttr & 0x1ff )
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
    fore = 30 <= ch && ch <= 37 ? ch - 30
      : ch === 38 && ( nx = +ve[++i] ) ? ( nx === 5 ? +ve[++i] : nx === 2 ? toByte(+ve[++i], +ve[++i], +ve[++i]) ?? normAttr >> 9 & 0x1ff : fore )
        : ch === 39 ? normAttr >> 9 & 0x1ff
          : 90 <= ch && ch <= 97 ? ( fore = ch - 90, fore += 8 )
            : fore
    back = 40 <= ch && ch <= 47 ? ch - 40
      : ch === 48 && ( nx = +ve[++i] ) ? ( nx === 5 ? +ve[++i] : nx === 2 ? toByte(+ve[++i], +ve[++i], +ve[++i]) ?? normAttr & 0x1ff : back )
        : ch === 49 ? normAttr & 0x1ff
          : ch >= 100 && ch <= 107 ? ( back = ch - 100, back += 8 )
            : back
  }
  return mode << 18 | fore << 9 | back
}

// ch === 100 ? ( fore = normAttr >> 9 & 0x1ff, back = normAttr & 0x1ff )