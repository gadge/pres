import { makeEmbedded }      from '@foba/util'
import { CSI }               from '@pres/enum-control-chars'
import { SGR }               from '@pres/enum-csi-codes'
import * as colors           from '@pres/util-colors'
import { decoCrostab, says } from '@spare/logger'
import { strategies }        from '@valjoux/strategies'
import Screen                from '../../../../vendor/blessed-classic/lib/widgets/screen'
import { Mor }        from '../../src/Mor'
import { sgraToAttr } from '@pres/util-sgr-attr/src/sgraToAttr'

const normAttr = +Mor.init(0, 0, 0)
const { lapse, result } = strategies({
  repeat: 1E+6,
  candidates: {
    alpha: CSI + '1;38;2;125;75;25' + SGR,
    beta: CSI + '4;38;2;25;75;125' + SGR,
    gamma: CSI + '7;38;2;175;125;75' + SGR,
    delta: CSI + '1;4;5;7;38;5;82' + SGR,
  } |> makeEmbedded,
  methods: {
    // bench: v => v,
    cla: sgr => Screen.prototype.attrCode(sgr, normAttr),
    dev: sgr => colors.sgraToAttr(sgr, normAttr),
    fut: sgr => sgraToAttr(sgr, normAttr),
  }
  // cla, dev, edg, rea, arc, epi
})
lapse |> decoCrostab |> says['lapse']
result
  .map(x => '' + Mor.build(x))
  |> decoCrostab |> says['result']
