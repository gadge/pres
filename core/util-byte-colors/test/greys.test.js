import { hexToRgb }           from '@palett/convert'
import { hexToStr, rgbToStr } from '@palett/stringify'
import { hexToGrey }          from '../src/convert/hexToGrey.js'
import { GREY_HEXES_BYTE }    from './resources/GREY_HEXES_BYTE.js'

let i = 0
for (const [ value, hex ] of Object.entries(GREY_HEXES_BYTE)) {
  console.log(i++, value, hexToStr(hex), rgbToStr(hex|> hexToRgb), hexToGrey(hex))
}