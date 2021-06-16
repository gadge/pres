import { hexToInt }                           from '@palett/convert'
import { Fluo }                               from '@palett/fluo'
import { logger, xr }                         from '@spare/logger'
import { zipper }                             from '@vect/vector'
import { COLOR_HEXES_BIT4, COLOR_NAMES_BIT4 } from '../assets'

zipper(COLOR_NAMES_BIT4, COLOR_HEXES_BIT4, (key, hex) => {
  xr()
    [Fluo.hex(key, hex)](hex)
    .int(hex |> hexToInt)
    |> logger
})
