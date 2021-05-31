import { decoMatrix, logger, xr } from '@spare/logger'
import { iso }                    from '@vect/matrix'
import { SPARSE_NAMES }           from '../src/manet'
import { indexToCoord }           from './web-colors/webSafeColor.test'
import { webSafeColorHexes }      from './web-colors/webSafeColor.tables'
import { Fluo }                   from '@palett/fluo'

const matrix = iso(36, 7, null)
webSafeColorHexes |> decoMatrix |> logger
for (const [ index, value ] of Object.entries(SPARSE_NAMES)) {
  const [ x, y ] = indexToCoord(index)
  xr()[index](value).coord([ x, y ]) |> logger
  if (x >= 0 && y >= 0) {
    const hex = webSafeColorHexes[x][y]
    matrix[x][y] = hex ? Fluo.hex(value, hex) : value
  }
}

matrix |> decoMatrix |> logger