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
    fore_ = fore_ in BLEND_CACHE ? BLEND_CACHE[fore_]
      : fore_ >= 8 && fore_ < 16 ? fore_ - 8
        : fore_ in SPARSE_NAMES ? dimmer(fore_) : fore_
    back_ = back_ in BLEND_CACHE ? BLEND_CACHE[back_]
      : back_ >= 8 && back_ < 16 ? back_ - 8
        : back_ in SPARSE_NAMES ? dimmer(back_) : back_
  }

  // paste blended fore_ and back_ to attr_
  attr_ &= ~( 0x1ff << 9 ), attr_ |= fore_ << 9
  attr_ &= ~( 0x1ff ), attr_ |= back_
  return attr_
}

export function dimmer(index_) {
  for (let _index = 0, sparseName_ = SPARSE_NAMES[index_]; _index < SPARSE_NAMES.length; _index++)
    if (SPARSE_NAMES[_index] === sparseName_ && _index !== index_) {
      const [ r_, g_, b_ ] = RGB_COLORS[_index],
            [ _r, _g, _b ] = RGB_COLORS[index_]
      if (r_ + g_ + b_ < _r + _g + _b) {
        index_ = BLEND_CACHE[index_] = _index
        break
      }
    }
  return index_
}