'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var enumDataTypes = require('@typen/enum-data-types')
var enumControlChars = require('@pres/enum-control-chars')
var enumCsiCodes = require('@pres/enum-csi-codes')
var vector = require('@vect/vector')

// colorNames in blessed
const COLOR_NAMES = {
  // special
  default: -1,
  normal: -1,
  bg: -1,
  fg: -1,
  // normal
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  // light
  lightblack: 8,
  lightred: 9,
  lightgreen: 10,
  lightyellow: 11,
  lightblue: 12,
  lightmagenta: 13,
  lightcyan: 14,
  lightwhite: 15,
  // bright
  brightblack: 8,
  brightred: 9,
  brightgreen: 10,
  brightyellow: 11,
  brightblue: 12,
  brightmagenta: 13,
  brightcyan: 14,
  brightwhite: 15,
  // alternate spellings
  grey: 8,
  gray: 8,
  lightgrey: 7,
  lightgray: 7,
  brightgrey: 7,
  brightgray: 7
}

// xterm in blessed
// XTerm Colors
// These were actually tough to track down. The xterm source only uses color
// keywords. The X11 source needed to be examined to find the actual values.
// They then had to be mapped to rgb values and then converted to hex values.
const XTERM_COLORS = [ '#000000', // black
  '#cd0000', // red3
  '#00cd00', // green3
  '#cdcd00', // yellow3
  '#0000ee', // blue2
  '#cd00cd', // magenta3
  '#00cdcd', // cyan3
  '#e5e5e5', // gray90
  '#7f7f7f', // gray50
  '#ff0000', // red
  '#00ff00', // green
  '#ffff00', // yellow
  '#5c5cff', // rgb:5c/5c/ff
  '#ff00ff', // magenta
  '#00ffff', // cyan
  '#ffffff' // white
]

// Map higher colors to the first 8 colors.
// This allows translation of high colors to low colors on 8-color terminals.
// Why the hell did I do this by hand?

const LOCAL_COLOR_MAPPING = {
  blue: [ 4, 12, [ 17, 21 ], [ 24, 27 ], [ 31, 33 ], [ 38, 39 ], 45, [ 54, 57 ], [ 60, 63 ], [ 67, 69 ], [ 74, 75 ], 81, [ 91, 93 ], [ 97, 99 ], [ 103, 105 ], [ 110, 111 ], 117, [ 128, 129 ], [ 134, 135 ], [ 140, 141 ], [ 146, 147 ], 153, 165, 171, 177, 183, 189 ],
  green: [ 2, 10, 22, [ 28, 29 ], [ 34, 36 ], [ 40, 43 ], [ 46, 50 ], [ 64, 65 ], [ 70, 72 ], [ 76, 79 ], [ 82, 86 ], [ 106, 108 ], [ 112, 115 ], [ 118, 122 ], [ 148, 151 ], [ 154, 158 ], [ 190, 194 ] ],
  cyan: [ 6, 14, 23, 30, 37, 44, 51, 66, 73, 80, 87, 109, 116, 123, 152, 159, 195 ],
  red: [ 1, 9, 52, [ 88, 89 ], [ 94, 95 ], [ 124, 126 ], [ 130, 132 ], [ 136, 138 ], [ 160, 163 ], [ 166, 169 ], [ 172, 175 ], [ 178, 181 ], [ 196, 200 ], [ 202, 206 ], [ 208, 212 ], [ 214, 218 ], [ 220, 224 ] ],
  magenta: [ 5, 13, 53, 90, 96, 127, 133, 139, 164, 170, 176, 182, 201, 207, 213, 219, 225 ],
  yellow: [ 3, 11, 58, [ 100, 101 ], [ 142, 144 ], [ 184, 187 ], [ 226, 230 ] ],
  black: [ 0, 8, 16, 59, 102, [ 232, 243 ] ],
  white: [ 7, 15, 145, 188, 231, [ 244, 255 ] ]
}

