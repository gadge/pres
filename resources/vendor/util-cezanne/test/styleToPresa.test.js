import { intToStr }     from '@palett/stringify'
import { logger, xr }   from '@spare/logger'
import { styleToPresa } from '../src/cezanne.js'

const candidates = {
  bold: { bold: true },
  underline: { underline: true },
  blink: { blink: true },
  inverse: { inverse: true },
  invisible: { invisible: true },
  fg_blue: { fg: 'blue' },
  gb_grey: { bg: 'grey' },
  gb_bright_blue: { bg: 'bright blue' },
}

for (const [ name, style ] of Object.entries(candidates)) {
  const [ effect, fore, back ] = styleToPresa(style)
  xr()[name](style).effect(effect).fore(fore |> intToStr).back(back |> intToStr) |> logger
}