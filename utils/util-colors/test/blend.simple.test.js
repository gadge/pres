import { rgbToHsl }           from '@palett/convert'
import { hslToStr, rgbToStr } from '@palett/stringify'
import { logger, xr }         from '@spare/logger'
import { range }              from '@vect/vector'
import { RGB_COLORS }         from '../dist/index.esm'
import { blend }              from '../src/colors'

function colorDistance([ r_, g_, b_ ], [ _r, _g, _b ]) { return ( ( 30 * ( r_ - _r ) ) ** 2 ) + ( ( 59 * ( g_ - _g ) ) ** 2 ) + ( ( 11 * ( b_ - _b ) ) ** 2 ) }
const toAttr = (effect, fore, back) => { return ( effect & 0xFF ) << 18 | ( fore & 0xFF ) << 9 | ( back & 0xFF ) }
const getEffect = (attr) => { return ( attr >> 18 ) & 0xFF }
const getFore = (attr) => { return ( attr >> 9 ) & 0xFF }
const getBack = (attr) => { return ( attr & 0xFF ) }

for (let origin of range(0, 15)) {
  const attr = toAttr(0, 0, origin)
  const blended = blend(attr)
  xr()
    [String(origin).padStart(3)](attr)
    .rgb(rgbToStr(RGB_COLORS[origin]))
    .hsl(hslToStr(RGB_COLORS[origin]|> rgbToHsl))
    .blend(blended)
    .rgb(rgbToStr(RGB_COLORS[blended]))
    .hsl(hslToStr(RGB_COLORS[blended]|> rgbToHsl))
    .distance(colorDistance(RGB_COLORS[origin], RGB_COLORS[blended]))
    |> logger
}