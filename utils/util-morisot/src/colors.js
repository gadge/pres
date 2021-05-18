import { mixColors }                from '@pres/util-cezanne/src/colors'
import { RGB_COLORS, SPARSE_NAMES } from '@pres/util-colors/src/manet'

const NAC = 0x1ff
export function blend(mori_, _mori, alpha) {
  let name
  let back_ = mori_ & NAC
  if (_mori != null) { // if right provided: mixColors
    let _back = _mori & NAC
    if (back_ === NAC) back_ = 0 // if left is NAC: left is noir
    if (_back === NAC) _back = 0 // if right is NAC: right is noir
    back_ = mixColors(back_, _back, alpha) // mix
  }
  else { // if right not provided: use cache
    if (blend._cache[back_]) { back_ = blend._cache[back_] }
    else if (back_ >= 8 && back_ <= 15) { back_ -= 8 }
    else if ((name = SPARSE_NAMES[back_])) {
      for (let i = 0; i < SPARSE_NAMES.length; i++)
        if (name === SPARSE_NAMES[i] && i !== back_) {
          const [ r_, g_, b_ ] = RGB_COLORS[i], [ _r, _g, _b ] = RGB_COLORS[back_]
          if (r_ + g_ + b_ < _r + _g + _b) {
            back_ = blend._cache[back_] = i
            break
          }
        }
    }
  }
  mori_ &= ~NAC // simply adjust mori_ value
  mori_ |= back_ // assign new backColor to mori_
  let fore_ = (mori_ >> 9) & NAC
  if (_mori != null) {
    let _fore = (_mori >> 9) & NAC // 0, 7, 188, 231, 251
    if (fore_ === NAC) { fore_ = 248 } // if left is NAC: left is grey
    else {
      if (fore_ === NAC) fore_ = 7 // if left is NAC: left is grey
      if (_fore === NAC) _fore = 7 // if right is NAC: right is grey
      fore_ = mixColors(fore_, _fore, alpha) // mix
    }
  } // if right not provided: use cache
  else if (blend._cache[fore_] != null) { fore_ = blend._cache[fore_] } // if cached: use cached
  else if (fore_ >= 8 && fore_ <= 15) { fore_ -= 8 } // if bright: use standard counterpart
  else if ((name = SPARSE_NAMES[fore_])) {
    for (let i = 0; i < SPARSE_NAMES.length; i++)
      if (name === SPARSE_NAMES[i] && i !== fore_) {
        const [ r_, g_, b_ ] = RGB_COLORS[i], [ _r, _g, _b ] = RGB_COLORS[fore_]
        if (r_ + g_ + b_ < _r + _g + _b) {
          fore_ = blend._cache[fore_] = i
          break
        }
      }
  }
  mori_ &= ~(NAC << 9) // simply adjust mori_ value
  mori_ |= fore_ << 9 // assign new foreColor to mori_
  return mori_
}