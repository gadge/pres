import { RGB_COLORS, SPARSE_NAMES } from '../assets'
import { mixColors }                from './mixColors'


export const BLEND_CACHE = {}

export function blend(attr_, _attr, alpha) {
  // extract fore_ and back_ from attr_
  let fore_ = ( attr_ >> 9 ) & 0x1ff,
      back_ = ( attr_ ) & 0x1ff

  if (_attr != null) {
    let _fore = ( _attr >> 9 ) & 0x1ff,
        _back = ( _attr ) & 0x1ff
    fore_ = fore_ === 0x1ff ? 248 : mixColors(fore_ === 0x1ff ? 7 : fore_, _fore === 0x1ff ? 7 : _fore, alpha)
    back_ = mixColors(back_ === 0x1ff ? 0 : back_, _back === 0x1ff ? 0 : _back, alpha)
  }
  else {
    fore_ = fore_ in BLEND_CACHE ? BLEND_CACHE[fore_] // if cached, get cached
      : fore_ >= 8 && fore_ < 16 ? fore_ - 8 // dimmer fore_
        : fore_ in SPARSE_NAMES ? BLEND_CACHE[fore_] = dimmer(fore_) : fore_ // find dimmer fore_ and cache
    back_ = back_ in BLEND_CACHE ? BLEND_CACHE[back_] // if cached, get cached
      : back_ >= 8 && back_ < 16 ? back_ - 8 // dimmer back_
        : back_ in SPARSE_NAMES ? BLEND_CACHE[back_] = dimmer(back_) : back_ // find dimmer back_ and cache
  }

  // paste blended fore_ and back_ to attr_
  attr_ &= ~( 0x1ff << 9 ), attr_ |= fore_ << 9
  attr_ &= ~( 0x1ff ), attr_ |= back_
  return attr_
}

export function dimmer(i) {
  // console.log('>> dimmer', index_)
  for (
    let j = 0, sparseName = SPARSE_NAMES[i], r_, g_, b_, _r, _g, _b;
    j < SPARSE_NAMES.length;
    j++
  )
    if (
      SPARSE_NAMES[j] === sparseName && // two indexes have identical sparseName
      j !== i && // different indexes
      ( [ r_, g_, b_ ] = RGB_COLORS[i] ) &&
      ( [ _r, _g, _b ] = RGB_COLORS[j] ) &&
      ( r_ + g_ + b_ > _r + _g + _b ) // find _index whose color is dimmer
    ) return j
  return i
}