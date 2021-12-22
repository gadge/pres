import { CSI }         from '@pres/enum-control-chars'
import { SGR }         from '@pres/enum-csi-codes'
import { NUM, STR }    from '@typen/enum-data-types'
import { last }        from '@vect/vector'
import { COLOR_NAMES } from '../assets'
import { match }       from './match'
import { reduce }      from './reduce'

export function RGBToHex(r, g, b) {
  if (Array.isArray(r)) [ r, g, b ] = r
  function tx(n) { return ( n = n.toString(16) ).length < 2 ? '0' + n : n }
  return '#' + tx(r) + tx(g) + tx(b)
}

export function hexToRGB(hex) {
  if (hex.length === 4) {
    const [ sharp, r, g, b ] = hex
    hex = sharp + r + r + g + g + b + b
  }
  const n = parseInt(hex.slice(1), 16)
  return [ ( n >> 16 ) & 0xff, ( n >> 8 ) & 0xff, n & 0xff ]
}

export function convert(color) {
  color = typeof color === NUM ? color
    : typeof color === STR ? COLOR_NAMES[color = color.replace(/[\- ]/g, '')] ?? match(color)
      : Array.isArray(color)
        ? match(color)
        : -1

  return color !== -1 ? color : 0x1ff
}

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

export function attrToSgra(attr, total) {
  let out = ''
  let m = ( attr >> 18 ) & 0x1ff, f = ( attr >> 9 ) & 0x1ff, b = attr & 0x1ff
  if (m & 1) { out += '1;' } // bold
  if (m & 2) { out += '4;' } // underline
  if (m & 4) { out += '5;' } // blink
  if (m & 8) { out += '7;' } // inverse
  if (m & 16) { out += '8;' } // invisible
  if (f !== 0x1ff) {
    f = reduce(f, total)
    if (f < 16) {
      f += f < 8 ? 30 : f < 16 ? ( f -= 8, 90 ) : 0
      out += f + ';'
    }
    else { out += '38;5;' + f + ';' }
  }
  if (b !== 0x1ff) {
    b = reduce(b, total)
    if (b < 16) {
      b += b < 8 ? 40 : b < 16 ? ( b -= 8, 100 ) : 0
      out += b + ';'
    }
    else { out += '48;5;' + b + ';' }
  }
  return CSI + ( last(out) === ';' ? out.slice(0, -1) : out ) + SGR
}