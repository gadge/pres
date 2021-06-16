import { DeepPurple, Green, Grey, Orange, Purple, Teal } from '@palett/cards'
import { BLINK, BOLD, INVERSE, UNDERLINE, HIDE }         from '@palett/enum-font-effects'
import { convColor }                                     from '@pres/util-cezanne'
import { decoCrostab, says }                             from '@spare/logger'
import { strategies }                                    from '@valjoux/strategies'
import * as colors                                       from '@pres/util-colors'
import { Lum }                                           from '../../src/lum'

const hexStr = (n, l = 6) => n.toString(16).padStart(l, '0')

const parseMode = styles => {
  let n = 0
  if (!styles) return n
  for (let s of styles)
    n |= s === BOLD ? 1 // bold
      : s === UNDERLINE ? 2 // underline
        : s === BLINK ? 4 // blink
          : s === INVERSE ? 8 // inverse
            : s === HIDE ? 16 // invisible
              : n
  return n
}
const { lapse, result } = strategies({
  repeat: 1E+6,
  candidates: {
    empty: [ null, null, null ],
    alpha: [ [ BOLD, UNDERLINE ], Green.accent_2, Orange.darken_3 ],
    beta: [ [ INVERSE ], Purple.lighten_5, DeepPurple.darken_3 ],
    gamma: [ [ BLINK, HIDE ], Teal.accent_2, Grey.darken_3 ],
    delta: [ [ BOLD, UNDERLINE, BLINK, INVERSE, HIDE ], Teal.accent_2, Grey.darken_3 ],
  },
  methods: {
    bench: (style) => parseMode(style),
    cla: (s, f, b) => ( parseMode(s) & 0x1f ) << 18 | ( colors.convert(f) & 0x1ff ) << 9 | ( colors.convert(b) & 0x1ff ),
    dev: (s, f, b) => { return new Lum(parseMode(s), convColor(f), convColor(b)) },
    arc: (s, f, b) => { return [ parseMode(s), convColor(f), convColor(b) ] },
    rea: (s, f, b) => { return hexStr(parseMode(s) ?? 0, 2) + hexStr(convColor(f) ?? 0, 6) + hexStr(convColor(b) ?? 0, 6)}
  }
  // cla, dev, edg, rea, arc, epi
})
lapse |> decoCrostab |> says['lapse']
result |> decoCrostab |> says['result']
