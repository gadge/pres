import { hexToInt, rgbToInt }                          from '@palett/convert'
import { CSI }                                         from '@pres/enum-control-chars'
import { SGR }                                         from '@pres/enum-csi-codes'
import { styleToMode }                                 from '@pres/util-sgr-mode'
import { FUN, NUM, STR }                               from '@typen/enum-data-types'
import { nullish }                                     from '@typen/nullish'
import { COLOR_CODES, COLORS_4BITS, LIGHT, NAC, PUNC } from '../assets/index.js'
import { Lum }                                         from './lum.js'


/**
 *
 * @param {string} name
 * @return {?number}
 * // color &= 7, color += 8
 */
export const nameToColor = (name) => {
  let i
  if (name) i = COLOR_CODES[name = name.replace(PUNC, '')]
  if (!nullish(i)) return isNaN(i) ? NAC : COLORS_4BITS[i] // 按位取反
  if (LIGHT.test(name)) i = COLOR_CODES[name.replace(LIGHT, '')]
  if (!nullish(i)) return isNaN(i) ? NAC : COLORS_4BITS[i === 8 ? i - 1 : i + 8]
  return null
}

export const convHex = hex => hex[0] === '#' ? hexToInt(hex) : null

export const toInt = color => {
  const t = typeof color
  color = t === NUM ? color
    : t === STR ? convHex(color) ?? nameToColor(color) ?? NAC
      : Array.isArray(color) ? rgbToInt(color)
        : NAC
  return color
}

export function styleToLum(style = {}, fore, back) {
  if (nullish(fore) && nullish(back)) { ( fore = style.fore || style.fg ), ( back = style.back || style.bg ) }
  if (typeof fore === FUN) fore = fore(this)
  if (typeof back === FUN) back = back(this)
  return new Lum(styleToMode(style), toInt(fore), toInt(back))
}

/**
 *
 * @param {string} sgr
 * @param {Lum} source
 * @param {Lum} norm
 * @returns {Lum}
 */
export function sgrToLum(sgr, source, norm) {
  return ( new Lum() ).mergeSGR(sgr, norm)
}

/**
 *
 * @param {Lum} lum
 * @param {number} tputColors
 * @returns {string}
 */
export function lumToSgr(lum, tputColors) {
  let tx = ''
  const { m, f, b } = lum
  if (m & 1) { tx += '1;' } // bold
  if (m & 2) { tx += '4;' } // underline
  if (m & 4) { tx += '5;' } // blink
  if (m & 8) { tx += '7;' } // inverse
  if (m & 16) { tx += '8;' } // invisible
  if (!nullish(b)) { tx += '48;2;' + ( b >> 16 & 0xFF ) + ';' + ( b >> 8 & 0xFF ) + ';' + ( b & 0xFF ) + ';' }
  if (!nullish(f)) { tx += '38;2;' + ( f >> 16 & 0xFF ) + ';' + ( f >> 8 & 0xFF ) + ';' + ( f & 0xFF ) + ';' }
  if (tx[tx.length - 1] === ';') tx = tx.slice(0, -1)
  return CSI + tx + SGR
}