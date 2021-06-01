import { NUM }           from '@typen/enum-data-types'
import { COLOR_MAPPING } from './colorMapping'
import { COLOR_NAMES }   from './colorNames'
import { XTERM_COLORS }  from './xtermColors'


class Manet {
  static HEX_COLORS = []
  static RGB_COLORS = []
  static SPARSE_NAMES = []
  // Seed all 256 HEX_COLORS. Assume xterm defaults.
  // Ported from the xterm color generation script.
  static initHexAndRgbColors() {
    const _hexColors = Manet.HEX_COLORS,
          _rgbColors = Manet.RGB_COLORS
    let r, g, b, i, l
    function hex(n) {
      n = n.toString(16)
      if (n.length < 2) n = '0' + n
      return n
    }
    function push(i, r, g, b) {
      _hexColors[i] = '#' + hex(r) + hex(g) + hex(b)
      _rgbColors[i] = [ r, g, b ]
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
    return _hexColors
  }
  static initSparseNames() {
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

Manet.initHexAndRgbColors()
Manet.initSparseNames()

const HEX_COLORS   = Manet.HEX_COLORS,
      RGB_COLORS   = Manet.RGB_COLORS,
      SPARSE_NAMES = Manet.SPARSE_NAMES

export {
  HEX_COLORS, HEX_COLORS as colors,
  RGB_COLORS, RGB_COLORS as vcolors,
  SPARSE_NAMES, SPARSE_NAMES as ncolors,
}
