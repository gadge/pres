import { deco, decoCrostab, logger, says } from '@spare/logger'
import { strategies }                      from '@valjoux/strategies'
import { mem }                             from 'systeminformation'
import { humanScale }                      from '../util'

function humanFileSize(bytes, isDecimal) {
  isDecimal = typeof isDecimal === 'undefined' ? false : isDecimal
  if (!bytes) return '0.00 B'
  const base = isDecimal ? 1000 : 1024
  const e = ~~( Math.log(bytes) / Math.log(base) )
  return (
    ( bytes / Math.pow(base, e) ).toFixed(2) +
    ' ' +
    ' KMGTP'.charAt(e) +
    ( isDecimal || e == 0 ? '' : 'i' ) +
    'B'
  )
}

const test = async function () {
  const stats = await mem()
  stats |> deco |> logger
  const a = 1 << 10
}

const { lapse, result } = strategies({
  repeat: 1E+6,
  candidates: {
    zero: [ 0 ],
    small: [ 256 ],
    total: [ 33657606144, ],
    free: [ 8478560256, ],
    used: [ 25179045888, ],
  },
  methods: {
    bench: v => v,
    cla: humanFileSize,
    dev: humanScale,
  }
  // cla, dev, edg, rea, arc, epi
})
lapse |> decoCrostab |> says['lapse']
result |> decoCrostab |> says['result']


test()