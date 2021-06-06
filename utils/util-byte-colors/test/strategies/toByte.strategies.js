import { rand }              from '@aryth/rand'
import { makeEmbedded }      from '@foba/util'
import { rgbToHex }          from '@palett/convert'
import { DyeFab }            from '@palett/dye-factory'
import { INVERSE }           from '@palett/enum-font-effects'
import { hexToStr }          from '@palett/stringify'
import * as colors           from '@pres/util-colors'
import { decoCrostab, says } from '@spare/logger'
import { NUM, STR }          from '@typen/enum-data-types'
import { strategies }        from '@valjoux/strategies'
import { byteToHex }         from '../../dist/index.esm'
import { hexToByte }         from '../../src/hexToByte'
import { rgbToByte }         from '../../src/rgbToByte'
import { toByte }            from '../../src/toByte'
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

export function toByteArc(color) {
  function matchToByte(...rgb) {
    if (!rgb.length) return null
    const [ ini ] = rgb
    if (typeof ini === STR) return ini[0] === '#' ? hexToByte(ini) : null
    if (Array.isArray(ini)) rgb = ini
    return rgbToByte(rgb[0], rgb[1], rgb[2])
  }
  color = typeof color === NUM ? color
    : typeof color === STR ? COLOR_NAMES[color = color.replace(/[\- ]/g, '')] ?? matchToByte(color)
      : Array.isArray(color)
        ? matchToByte(color)
        : -1
  return color === -1 ? 0x1ff : color
}

const { lapse, result } = strategies({
  repeat: 1E+6,
  candidates: {
    rand_alpha: [ rand(255), rand(255), rand(255) ] |> rgbToHex,
    rand_beta: [ rand(255), rand(255), rand(255) ] |> rgbToHex,
    rand_gamma: [ rand(255), rand(255), rand(255) ] |> rgbToHex,
    rand_delta: [ rand(255), rand(255), rand(255) ] |> rgbToHex,
    rand_epsilon: [ rand(255), rand(255), rand(255) ] |> rgbToHex,
    custom_alpha: [ 25, 75, 125 ] |> rgbToHex,
    custom_beta: [ 75, 125, 175 ] |> rgbToHex,
    custom_gamma: [ 175, 225, 25 ] |> rgbToHex,
    custom_delta: [ 175, 45, 25 ] |> rgbToHex,
    custom_epsilon: [ 25, 45, 175 ] |> rgbToHex,
    hex_black: '#000000',
    hex_b_grey: '#eeeeee',
    hex_white: '#ffffff',
    word_b_jaune: 'bright-yellow',
    word_b_cyan: 'light-cyan',
    word_noir: 'black',
    word_blanc: 'white',
    word_grey: 'grey',
    word_b_noir: 'bright-black',
    word_b_blanc: 'light-white',
    word_b_grey: 'bright-grey',
  } |> makeEmbedded,
  methods: {
    bench: hex => hex,
    chjj: colors.convert,
    arc: toByteArc,
    edg: toByte,
  }
  // cla, dev, edg, rea, arc, epi
})

const _hexToStr = hexToStr.bind(DyeFab.prep(INVERSE))
lapse
  |> decoCrostab |> says['lapse']

result
  |> decoCrostab |> says['result.toString']

result
  .map(x => typeof x === NUM
    ? x|> byteToHex |> _hexToStr
    : x |> _hexToStr
  )
  |> decoCrostab |> says['result']


