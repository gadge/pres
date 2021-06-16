import { logger, xr }   from '@spare/logger'
import { Cadre }  from '../../utils/Cadre'
import { scaler } from '../../utils/scaler'

const candidates = [
  '50%',
  '50%+3',
  '50%-3'
]

const SUP_HEIGHT = 40
for (let n of candidates) {
  xr().input(n).output(scaler(n, SUP_HEIGHT)) |> logger
}

