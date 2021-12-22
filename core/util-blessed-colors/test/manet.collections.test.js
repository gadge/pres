import { DyeFab }                                        from '@palett/dye'
import { INVERSE, UNDERLINE }                            from '@palett/enum-font-effects'
import { hexToStr, rgbToStr }                            from '@palett/stringify'
import { logger, xr }                                    from '@spare/logger'
import { Trizipper }                                     from '@vect/vector'
import { convert, HEX_COLORS, RGB_COLORS, SPARSE_NAMES } from '../index.js'

const und = DyeFab.prep(UNDERLINE)
const inv = DyeFab.prep(INVERSE)

const zipper = Trizipper((name, rgb, hex, i) => {
  const rgbConverted = String(convert(rgb))
  const hexConverted = String(convert(hex))
  xr()
    [String(i).padStart(3)](name.padStart(7))
    .rgb(rgbToStr.call(und, rgb))
    .hex(hexToStr.call(inv, hex))
    [rgbConverted.padStart(3)](SPARSE_NAMES[rgbConverted].padStart(7))
    [hexConverted.padStart(3)](SPARSE_NAMES[hexConverted].padStart(7))
    |> logger
})

zipper(SPARSE_NAMES, RGB_COLORS, HEX_COLORS)
// zipper(SPARSE_NAMES, vcolors, colors)