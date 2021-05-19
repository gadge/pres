import { logger, xr }               from '@spare/logger'
import { LIGHT, nameToColor, PUNC } from '../src/cezanne'


const candidates = {
  default: -1,   // special
  normal: -1,
  bg: -1,
  fg: -1,
  'some': -1,
  'nan': -1,
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


for (const [ name, value ] of Object.entries(candidates)) {
  xr()
    [name](String(LIGHT.exec(name)))
    .match(LIGHT.test(name))
    .to(name.replace(LIGHT, '').replace(PUNC, ''))
    .color(String(nameToColor(name)))
    .assert(value)
    |> logger
}