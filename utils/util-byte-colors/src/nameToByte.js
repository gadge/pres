// export const NAC = 1 << 24 // 16777216 = 256 * 256 * 256
import { nullish } from '@typen/nullish'

export const NORMAL_COLOR_CODES = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  grey: 15,
  gray: 15,
}

export const BRIGHT_COLOR_CODES = {
  black: 8,
  red: 9,
  green: 10,
  yellow: 11,
  blue: 12,
  magenta: 13,
  cyan: 14,
  white: 15,
  grey: 7,
  gray: 7,
}

export const DEFAULT_CODES = {
  default: NaN,
  normal: NaN,
  fore: NaN,
  back: NaN,
  bg: NaN,
  fg: NaN,
}

export const LIGHT = /^(light|bright)\W*/
/**
 *
 * @param {string} name
 * @return {?number}
 * // color &= 7, color += 8
 */
export const nameToByte = (name) =>
  NORMAL_COLOR_CODES[name] ??
  BRIGHT_COLOR_CODES[name.replace(LIGHT, '')]
