import { decoMatrix, logger, xr } from '@spare/logger'
import { iso }                    from '@vect/matrix'
import { SPARSE_NAMES }           from '../assets'
import { indexToCoord }           from './web-colors/webSafeColor.test'
import { WEB_SAFE_COLOR_HEXES }   from './web-colors/webSafeColor.tables'
import { Fluo }                   from '@palett/fluo'

const matrix = iso(36, 7, null)
WEB_SAFE_COLOR_HEXES |> decoMatrix |> logger
for (const [ index, value ] of Object.entries(SPARSE_NAMES)) {
  const [ x, y ] = indexToCoord(index)
  xr()[index](value).coord([ x, y ]) |> logger
  if (x >= 0 && y >= 0) {
    const hex = WEB_SAFE_COLOR_HEXES[x][y]
    matrix[x][y] = hex ? Fluo.hex(value + '.' + index, hex) : value
  }
}

matrix |> decoMatrix |> logger