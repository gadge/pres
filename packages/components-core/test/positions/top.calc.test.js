import { logger, xr }   from '@spare/logger'
import { parsePercent } from '../../utils/parsePercent'

const candidates = [
  '50%',
  '50%+3',
  '50%-3'
]

const SUP_HEIGHT = 40
for (let n of candidates) {
  xr().input(n).output(parsePercent(n, SUP_HEIGHT)) |> logger
}