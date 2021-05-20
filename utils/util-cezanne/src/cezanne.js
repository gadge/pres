import { hexToInt, rgbToInt } from '@palett/convert'
import { CSI }                from '@pres/enum-control-chars'
import { SGR }                from '@pres/enum-csi-codes'
import * as colors            from '@pres/util-colors'
import { FUN, NUM, STR }      from '@typen/enum-data-types'
import { nullish }            from '@typen/nullish'
import { Presa }              from './presa'

export const NAC = 1 << 24 // 16777216 = 256 * 256 * 256

export const COLOR_CODES = {
  default: NaN,
  normal: NaN,
  fore: NaN,
  back: NaN,
  bg: NaN,
  fg: NaN,
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  grey: 8,
  gray: 8,
}


export const tryHexToInt = hex => hex[0] === '#' ? hexToInt(hex) : null

export const LIGHT = /^(?:light(?:en)?|bright(?:en)?)/
export const PUNC = /[\W_]+/g
/**
 *
 * @param {string} name
 * @return {?number}
 * // color &= 7, color += 8
 */
export const nameToColor = (name) => {
  let color
  if (name) color = COLOR_CODES[name = name.replace(PUNC, '')]
  if (!nullish(color)) return isNaN(color) ? NAC : ~color // 按位取反
  if (LIGHT.test(name)) color = COLOR_CODES[name.replace(LIGHT, '')]
  if (!nullish(color)) return isNaN(color) ? NAC : ~(color === 8 ? (color - 1) : (color + 8))
  return null
}

export const convColor = color => {
  const t = typeof color
  color = t === NUM ? color
    : t === STR ? tryHexToInt(name) ?? nameToColor(name) ?? NAC
      : Array.isArray(color) ? rgbToInt(color)
        : NAC
  return color
}

export const styleToInt = style => {
  if (!style) return 0
  const { bold, underline, blink, inverse, invisible } = style
  return (
    (invisible ? 16 : 0) |
    (inverse ? 8 : 0) |
    (blink ? 4 : 0) |
    (underline ? 2 : 0) |
    (bold ? 1 : 0)
  )
}

// export function styleToMorisot({ style, fore, back }) {
//   return ((styleToInt(style) << 18) | (convColor(fore) << 9) | (convColor(back)))
// }

export function styleToPresa(style = {}, fore, back) {
  if (nullish(fg) && nullish(bg)) { (fore = style.fore || style.fg), (back = style.back || style.bg) }
  if (typeof fore === FUN) fore = fore(this)
  if (typeof back === FUN) back = back(this)
  return [ styleToInt(style), convColor(fore), convColor(back) ]
}

/**
 *
 * @param {string} target
 * @param {number[]} source
 * @param {number[]} norm
 * @returns {number[]}
 */
export function sgraToPresa(target, source, norm) {
  if (typeof source === NUM) source = morisotToPresa(source)
  if (typeof norm === NUM) norm = morisotToPresa(norm)
  let [ effect, fore, back ] = source
  const vec = target.slice(2, -1).split(';')
  if (!vec[0]) vec[0] = '0'
  for (let i = 0, len = vec.length, c; i < len; i++) {
    c = +vec[i] || 0
    if (c === 0) { [ effect, fore, back ] = norm } // normal / reset
    else if (c === 1) { effect |= 1 } // bold
    else if (c === 4) { effect |= 2 } // underline
    else if (c === 5) { effect |= 4 } // blink
    else if (c === 7) { effect |= 8 } // inverse
    else if (c === 8) { effect |= 16 } // invisible / conceal / hide
    else if (c === 22) { effect = norm[0] } // normal intensity
    else if (c === 24) { effect = norm[0] } // not underlined
    else if (c === 25) { effect = norm[0] } // not blink
    else if (c === 27) { effect = norm[0] } // not inverse / reversed
    else if (c === 28) { effect = norm[0] } // not conceal / reveal
    else if (c >= 30 && c <= 37) { fore = c - 30 } // color
    else if (c === 38) {
      if (+vec[i + 1] === 5) { i += 2, fore = +vec[i] }
      else if (+vec[i + 1] === 2) {
        ++i , fore = vec[++i] + SC + vec[++i] + SC + vec[++i]
      }
    }
    else if (c === 39) { fore = norm[1] } // default fg
    else if (c >= 40 && c <= 47) { back = c - 40 }
    else if (c === 48) {
      if (+vec[i + 1] === 5) { i += 2, back = +vec[i] }
      else if (+vec[i + 1] === 2) {
        ++i , back = vec[++i] + SC + vec[++i] + SC + vec[++i]
      }
    }
    else if (c === 49) { back = norm[2] } // default bg
    else if (c === 100) { fore = norm[1], back = norm[2] } // default fg/bg
    else if (c >= 90 && c <= 97) { fore = c - 90, fore += 8 }
    else if (c >= 100 && c <= 107) { back = c - 100, back += 8 }
  }
  return this ? Presa.inject.call(this, effect, fore, back) : [ effect, fore, back ]
}

/**
 *
 * @param {number[]} code
 * @param {number} tputColors
 * @returns {string}
 */
export function presaToSgra(code, tputColors) {
  let [ effect, fore, back ] = code,
      out                    = ''
  if (effect & 1) { out += '1;' } // bold
  if (effect & 2) { out += '4;' } // underline
  if (effect & 4) { out += '5;' } // blink
  if (effect & 8) { out += '7;' } // inverse
  if (effect & 16) { out += '8;' } // invisible
  if (back !== 0x1ff) {
    back = colors.reduce(back, tputColors)
    if (back < 16) {
      if (back < 8) { back += 40 }
      else if (back < 16) { back -= 8, back += 100 }
      out += back + ';'
    }
    else { out += '48;5;' + back + ';' }
  }
  if (fore !== 0x1ff) {
    fore = colors.reduce(fore, tputColors)
    if (fore < 16) {
      if (fore < 8) { fore += 30 }
      else if (fore < 16) { fore -= 8, fore += 90 }
      out += fore + ';'
    }
    else { out += '38;5;' + fore + ';' }
  }
  if (out[out.length - 1] === ';') out = out.slice(0, -1)
  return CSI + out + SGR
}