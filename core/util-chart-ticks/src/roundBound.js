import { intExpon } from '@aryth/math'

export function roundBound({ min, max }, extend = 1) {
  const minMag = ( 10 ** extend ) ** ( intExpon(min) - extend )
  const maxMag = ( 10 ** extend ) ** ( intExpon(max) - extend )
  return {
    min: Math.floor(min / minMag) * minMag,
    max: Math.ceil(max / maxMag) * maxMag,
  }
}