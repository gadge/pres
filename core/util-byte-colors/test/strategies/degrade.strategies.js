import { makeEmbedded }      from '@foba/util'
import * as colors           from '@pres/util-colors'
import { decoCrostab, says } from '@spare/logger'
import { strategies } from '@valjoux/strategies'
import { degrade }    from '../../src/degrade.js'

const { lapse, result } = strategies({
  repeat: 5E+6,
  candidates: {
    some: 17,
    alpha: 82,
    beta: 127,
    gamma: 232,
  } |> makeEmbedded,
  methods: {
    bench: v => v,
    cla: x => colors.reduce(x, 16),
    dev: x => degrade(x, 16),
  }
  // cla, dev, edg, rea, arc, epi
})
lapse |> decoCrostab |> says['lapse']
result |> decoCrostab |> says['result']
