import { makeEmbedded }            from '@foba/util'
import { decoCrostab, says }       from '@spare/logger'
import { strategies }              from '@valjoux/strategies'
import { coordToWeb, byteToCoord } from '../../src/convert/byteToWeb'

const { lapse, result } = strategies({
  repeat: 1E+6,
  candidates: {
    empty: 16,
    alpha: 45,
    beta: 82,
    gamma: 177,
    delta: 231
  } |> makeEmbedded,
  methods: {
    bench: v => v,
    cla: (i) => coordToWeb.apply(null, byteToCoord(i)),
    dev: (i) => {
      i -= 16
      const x = i % 36, y = ~~( i / 36 )
      const r = y * 3, g = ( ~~( x / 6 ) ) * 3, b = ( x % 6 ) * 3
      return '#' + r.toString(16) + g.toString(16) + b.toString(16)
    },
    edg(i) {
      function dil3(hex) {
        const hi = hex.length
        if (hi >= 3) return hex
        if (hi === 2) return '0' + hex
        if (hi === 1) return '00' + hex
        return '000'
      }
      i -= 16
      const x = i % 36, y = ~~( i / 36 )
      const r = y, g = ~~( x / 6 ), b = x % 6
      return '#' + dil3(( ( r << 8 | g << 4 | b ) * 3 ).toString(16))
    },
    fut: (i) => {
      i -= 16
      const x = i % 36
      const r = ( ~~( i / 36 ) ) * 3, g = ( ~~( x / 6 ) ) * 3, b = ( x % 6 ) * 3
      return '#' + r.toString(16) + g.toString(16) + b.toString(16)
    },
  }
  // cla, dev, edg, rea, arc, epi
})
lapse |> decoCrostab |> says['lapse']
result |> decoCrostab |> says['result']
