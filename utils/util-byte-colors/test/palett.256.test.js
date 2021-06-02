import { Fluo }               from '@palett/fluo'
import { SPARSE_NAMES }       from '@pres/util-colors'
import { decoMatrix, logger } from '@spare/logger'
import { iso }          from '@vect/matrix'
import { indexToHex }   from '../src/indexToHex'
import { indexToCoord } from '../src/indexToWebSafe'

const NAME_MAPPING = {
  black: ' noir',
  red: 'rouge',
  green: ' vert',
  yellow: 'jaune',
  blue: ' bleu',
  magenta: 'magen',
  cyan: ' cyan',
  white: 'blanc',
}

const matrix = iso(36, 7, null)

for (const [ index, value ] of Object.entries(SPARSE_NAMES)) {
  const [ x, y ] = indexToCoord(index)
  if (0 <= x && 0 <= y) {
    const hex = indexToHex(index)
    matrix[x][y] = hex ? Fluo.hex(NAME_MAPPING[value] + '.' + index, hex) : value
  }
}

matrix |> decoMatrix |> logger
