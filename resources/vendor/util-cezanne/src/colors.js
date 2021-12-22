// This might work well enough for a terminal's colors: treat RGB as XYZ in a
// 3-dimensional space and go midway between the two points.

import { rgbToInt } from '@palett/convert'

export function mixColors(rgbA, rgbB, alpha = 0.5) {
  let r_ = rgbA >> 16 & 0xFF, g_ = rgbA >> 8 & 0xFF, b_ = rgbA & 0xFF
  let _r = rgbA >> 16 & 0xFF, _g = rgbA >> 8 & 0xFF, _b = rgbA & 0xFF
  r_ += (_r - r_) * alpha | 0
  g_ += (_g - g_) * alpha | 0
  b_ += (_b - b_) * alpha | 0
  return ((r_ & 0xFF) << 16) + ((g_ & 0xFF) << 8) + (b_ & 0xFF) // return [r_, g_, b_]
}


export class Blended {
  static cache = {}
}

const NAC = 1 << 24
const GREY = rgbToInt([ 127, 127, 127 ])

export function blend(x, y, alpha) {
  let name
  let [ , fore_, back_ ] = x
  let _fore, _back
  if (y) { // if right provided: mixColors
    [ , _fore, _back ] = y
    // for back
    if (back_ === NAC) back_ = 0 // if left is NAC: left is noir
    if (_back === NAC) _back = 0 // if right is NAC: right is noir
    back_ = mixColors(back_, _back, alpha) // mix

    // for fore
    if (fore_ === NAC) { fore_ = GREY } // if left is NAC: left is grey
    else {
      if (_fore === NAC) _fore = GREY // if right is NAC: right is grey
      fore_ = mixColors(fore_, _fore, alpha) // mix
    }
  }
  else { // if right not provided: use cache
    // for back
    if (Blended.cache[back_]) { back_ = Blended.cache[back_] }
    else { back_ = Blended.cache[back_] = back_ }
    // else if (back_ >= 8 && back_ <= 15) { back_ -= 8 }
    // else if ((name = SPARSE_NAMES[back_])) {
    //   for (let i = 0; i < SPARSE_NAMES.length; i++)
    //     if (name === SPARSE_NAMES[i] && i !== back_) {
    //       const [ r_, g_, b_ ] = RGB_COLORS[i], [ _r, _g, _b ] = RGB_COLORS[back_]
    //       if (r_ + g_ + b_ < _r + _g + _b) {
    //         back_ = Blended.cache[back_] = i
    //         break
    //       }
    //     }
    // }

    // for fore
    if (Blended.cache[fore_]) { fore_ = Blended.cache[fore_] } // if cached: use cached
    else { fore_ = Blended.cache[fore_] = fore_ }
    // else if (fore_ >= 8 && fore_ <= 15) { fore_ -= 8 } // if bright: use standard counterpart
    // else if ((name = SPARSE_NAMES[fore_])) {
    //   for (let i = 0; i < SPARSE_NAMES.length; i++)
    //     if (name === SPARSE_NAMES[i] && i !== fore_) {
    //       const [ r_, g_, b_ ] = RGB_COLORS[i], [ _r, _g, _b ] = RGB_COLORS[fore_]
    //       if (r_ + g_ + b_ < _r + _g + _b) {
    //         fore_ = Blended.cache[fore_] = i
    //         break
    //       }
    //     }
    // }
  }
  x[1] = fore_
  x[2] = back_
  return x
}