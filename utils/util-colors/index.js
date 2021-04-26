/**
 * HEX_COLORS.js - color-related functions for blessed.
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
import { NUM, STR }                                                       from '@typen/enum-data-types'
import { COLOR_MAPPING, COLOR_NAMES, XTERM_COLORS }                       from './assets'
import { colors, HEX_COLORS, ncolors, RGB_COLORS, SPARSE_NAMES, vcolors } from './src/manet'

export { colors, HEX_COLORS, ncolors, RGB_COLORS, SPARSE_NAMES, vcolors }
export { COLOR_MAPPING, COLOR_NAMES, XTERM_COLORS }

export const _cache = {}

export function match(r1, g1, b1) {
  if (typeof r1 === STR) {
    let hex = r1
    if (hex[0] !== '#') { return -1 }
    hex = hexToRGB(hex)
    r1 = hex[0], g1 = hex[1], b1 = hex[2]
  }
  else if (Array.isArray(r1)) {
    b1 = r1[2], g1 = r1[1], r1 = r1[0]
  }
  const hash = (r1 << 16) | (g1 << 8) | b1
  if (_cache[hash] != null) return _cache[hash]
  let
    ldiff = Infinity,
    li    = -1,
    i     = 0,
    c,
    r2,
    g2,
    b2,
    diff
  for (; i < RGB_COLORS.length; i++) {
    c = RGB_COLORS[i]
    r2 = c[0]
    g2 = c[1]
    b2 = c[2]
    diff = colorDistance(r1, g1, b1, r2, g2, b2)
    if (diff === 0) {
      li = i
      break
    }
    if (diff < ldiff) {
      ldiff = diff
      li = i
    }
  }
  return _cache[hash] = li
}

export function RGBToHex(r, g, b) {
  if (Array.isArray(r)) { b = r[2], g = r[1], r = r[0] }
  function hex(n) {
    n = n.toString(16)
    if (n.length < 2) n = '0' + n
    return n
  }
  return '#' + hex(r) + hex(g) + hex(b)
}

export function hexToRGB(hex) {
  if (hex.length === 4) hex = hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
  const col = parseInt(hex.substring(1), 16),
        r   = (col >> 16) & 0xff,
        g   = (col >> 8) & 0xff,
        b   = col & 0xff
  return [ r, g, b ]
}

// As it happens, comparing how similar two HEX_COLORS are is really hard. Here is
// one of the simplest solutions, which doesn't require conversion to another
// color space, posted on stackoverflow[1]. Maybe someone better at math can
// propose a superior solution.
// [1] http://stackoverflow.com/questions/1633828
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return ((30 * (r1 - r2)) ** 2) + ((59 * (g1 - g2)) ** 2) + ((11 * (b1 - b2)) ** 2)
}

// This might work well enough for a terminal's HEX_COLORS: treat RGB as XYZ in a
// 3-dimensional space and go midway between the two points.
export function mixColors(c1, c2, alpha) {
  // if (c1 === 0x1ff) return c1;
  // if (c2 === 0x1ff) return c1;
  if (c1 === 0x1ff) c1 = 0
  if (c2 === 0x1ff) c2 = 0
  if (alpha == null) alpha = 0.5
  c1 = RGB_COLORS[c1]
  let r1 = c1[0]
  let g1 = c1[1]
  let b1 = c1[2]
  c2 = RGB_COLORS[c2]
  const r2 = c2[0]
  const g2 = c2[1]
  const b2 = c2[2]
  r1 += (r2 - r1) * alpha | 0
  g1 += (g2 - g1) * alpha | 0
  b1 += (b2 - b1) * alpha | 0
  return match([ r1, g1, b1 ])
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
    if (blend._cache[bg] != null) {
      bg = blend._cache[bg]
      // } else if (bg < 8) {
      //   bg += 8;
    }
    else if (bg >= 8 && bg <= 15) {
      bg -= 8
    }
    else {
      name = SPARSE_NAMES[bg]
      if (name) {
        for (i = 0; i < SPARSE_NAMES.length; i++) {
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
