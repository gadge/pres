import { NUM }          from '@typen/enum-data-types'
import { COLOR_NAMES }  from './colorNames'
import { XTERM_COLORS } from './xtermColors'

// ccolors in blessed
// Map higher colors to the first 8 colors.
// This allows translation of high colors to low colors on 8-color terminals.
// Why the hell did I do this by hand?
const LOCAL_COLOR_MAPPING = {
  blue: [
    4,
    12,
    [ 17, 21 ],
    [ 24, 27 ],
    [ 31, 33 ],
    [ 38, 39 ],
    45,
    [ 54, 57 ],
    [ 60, 63 ],
    [ 67, 69 ],
    [ 74, 75 ],
    81,
    [ 91, 93 ],
    [ 97, 99 ],
    [ 103, 105 ],
    [ 110, 111 ],
    117,
    [ 128, 129 ],
    [ 134, 135 ],
    [ 140, 141 ],
    [ 146, 147 ],
    153,
    165,
    171,
    177,
    183,
    189
  ],
  green: [
    2,
    10,
    22,
    [ 28, 29 ],
    [ 34, 36 ],
    [ 40, 43 ],
    [ 46, 50 ],
    [ 64, 65 ],
    [ 70, 72 ],
    [ 76, 79 ],
    [ 82, 86 ],
    [ 106, 108 ],
    [ 112, 115 ],
    [ 118, 122 ],
    [ 148, 151 ],
    [ 154, 158 ],
    [ 190, 194 ]
  ],
  cyan: [
    6,
    14,
    23,
    30,
    37,
    44,
    51,
    66,
    73,
    80,
    87,
    109,
    116,
    123,
    152,
    159,
    195
  ],
  red: [
    1,
    9,
    52,
    [ 88, 89 ],
    [ 94, 95 ],
    [ 124, 126 ],
    [ 130, 132 ],
    [ 136, 138 ],
    [ 160, 163 ],
    [ 166, 169 ],
    [ 172, 175 ],
    [ 178, 181 ],
    [ 196, 200 ],
    [ 202, 206 ],
    [ 208, 212 ],
    [ 214, 218 ],
    [ 220, 224 ]
  ],
  magenta: [
    5,
    13,
    53,
    90,
    96,
    127,
    133,
    139,
    164,
    170,
    176,
    182,
    201,
    207,
    213,
    219,
    225
  ],
  yellow: [
    3,
    11,
    58,
    [ 100, 101 ],
    [ 142, 144 ],
    [ 184, 187 ],
    [ 226, 230 ]
  ],
  black: [
    0,
    8,
    16,
    59,
    102,
    [ 232, 243 ]
  ],
  white: [
    7,
    15,
    145,
    188,
    231,
    [ 244, 255 ]
  ]
}

class Manet {
  static HEX_COLORS = []
  static RGB_COLORS = []
  static SPARSE_NAMES = []
  static COLOR_MAPPING = LOCAL_COLOR_MAPPING
  // Seed all 256 HEX_COLORS. Assume xterm defaults.
  // Ported from the xterm color generation script.
  static initializeColorValues() {
    const hexList = Manet.HEX_COLORS,
          rgbList = Manet.RGB_COLORS
    let r, g, b, i, l
    function hex(n) {
      n = n.toString(16)
      if (n.length < 2) n = '0' + n
      return n
    }
    function push(i, r, g, b) {
      hexList[i] = '#' + hex(r) + hex(g) + hex(b)
      rgbList[i] = [ r, g, b ]
    }
    // 0 - 15
    XTERM_COLORS.forEach((c, i) => {
      c = parseInt(c.substring(1), 16)
      push(i, ( c >> 16 ) & 0xff, ( c >> 8 ) & 0xff, c & 0xff)
    })
    // 16 - 231
    for (r = 0; r < 6; r++) {
      for (g = 0; g < 6; g++) {
        for (b = 0; b < 6; b++) {
          i = 16 + ( r * 36 ) + ( g * 6 ) + b
          push(i, r ? ( r * 40 + 55 ) : 0, g ? ( g * 40 + 55 ) : 0, b ? ( b * 40 + 55 ) : 0)
        }
      }
    }
    // 232 - 255 are grey.
    for (g = 0; g < 24; g++) {
      l = ( g * 10 ) + 8
      i = 232 + g
      push(i, l, l, l)
    }
    return hexList
  }
  static initializeBit3NamesMapping() {
    Object.keys(COLOR_MAPPING).forEach(name => {
      COLOR_MAPPING[name].forEach(offset => {
        if (typeof offset === NUM) {
          Manet.SPARSE_NAMES[offset] = name
          COLOR_MAPPING[offset] = COLOR_NAMES[name]
          return
        }
        let i = offset[0]
        const l = offset[1]
        for (; i <= l; i++) {
          Manet.SPARSE_NAMES[i] = name
          COLOR_MAPPING[i] = COLOR_NAMES[name]
        }
      })
      delete COLOR_MAPPING[name]
    })
  }
}

Manet.initializeColorValues()
Manet.initializeBit3NamesMapping()

export const {
               COLOR_MAPPING,
               HEX_COLORS,
               RGB_COLORS,
               SPARSE_NAMES,
             } = Manet


