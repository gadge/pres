import { rand }              from '@aryth/rand'
import { makeEmbedded }      from '@foba/util'
import { rgbToHex }          from '@palett/convert'
import { DyeFab }            from '@palett/dye-factory'
import { HEX }               from '@palett/enum-color-space'
import { INVERSE }           from '@palett/enum-font-effects'
import { hexToStr }          from '@palett/stringify'
import * as colors           from '@pres/util-colors'
import { decoCrostab, says } from '@spare/logger'
import { NUM }               from '@typen/enum-data-types'
import { strategies }        from '@valjoux/strategies'
import { byteToWeb }         from '../../dist/index.esm'
import { hexToByte }         from '../../src/byteToWeb'


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
  } |> makeEmbedded,
  methods: {
    bench: v => v,
    chjj: colors.match,
    vince: hexToByte,
  }
  // cla, dev, edg, rea, arc, epi
})

const _hexToStr = hexToStr.bind(DyeFab.prep(INVERSE))
lapse |> decoCrostab |> says['lapse']
result
  .map(x => typeof x === NUM
    ? x|> byteToWeb|> _hexToStr
    : x|> _hexToStr
  )
  |> decoCrostab |> says['result']
