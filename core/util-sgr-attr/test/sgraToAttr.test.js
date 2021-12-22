import { CSI, SGR }   from '@palett/enum-ansi-codes'
import { Mor }        from '@pres/util-morisot'
import { logger, xr } from '@spare/logger'
import { sgraToAttr } from '../src/sgraToAttr.js'

const candidates = [
  '[38;2;173;190;250m',
  '[38;2;116;255;3m',
  '[38;2;255;159;1m'
]

for (let sgra of candidates) {
  const mor = Mor.build(sgraToAttr(sgra))
  xr()
    .sgra(sgra + sgra.replace(//g, '^') + CSI + SGR)
    .attr('' + mor)
    |> logger
}