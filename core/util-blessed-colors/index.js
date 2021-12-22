/**
 * colors.js - color-related functions for blessed.
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

export {
  ccolors, colors, vcolors, ncolors, HEX_COLORS, RGB_COLORS, SPARSE_NAMES, COLOR_MAPPING, COLOR_NAMES, XTERM_COLORS
}                                                              from './assets/index.js'
export { blend, BLEND_CACHE }                                  from './src/blend.js'
export { RGBToHex, hexToRGB, convert, attrToSgra, sgraToAttr } from './src/convert.js'
export { match, match as toByte }                              from './src/match.js'
export { mixColors }                                           from './src/mixColors.js'
export { reduce, reduce as degrade }                           from './src/reduce.js'
export { sattr, sattr as styleToAttr }                         from './src/sattr.js'