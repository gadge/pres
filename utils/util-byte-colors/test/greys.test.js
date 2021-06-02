import { GREYS } from '../assets'

let i = 0
for (const [ v, h ] of Object.entries(GREYS)) {
  console.log(i++, v, h)
}