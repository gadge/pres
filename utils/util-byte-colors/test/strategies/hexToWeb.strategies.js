import { rand }                 from '@aryth/rand'
import { makeEmbedded }         from '@foba/util'
import { hexToInt, rgbToHex }   from '@palett/convert'
import { DyeFab }               from '@palett/dye-factory'
import { INVERSE }              from '@palett/enum-font-effects'
import { hexToStr }             from '@palett/stringify'
import * as colors              from '@pres/util-colors'
import { decoCrostab, says }    from '@spare/logger'
import { NUM }                  from '@typen/enum-data-types'
import { strategies }           from '@valjoux/strategies'
import { byteToHex, byteToWeb } from '../../dist/index.esm'
import { hexToWeb }             from '../../src/convert/hexToWeb'
import { hexToByte }            from '../../src/hexToByte'


const { lapse, result } = strategies({
  repeat: 2E+6,
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
    black: '#000000',
    white_grey: '#eeeeee',
    white: '#ffffff'
  } |> makeEmbedded,
  methods: {
    bench: hex => { return hex },
    chjj: colors.match,
    dev(hex) {
      const n = hexToInt(hex)
      const r = Math.round(( n >> 20 & 0xf ) / 3) // get R from RrGgBb
      const g = Math.round(( n >> 12 & 0xf ) / 3) // get G from RrGgBb
      const b = Math.round(( n >> 4 & 0xf ) / 3) // get B from RrGgBb
      // console.log('dev', ( n >> 20 & 0xf ), ( n >> 12 & 0xf ), ( n >> 4 & 0xf ))
      return ( r * 36 ) + ( g * 6 + b ) + 16 //  x = g * 6 + b, y = r
    },
    vin: hexToWeb,
    fut: hexToByte,
  }
  // cla, dev, edg, rea, arc, epi
})

const _hexToStr = hexToStr.bind(DyeFab.prep(INVERSE))
lapse |> decoCrostab |> says['lapse']
result
  .map(x => typeof x === NUM
    ? x|> byteToHex |> _hexToStr
    : x |> _hexToStr
  )
  |> decoCrostab |> says['result']
