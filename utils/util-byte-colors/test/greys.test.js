import { hexToStr } from '@palett/stringify'
import { GREYS }    from '../assets'

let i = 0
for (const [ value, hex ] of Object.entries(GREYS)) {
  console.log(i++, value, hexToStr(hex))
}