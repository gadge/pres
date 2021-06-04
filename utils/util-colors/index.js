/**
 * colors.js - color-related functions for blessed.
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

export {
  ccolors, colors, vcolors, ncolors, HEX_COLORS, RGB_COLORS, SPARSE_NAMES, COLOR_MAPPING, COLOR_NAMES, XTERM_COLORS
}                                                              from './assets'
export { blend, BLEND_CACHE }                                  from './src/blend'
export { RGBToHex, hexToRGB, convert, attrToSgra, sgraToAttr } from './src/convert'
export { match }                                               from './src/match'
export { mixColors }                                           from './src/mixColors'
export { reduce }                                              from './src/reduce'