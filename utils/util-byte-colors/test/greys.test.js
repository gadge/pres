import { hexToStr }        from '@palett/stringify'
import { GREY_HEXES_BYTE } from './resources/GREY_HEXES_BYTE'

let i = 0
for (const [ value, hex ] of Object.entries(GREY_HEXES_BYTE)) {
  console.log(i++, value, hexToStr(hex))
}