class Manet {
  static HEX_COLORS = []
  static RGB_COLORS = []
  static SPARSE_NAMES = []
  static COLOR_MAPPING = LOCAL_COLOR_MAPPING // Seed all 256 HEX_COLORS. Assume xterm defaults.
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
    } // 0 - 15


    XTERM_COLORS.forEach((c, i) => {
      c = parseInt(c.substring(1), 16)
      push(i, c >> 16 & 0xff, c >> 8 & 0xff, c & 0xff)
    }) // 16 - 231

    for (r = 0; r < 6; r++) {
      for (g = 0; g < 6; g++) {
        for (b = 0; b < 6; b++) {
          i = 16 + r * 36 + g * 6 + b
          push(i, r ? r * 40 + 55 : 0, g ? g * 40 + 55 : 0, b ? b * 40 + 55 : 0)
        }
      }
    } // 232 - 255 are grey.


    for (g = 0; g < 24; g++) {
      l = g * 10 + 8
      i = 232 + g
      push(i, l, l, l)
    }

    return hexList
  }

  static initializeBit3NamesMapping() {
    Object.keys(Manet.COLOR_MAPPING).forEach(name => {
      Manet.COLOR_MAPPING[name].forEach(offset => {
        if (typeof offset === enumDataTypes.NUM) {
          Manet.SPARSE_NAMES[offset] = name
          Manet.COLOR_MAPPING[offset] = COLOR_NAMES[name]
          return
        }

        let i = offset[0]
        const l = offset[1]

        for (; i <= l; i++) {
          Manet.SPARSE_NAMES[i] = name
          Manet.COLOR_MAPPING[i] = COLOR_NAMES[name]
        }
      })
      delete Manet.COLOR_MAPPING[name]
    })
  }

}

Manet.initializeColorValues()
Manet.initializeBit3NamesMapping()
const {
        COLOR_MAPPING,
        HEX_COLORS,
        RGB_COLORS,
        SPARSE_NAMES
      } = Manet

function reduce(color, total) {
  if (color >= 16 && total <= 16) {
    color = COLOR_MAPPING[color]
  }
  else if (color >= 8 && total <= 8) {
    color -= 8
  }
  else if (color >= 2 && total <= 2) {
    color %= 2
  }

  return color
}

function RGBToHex(r, g, b) {
  if (Array.isArray(r)) [ r, g, b ] = r

  function tx(n) {
    return ( n = n.toString(16) ).length < 2 ? '0' + n : n
  }

  return '#' + tx(r) + tx(g) + tx(b)
}
function hexToRGB(hex) {
  if (hex.length === 4) {
    const [ sharp, r, g, b ] = hex
    hex = sharp + r + r + g + g + b + b
  }

  const n = parseInt(hex.slice(1), 16)
  return [ n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff ]
}
function convert(color) {
  color = typeof color === enumDataTypes.NUM ? color : typeof color === enumDataTypes.STR ? COLOR_NAMES[color = color.replace(/[\- ]/g, '')] ?? match(color) : Array.isArray(color) ? match(color) : -1
  return color !== -1 ? color : 0x1ff
}
function sgraToAttr(sgra, baseAttr, normAttr) {
  const ve = sgra.slice(2, -1).split(';')
  let m = baseAttr >> 18 & 0x1ff,
      f = baseAttr >> 9 & 0x1ff,
      b = baseAttr & 0x1ff
  if (!ve[0]) ve[0] = '0'

  for (let i = 0, hi = ve.length, c; i < hi; i++) {
    c = +ve[i] || 0
    c === 0 ? ( m = normAttr >> 18 & 0x1ff, f = normAttr >> 9 & 0x1ff, b = normAttr & 0x1ff ) : c === 1 ? m |= 1 // bold
      : c === 4 ? m |= 2 // underline
        : c === 5 ? m |= 4 // blink
          : c === 7 ? m |= 8 // inverse
            : c === 8 ? m |= 16 // invisible
              : c === 22 ? m = normAttr >> 18 & 0x1ff : c === 24 ? m = normAttr >> 18 & 0x1ff : c === 25 ? m = normAttr >> 18 & 0x1ff : c === 27 ? m = normAttr >> 18 & 0x1ff : c === 28 ? m = normAttr >> 18 & 0x1ff : c >= 30 && c <= 37 ? f = c - 30 : c === 38 && ( c = +ve[++i] ) ? f = c === 5 ? +ve[++i] : c === 2 ? ( f = match(+ve[++i], +ve[++i], +ve[++i]) ) === -1 ? normAttr >> 9 & 0x1ff : f : f : c === 39 ? f = normAttr >> 9 & 0x1ff : c >= 90 && c <= 97 ? ( f = c - 90, f += 8 ) : c >= 40 && c <= 47 ? b = c - 40 : c === 48 && ( c = +ve[++i] ) ? b = c === 5 ? +ve[++i] : c === 2 ? ( b = match(+ve[++i], +ve[++i], +ve[++i]) ) === -1 ? normAttr & 0x1ff : b : b : c === 49 ? b = normAttr & 0x1ff : c === 100 ? ( f = normAttr >> 9 & 0x1ff, b = normAttr & 0x1ff ) : c >= 100 && c <= 107 ? ( b = c - 100, b += 8 ) : void 0
  }

  return m << 18 | f << 9 | b
}
function attrToSgra(attr, total) {
  let out = ''
  let m = attr >> 18 & 0x1ff,
      f = attr >> 9 & 0x1ff,
      b = attr & 0x1ff

  if (m & 1) {
    out += '1;'
  } // bold


  if (m & 2) {
    out += '4;'
  } // underline


  if (m & 4) {
    out += '5;'
  } // blink


  if (m & 8) {
    out += '7;'
  } // inverse


  if (m & 16) {
    out += '8;'
  } // invisible


  if (f !== 0x1ff) {
    f = reduce(f, total)

    if (f < 16) {
      f += f < 8 ? 30 : f < 16 ? ( f -= 8, 90 ) : 0
      out += f + ';'
    }
    else {
      out += '38;5;' + f + ';'
    }
  }

  if (b !== 0x1ff) {
    b = reduce(b, total)

    if (b < 16) {
      b += b < 8 ? 40 : b < 16 ? ( b -= 8, 100 ) : 0
      out += b + ';'
    }
    else {
      out += '48;5;' + b + ';'
    }
  }

  return enumControlChars.CSI + ( vector.last(out) === ';' ? out.slice(0, -1) : out ) + enumCsiCodes.SGR
}

