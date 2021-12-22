import { rand }                           from '@aryth/rand'
import { makeEmbedded }                   from '@foba/util'
import { hexToInt, hexToShort, rgbToHex } from '@palett/convert'
import { decoCrostab, says }              from '@spare/logger'
import { strategies }      from '@valjoux/strategies'
import { GREY_HEXES_BYTE } from '../resources/GREY_HEXES_BYTE.js'

const BIT4_TO_GREY_SCALE = {
  0: 0,
  1: 2,
  2: 3,
  3: 5,
  4: 7,
  5: 8,
  6: 10,
  7: 11,
  8: 13,
  9: 15,
  10: 16,
  11: 18,
  12: 19,
  13: 21,
  14: 23,
}

const { lapse, result } = strategies({
  repeat: 1E+6,
  candidates: {
    rand_alpha: [ rand(255), rand(255), rand(255) ] |> rgbToHex,
    rand_beta: [ rand(255), rand(255), rand(255) ] |> rgbToHex,
    ...GREY_HEXES_BYTE,
    black: '#000000',
    white: '#ffffff',
  } |> makeEmbedded,
  methods: {
    bench: hex => { return hex },
    vin: hex => {
      const n = hexToInt(hex)
      const r = n >> 16 & 0xff, g = n >> 8 & 0xff, b = n & 0xff
      if (r !== g || g !== b) return null
      const pos = Math.round(( r - 8 ) / 10)
      return 0 <= pos && pos < 24 ? pos : null
    },
    fut: hex => {
      const s = hexToShort(hex)
      let r = s >> 8 & 0xf, g = s >> 4 & 0xf, b = s & 0xf
      if (r !== g || g !== b) return null
      const pos = BIT4_TO_GREY_SCALE[r]
      return pos < 24 ? pos : null
    },
  }
})

lapse |> decoCrostab |> says['lapse']
result |> decoCrostab |> says['result']

