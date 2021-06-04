import { match } from '@pres/util-colors/src/match'

export function sgraToAttr(sgra, baseAttr, normAttr) {
  const ve = sgra.slice(2, -1).split(';')
  let m = ( baseAttr >> 18 ) & 0x1ff, f = ( baseAttr >> 9 ) & 0x1ff, b = ( baseAttr ) & 0x1ff
  if (!ve[0]) ve[0] = '0'
  for (let i = 0, hi = ve.length, c; i < hi; i++) {
    c = +ve[i] || 0
    c === 0 ? ( m = normAttr >> 18 & 0x1ff, f = normAttr >> 9 & 0x1ff, b = normAttr & 0x1ff )
      : c === 1 ? ( m |= 1 ) // bold
      : c === 4 ? ( m |= 2 ) // underline
        : c === 5 ? ( m |= 4 ) // blink
          : c === 7 ? ( m |= 8 ) // inverse
            : c === 8 ? ( m |= 16 ) // invisible
              : c === 22 ? ( m = normAttr >> 18 & 0x1ff )
                : c === 24 ? ( m = normAttr >> 18 & 0x1ff )
                  : c === 25 ? ( m = normAttr >> 18 & 0x1ff )
                    : c === 27 ? ( m = normAttr >> 18 & 0x1ff )
                      : c === 28 ? ( m = normAttr >> 18 & 0x1ff )
                        : c >= 30 && c <= 37 ? ( f = c - 30 )
                          : c === 38 && ( c = +ve[++i] ) ? (
                              f = c === 5 ? +ve[++i]
                                : c === 2 ? ( ( f = match(+ve[++i], +ve[++i], +ve[++i]) ) === -1 ? normAttr >> 9 & 0x1ff : f )
                                  : f
                            )
                            : c === 39 ? ( f = normAttr >> 9 & 0x1ff )
                              : c >= 90 && c <= 97 ? ( f = c - 90, f += 8 )
                                : c >= 40 && c <= 47 ? ( b = c - 40 )
                                  : c === 48 && ( c = +ve[++i] ) ? (
                                      b = c === 5 ? +ve[++i]
                                        : c === 2 ? ( ( b = match(+ve[++i], +ve[++i], +ve[++i]) ) === -1 ? normAttr & 0x1ff : b )
                                          : b
                                    )
                                    : c === 49 ? ( b = normAttr & 0x1ff )
                                      : c === 100 ? ( f = normAttr >> 9 & 0x1ff, b = normAttr & 0x1ff )
                                        : c >= 100 && c <= 107 ? ( b = c - 100, b += 8 )
                                          : void 0
  }
  return ( m << 18 ) | ( f << 9 ) | b
}