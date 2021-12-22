import { Detic } from '../utils/Detic.js'

const detic = Detic.build({
  t: 0,
  b: 0,
  l: 0,
  r: 0
})

detic.width = 5

console.log(detic)

detic.delete('width')

console.log(detic)