const MATCH_CACHE = {}
function match(...args) {
  const [ ini ] = args
  args = typeof ini === enumDataTypes.STR ? ini[0] !== '#' ? null : hexToRGB(ini) : Array.isArray(ini) ? ini : args
  return args ? approximate(args) : -1
}

function approximate(rgb) {
  const hash = rgb[0] << 16 | rgb[1] << 8 | rgb[2]
  if (hash in MATCH_CACHE) return MATCH_CACHE[hash]
  let i = -1

  for (let j = 0, delta, epsilon = Infinity; j < RGB_COLORS.length; j++) {
    if (( delta = colorDistance(rgb, RGB_COLORS[j]) ) < epsilon) [ epsilon, i ] = [ delta, j ]
    if (epsilon === 0) break
  }

  return MATCH_CACHE[hash] = i
} // As it happens, comparing how similar two colors are is really hard. Here is
// one of the simplest solutions, which doesn't require conversion to another
// color space, posted on stackoverflow[1]. Maybe someone better at math can
// propose a superior solution.
// [1] http://stackoverflow.com/questions/1633828


function colorDistance([ r_, g_, b_ ], [ _r, _g, _b ]) {
  return ( 30 * ( r_ - _r ) ) ** 2 + ( 59 * ( g_ - _g ) ) ** 2 + ( 11 * ( b_ - _b ) ) ** 2
}

// 3-dimensional space and go midway between the two points.

function mixColors(colorA, colorB, alpha = 0.5) {
  if (colorA === 0x1ff) colorA = 0 // if (colorA === 0x1ff) return colorA;

  if (colorB === 0x1ff) colorB = 0 // if (colorB === 0x1ff) return colorB;

  let [ r_, g_, b_ ] = RGB_COLORS[colorA],
      [ _r, _g, _b ] = RGB_COLORS[colorB]
  r_ += ( _r - r_ ) * alpha | 0
  g_ += ( _g - g_ ) * alpha | 0
  b_ += ( _b - b_ ) * alpha | 0
  return match(r_, g_, b_)
}

