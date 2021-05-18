import { DyeFactory }                                             from '@palett/dye'
import { HEX, RGB }                                               from '@palett/enum-color-space'
import { BOLD }                                                   from '@palett/enum-font-effects'
import { logger, xr }                                             from '@spare/logger'
import { Trizipper }                                              from '@vect/vector'
import { convert, HEX_COLORS, ncolors, RGB_COLORS, SPARSE_NAMES } from '../index'

const HexDye = DyeFactory.prep(HEX, BOLD)
const RgbDye = DyeFactory.prep(RGB, BOLD)

const zipper = Trizipper((name, rgb, hex) => {
  const _convRgb = String(convert(rgb))
  const _convHex = String(convert(hex))
  xr()
    .color(name.padStart(7))
    .rgb(RgbDye(rgb)(rgb.map(x => String(x).padStart(3))))
    .hex(HexDye(hex)(hex))
    [_convRgb.padStart(3)](ncolors[_convRgb].padStart(7))
    [_convHex.padStart(3)](ncolors[_convHex].padStart(7))
    |> logger
})

zipper(SPARSE_NAMES, RGB_COLORS, HEX_COLORS)
// zipper(ncolors, vcolors, colors)