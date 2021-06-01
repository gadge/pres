import { STR }        from '@typen/enum-data-types'
import { RGB_COLORS } from '../assets'
import { hexToRGB }   from './convert'

export const MATCH_CACHE = {}

export function match(...args) {
  const ini = args[0]
  let [ r_, g_, b_ ] = typeof ini === STR ? ( ini[0] !== '#' ? [] : hexToRGB(ini) )
    : Array.isArray(ini) ? ini
      : args
  if (r_ == null) return -1
  const hash = ( r_ << 16 ) | ( g_ << 8 ) | b_
  if (MATCH_CACHE[hash]) return MATCH_CACHE[hash]
  let index_ = -1
  for (let _index = 0, diff_ = Infinity; _index < RGB_COLORS.length; _index++) {
    const [ _r, _g, _b ] = RGB_COLORS[_index],
          _diff          = colorDistance(r_, g_, b_, _r, _g, _b)
    if (_diff === 0) return MATCH_CACHE[hash] = _index
    if (diff_ > _diff) { ( diff_ = _diff ), ( index_ = _index ) }
  }
  return MATCH_CACHE[hash] = index_
}

// As it happens, comparing how similar two colors are is really hard. Here is
// one of the simplest solutions, which doesn't require conversion to another
// color space, posted on stackoverflow[1]. Maybe someone better at math can
// propose a superior solution.
// [1] http://stackoverflow.com/questions/1633828
function colorDistance(r_, g_, b_, _r, _g, _b) {
  return ( ( 30 * ( r_ - _r ) ) ** 2 ) + ( ( 59 * ( g_ - _g ) ) ** 2 ) + ( ( 11 * ( b_ - _b ) ) ** 2 )
}