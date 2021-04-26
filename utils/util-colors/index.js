/**
 * colors.js - color-related functions for blessed.
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
import { NUM, STR }                                                       from '@typen/enum-data-types'
import { nullish }                                                        from '@typen/nullish'
import { COLOR_MAPPING, COLOR_NAMES, XTERM_COLORS }                       from './assets'
import { colors, HEX_COLORS, ncolors, RGB_COLORS, SPARSE_NAMES, vcolors } from './src/manet'

export { colors, HEX_COLORS, ncolors, RGB_COLORS, SPARSE_NAMES, vcolors }
export { COLOR_MAPPING, COLOR_NAMES, XTERM_COLORS }

export const _cache = {}

export function match(r, g, b) {
  if (typeof r === STR) {
    const hex = r
    if (hex[0] !== '#') { return -1 }
    [ r, g, b ] = hexToRGB(hex)
  }
  else if (Array.isArray(r)) { [ r, g, b ] = r }
  const hash = (r << 16) | (g << 8) | b
  if (_cache[hash]) return _cache[hash]
  let _i = -1
  for (let i = 0, _diff = Infinity; i < RGB_COLORS.length; i++) {
    const [ _r, _g, _b ] = RGB_COLORS[i]
    const diff = colorDistance(r, g, b, _r, _g, _b)
    if (diff === 0) return _cache[hash] = i
    if (diff < _diff) { (_diff = diff), (_i = i) }
  }
  return _cache[hash] = _i
}

export function RGBToHex(r, g, b) {
  if (Array.isArray(r)) [ r, g, b ] = r
  function _tx(n) {
    n = n.toString(16)
    if (n.length < 2) n = '0' + n
    return n
  }
  return '#' + _tx(r) + _tx(g) + _tx(b)
}

export function hexToRGB(hex) {
  if (hex.length === 4) {
    const [ sharp, r, g, b ] = hex
    hex = sharp + r + r + g + g + b + b
  }
  const num = parseInt(hex.slice(1), 16)
  return [ (num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff ]
}

// As it happens, comparing how similar two colors are is really hard. Here is
// one of the simplest solutions, which doesn't require conversion to another
// color space, posted on stackoverflow[1]. Maybe someone better at math can
// propose a superior solution.
// [1] http://stackoverflow.com/questions/1633828
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return ((30 * (r1 - r2)) ** 2) + ((59 * (g1 - g2)) ** 2) + ((11 * (b1 - b2)) ** 2)
}

// This might work well enough for a terminal's colors: treat RGB as XYZ in a
// 3-dimensional space and go midway between the two points.
export function mixColors(colorA, colorB, alpha) {
  if (colorA === 0x1ff) colorA = 0 // if (colorA === 0x1ff) return colorA;
  if (colorB === 0x1ff) colorB = 0 // if (colorB === 0x1ff) return colorB;
  if (nullish(alpha)) alpha = 0.5
  let [ r_, g_, b_ ] = RGB_COLORS[colorA], [ _r, _g, _b ] = RGB_COLORS[colorB]
  r_ += (_r - r_) * alpha | 0
  g_ += (_g - g_) * alpha | 0
  b_ += (_b - b_) * alpha | 0
  return match(r_, g_, b_)
}

export function blend(attr, attr2, alpha) {
  let name, i, c, nc
  let bg = attr & 0x1ff
  if (attr2 != null) {
    let bg2 = attr2 & 0x1ff
    if (bg === 0x1ff) bg = 0
    if (bg2 === 0x1ff) bg2 = 0
    bg = mixColors(bg, bg2, alpha)
  }
  else {
    if (blend._cache[bg]) { bg = blend._cache[bg] }
    else if (bg >= 8 && bg <= 15) { bg -= 8 }
    else {
      if ((name = SPARSE_NAMES[bg])) {
        for (i = 0; i < SPARSE_NAMES.length; i++)
          if (name === SPARSE_NAMES[i] && i !== bg) {
            c = RGB_COLORS[bg]
            nc = RGB_COLORS[i]
            if (nc[0] + nc[1] + nc[2] < c[0] + c[1] + c[2]) {
              blend._cache[bg] = i
              bg = i
              break
            }
          }
      }
    }
  }
  attr &= ~0x1ff
  attr |= bg
  let fg = (attr >> 9) & 0x1ff
  if (attr2 != null) {
    let fg2 = (attr2 >> 9) & 0x1ff // 0, 7, 188, 231, 251
    if (fg === 0x1ff) { fg = 248 }
    else {
      if (fg === 0x1ff) fg = 7
      if (fg2 === 0x1ff) fg2 = 7
      fg = mixColors(fg, fg2, alpha)
    }
  }
  else if (blend._cache[fg] != null) { fg = blend._cache[fg] }
  else if (fg >= 8 && fg <= 15) { fg -= 8 }
  else if ((name = SPARSE_NAMES[fg])) {
    for (i = 0; i < SPARSE_NAMES.length; i++)
      if (name === SPARSE_NAMES[i] && i !== fg) {
        c = RGB_COLORS[fg]
        nc = RGB_COLORS[i]
        if (nc[0] + nc[1] + nc[2] < c[0] + c[1] + c[2]) {
          blend._cache[fg] = i
          fg = i
          break
        }
      }
  }
  attr &= ~(0x1ff << 9)
  attr |= fg << 9
  return attr
}
blend._cache = {}

export function reduce(color, total) {
  if (color >= 16 && total <= 16) { color = COLOR_MAPPING[color] }
  else if (color >= 8 && total <= 8) { color -= 8 }
  else if (color >= 2 && total <= 2) { color %= 2 }
  return color
}

export function convert(color) {
  color = typeof color === NUM
    ? color
    : typeof color === STR && (color = color.replace(/[\- ]/g, ''))
      ? COLOR_NAMES[color] != null
        ? COLOR_NAMES[color]
        : match(color)
      : Array.isArray(color)
        ? match(color) : -1
  return color !== -1 ? color : 0x1ff
}
