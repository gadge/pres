import { makeEmbedded }                                from '@foba/util'
import { Amber, Cyan, LightGreen, Lime, Purple, Teal } from '@palett/cards'
import { concatSgr, hexToBackSgra, hexToForeSgra }     from '@palett/util-ansi'
import { CSI }                                         from '@pres/enum-control-chars'
import { SGR }                                         from '@pres/enum-csi-codes'
import { sattr }                                       from '@pres/util-colors'
import { styleToAttr }                                 from '@pres/util-sgr-attr/src/styleToAttr'
import { modeToSgra, styleToMode }                     from '@pres/util-sgr-mode'
import { decoCrostab, says }                           from '@spare/logger'
import { NUM }                                         from '@typen/enum-data-types'
import { strategies }                                  from '@valjoux/strategies'
import { Mor }                                         from '../../src/Mor'

const { lapse, result } = strategies({
  repeat: 1, // 1E+6,
  candidates: {
    alpha: { bold: true, fg: Amber.base, bg: Purple.lighten_2 },
    beta: { underline: true, fg: Cyan.lighten_2, bg: LightGreen.darken_3 },
    gamma: { inverse: true, fg: Amber.base, bg: Purple.lighten_2 },
    delta: { bold: true, underline: true, fg: Lime.accent_3, bg: '' },
    epsilon: { bold: true, underline: true, fg: '', bg: Teal.darken_2 },
  }|> makeEmbedded,
  methods: {
    bench: (o) => {
      let sgra = o |> styleToMode |> modeToSgra
      sgra = concatSgr(sgra, o.fg |> hexToForeSgra)
      sgra = concatSgr(sgra, o.bg |> hexToBackSgra)
      // console.log(o |> styleToMode |> modeToSgra, o.fg |> hexToForeSgra, o.bg |> hexToBackSgra)
      console.log(sgra)
      return CSI + sgra + SGR + 'some' + CSI + SGR
    },
    cla: sattr,
    dev: styleToAttr,
  }
  // cla, dev, edg, rea, arc, epi
})
lapse |> decoCrostab |> says['lapse']
result
  .map(attr => typeof attr === NUM ? '' + Mor.build(attr) : attr)
  |> decoCrostab |> says['result']
