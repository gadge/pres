import { STR }        from '@typen/enum-data-types'
import { RGB_COLORS } from '../assets'
import { hexToRGB }   from './convert'

export const MATCH_CACHE = {}

export function match(...args) {
  const [ ini ] = args
  args = typeof ini === STR ? ( ini[0] !== '#' ? null : hexToRGB(ini) )
    : Array.isArray(ini) ? ini
      : args
  return args ? approximate(args) : -1
}

function approximate(rgb) {
  const hash = ( rgb[0] << 16 ) | ( rgb[1] << 8 ) | rgb[2]
  if (hash in MATCH_CACHE) return MATCH_CACHE[hash]
  let i = -1
  for (let j = 0, delta, epsilon = Infinity; j < RGB_COLORS.length; j++) {
    if (( delta = colorDistance(rgb, RGB_COLORS[j]) ) < epsilon) [ epsilon, i ] = [ delta, j ]
    if (epsilon === 0) break
  }
  return MATCH_CACHE[hash] = i
}

// As it happens, comparing how similar two colors are is really hard. Here is
// one of the simplest solutions, which doesn't require conversion to another
// color space, posted on stackoverflow[1]. Maybe someone better at math can
// propose a superior solution.
// [1] http://stackoverflow.com/questions/1633828
function colorDistance([ r_, g_, b_ ], [ _r, _g, _b ]) {
  return (
    ( ( 30 * ( r_ - _r ) ) ** 2 ) +
    ( ( 59 * ( g_ - _g ) ) ** 2 ) +
    ( ( 11 * ( b_ - _b ) ) ** 2 )
  )
}