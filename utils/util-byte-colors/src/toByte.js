import { NUM, STR }  from '@typen/enum-data-types'
import { hexToByte } from './hexToByte'
import { rgbToByte } from './rgbToByte'


// colorNames in blessed
export const COLOR_NAMES = {
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

export function toByte(color) {
  color = typeof color === NUM ? color
    : typeof color === STR ? COLOR_NAMES[color = color.replace(/[\- ]/g, '')] ?? _toByte(color)
      : Array.isArray(color)
        ? _toByte(color)
        : -1
  return color === -1 ? 0x1ff : color
}
export function _toByte(...rgb) {
  if (!rgb.length) return null
  const [ ini ] = rgb
  if (typeof ini === STR) return ini[0] === '#' ? hexToByte(ini) : null
  if (Array.isArray(ini)) rgb = ini
  return rgbToByte(rgb[0], rgb[1], rgb[2])
}