const BLEND_CACHE = {}
function blend(attr_, _attr, alpha) {
  // extract fore_ and back_ from attr_
  let fore_ = attr_ >> 9 & 0x1ff,
      back_ = attr_ & 0x1ff

  if (_attr != null) {
    let _fore = _attr >> 9 & 0x1ff,
        _back = _attr & 0x1ff

    fore_ = fore_ === 0x1ff ? 248 : mixColors(fore_ === 0x1ff ? 7 : fore_, _fore === 0x1ff ? 7 : _fore, alpha)
    back_ = mixColors(back_ === 0x1ff ? 0 : back_, _back === 0x1ff ? 0 : _back, alpha)
  }
  else {
    fore_ = fore_ in BLEND_CACHE ? BLEND_CACHE[fore_] // if cached, get cached
      : fore_ >= 8 && fore_ < 16 ? fore_ - 8 // dimmer fore_
        : fore_ in SPARSE_NAMES ? BLEND_CACHE[fore_] = dimmer(fore_) // find dimmer fore_ and cache
          : fore_
    back_ = back_ in BLEND_CACHE ? BLEND_CACHE[back_] // if cached, get cached
      : back_ >= 8 && back_ < 16 ? back_ - 8 // dimmer back_
        : back_ in SPARSE_NAMES ? BLEND_CACHE[back_] = dimmer(back_) // find dimmer back_ and cache
          : back_
  } // paste blended fore_ and back_ to attr_


  attr_ &= ~( 0x1ff << 9 ), attr_ |= fore_ << 9
  attr_ &= ~0x1ff, attr_ |= back_
  return attr_
}
function dimmer(i) {
  // console.log('>> dimmer', index_)
  for (let j = 0, sparseName = SPARSE_NAMES[i], r_, g_, b_, _r, _g, _b; j < SPARSE_NAMES.length; j++) if (SPARSE_NAMES[j] === sparseName && // two indexes have identical sparseName
    j !== i && ( // different indexes
      [ r_, g_, b_ ] = RGB_COLORS[i] ) && ( [ _r, _g, _b ] = RGB_COLORS[j] ) && r_ + g_ + b_ > _r + _g + _b // find _index whose color is dimmer
  ) return j

  return i
}

function sattr(style, fg, bg) {
  let {
        bold,
        underline,
        blink,
        inverse,
        invisible
      } = style

  if (fg == null && bg == null) {
    fg = style.fg, bg = style.bg
  }

  if (typeof bold === enumDataTypes.FUN) bold = bold(this)
  if (typeof underline === enumDataTypes.FUN) underline = underline(this)
  if (typeof blink === enumDataTypes.FUN) blink = blink(this)
  if (typeof inverse === enumDataTypes.FUN) inverse = inverse(this)
  if (typeof invisible === enumDataTypes.FUN) invisible = invisible(this)
  if (typeof fg === enumDataTypes.FUN) fg = fg(this)
  if (typeof bg === enumDataTypes.FUN) bg = bg(this) // console.log('>> [element.sattr]', this.codename, fg ?? AEU, 'to', colors.convert(fg), bg ?? AEU, 'to', colors.convert(bg))

  return ( invisible ? 16 : 0 ) << 18 | ( inverse ? 8 : 0 ) << 18 | ( blink ? 4 : 0 ) << 18 | ( underline ? 2 : 0 ) << 18 | ( bold ? 1 : 0 ) << 18 | convert(fg) << 9 | convert(bg) // return (this.uid << 24) | ((this.dockBorders ? 32 : 0) << 18)
}

exports.BLEND_CACHE = BLEND_CACHE
exports.COLOR_MAPPING = COLOR_MAPPING
exports.COLOR_NAMES = COLOR_NAMES
exports.HEX_COLORS = HEX_COLORS
exports.RGBToHex = RGBToHex
exports.RGB_COLORS = RGB_COLORS
exports.SPARSE_NAMES = SPARSE_NAMES
exports.XTERM_COLORS = XTERM_COLORS
exports.attrToSgra = attrToSgra
exports.blend = blend
exports.ccolors = COLOR_MAPPING
exports.colors = HEX_COLORS
exports.convert = convert
exports.degrade = reduce
exports.hexToRGB = hexToRGB
exports.match = match
exports.mixColors = mixColors
exports.ncolors = SPARSE_NAMES
exports.reduce = reduce
exports.sattr = sattr
exports.sgraToAttr = sgraToAttr
exports.styleToAttr = sattr
exports.toByte = match
exports.vcolors = RGB_COLORS
