import { RGB_COLORS } from '../assets'
import { match }      from './match'

// This might work well enough for a terminal's colors: treat RGB as XYZ in a
// 3-dimensional space and go midway between the two points.
export function mixColors(colorA, colorB, alpha = 0.5) {
  if (colorA === 0x1ff) colorA = 0 // if (colorA === 0x1ff) return colorA;
  if (colorB === 0x1ff) colorB = 0 // if (colorB === 0x1ff) return colorB;
  let [ r_, g_, b_ ] = RGB_COLORS[colorA],
      [ _r, _g, _b ] = RGB_COLORS[colorB]
  r_ += ( _r - r_ ) * alpha | 0
  g_ += ( _g - g_ ) * alpha | 0
  b_ += ( _b - b_ ) * alpha | 0
  return match(r_, g_, b_)
}