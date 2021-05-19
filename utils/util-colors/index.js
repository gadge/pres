/**
 * colors.js - color-related functions for blessed.
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

export { COLOR_MAPPING, COLOR_NAMES, XTERM_COLORS }                             from './assets'
export { colors, vcolors, ncolors, HEX_COLORS, RGB_COLORS, SPARSE_NAMES, }      from './src/manet'
export { _cache, match, RGBToHex, hexToRGB, mixColors, blend, reduce, convert } from './src/colors'
