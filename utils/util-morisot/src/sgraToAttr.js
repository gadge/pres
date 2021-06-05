import { BLINK, BOLD, INVERSE, INVISIBLE, UNDERLINE } from '@palett/enum-font-effects'
import { toByte }                                     from '@pres/util-byte-colors'
import { assignMode, assignModeFrom }                 from '@pres/util-sgr-mode'

export function sgraToAttr(sgra, baseAttr, normAttr) {
  const ve = sgra.slice(2, -1).split(';')
  let mode = ( baseAttr >> 18 ) & 0x1ff, fore = ( baseAttr >> 9 ) & 0x1ff, back = ( baseAttr ) & 0x1ff
  if (!ve[0]) ve[0] = '0'
  for (let i = 0, hi = ve.length, ch, nx, byte; i < hi; i++) {
    ch = +ve[i] || 0
    ch === 0 ? ( mode = normAttr >> 18 & 0x1ff, fore = normAttr >> 9 & 0x1ff, back = normAttr & 0x1ff )
      : ch === 1 ? mode = assignMode(mode, BOLD, true) // ( m |= 1 ) // bold
      : ch === 4 ? mode = assignMode(mode, UNDERLINE, true) // ( m |= 2 ) // underline
        : ch === 5 ? mode = assignMode(mode, BLINK, true) // ( m |= 4 ) // blink
          : ch === 7 ? mode = assignMode(mode, INVERSE, true) // ( m |= 8 ) // inverse
            : ch === 8 ? mode = assignMode(mode, INVISIBLE, true) // ( m |= 16 ) // invisible
              : ch === 22 ? mode = assignModeFrom(mode, BOLD, normAttr) // ( m = normAttr >> 18 & 0x1ff )
                : ch === 24 ? mode = assignModeFrom(mode, UNDERLINE, normAttr) // ( m = normAttr >> 18 & 0x1ff )
                  : ch === 25 ? mode = assignModeFrom(mode, BLINK, normAttr) // ( m = normAttr >> 18 & 0x1ff )
                    : ch === 27 ? mode = assignModeFrom(mode, INVERSE, normAttr) // ( m = normAttr >> 18 & 0x1ff )
                      : ch === 28 ? mode = assignModeFrom(mode, INVISIBLE, normAttr) // ( m = normAttr >> 18 & 0x1ff )
                        : void 0

    fore = ( 30 <= ch && ch <= 37 ) ? ch - 30
      : ( ch === 38 && ( nx = +ve[++i] ) ) ? (
          ( nx === 5 ) ? fore = +ve[++i]
            : ( nx === 2 && ( temp = toByte(+ve[++i], +ve[++i], +ve[++i]) ) === -1 ) ? fore = normAttr >> 9 & 0x1ff
            : void 0
        )
        :
        ch === 39 ? ( fore = normAttr >> 9 & 0x1ff )
          : ch >= 90 && ch <= 97 ? ( fore = ch - 90, fore += 8 )
          : void 0;

    ( 40 <= ch && ch <= 47 ) ? ( back = ch - 40 )
      : ch === 48 && ( ch = +ve[++i] ) ? (
        ch === 5 ? ( back = +ve[++i] )
          : ch === 2 ? ( ( back = toByte(+ve[++i], +ve[++i], +ve[++i]) ) === -1 ? normAttr & 0x1ff : back )
          : void 0
      )
      : ch === 49 ? ( back = normAttr & 0x1ff )
        : ch === 100 ? ( fore = normAttr >> 9 & 0x1ff, back = normAttr & 0x1ff )
          : ch >= 100 && ch <= 107 ? ( back = ch - 100, back += 8 )
            : void 0
  }
  return ( mode << 18 ) | ( fore << 9 ) | back
}