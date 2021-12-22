import { Dye }                      from '@palett/dye'
import { DyeFab }                   from '@palett/dye-factory'
import { INVERSE, UNDERLINE }       from '@palett/enum-font-effects'
import { intToStr }                 from '@palett/stringify'
import { logger, xr }               from '@spare/logger'
import { LIGHT, nameToColor, PUNC } from '../src/convert'

const candidates = {
  default: -1,   // special
  normal: -1,
  bg: -1,
  fg: -1,
  'some': -1,
  'nan': -1,
  '#000000': 0,
  '#888': 8947848,
  '#ffffff': 0xffffff,
  black: 0,   // normal
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  'light.black': 8,   // light
  'light red': 9,
  'light-green': 10,
  'light_yellow': 11,
  'lighten blue': 12,
  'lightmagenta': 13,
  'light...cyan': 14,
  'light+white': 15,
  'light_some': NaN,
  'bright.black': 8,   // bright
  'bright red': 9,
  'bright-green': 10,
  'bright_yellow': 11,
  'brighten blue': 12,
  'brightmagenta': 13,
  'bright...cyan': 14,
  'bright+white': 15,
  'bright_some': NaN,
  grey: 8,  // alternate spellings
  gray: 8,
  lightgrey: 7,
  lightgray: 7,
  brightgrey: 7,
  brightgray: 7
}

const FabInv = DyeFab.prep(INVERSE)
const FabUnd = DyeFab.prep(UNDERLINE)
for (const [ name, value ] of Object.entries(candidates)) {
  let color = nameToColor(name)
  let dye = Dye.int.call(FabInv, color)
  xr()
    [dye(name.padStart(14))](String(LIGHT.exec(name)).padStart(8))
    .match(LIGHT.test(name))
    .to(name.replace(LIGHT, '').replace(PUNC, '').padStart(7))
    .color(intToStr.call(FabUnd, color))
    .assert(value)
    |> logger
}