import { DyeFactory }                                                              from '@palett/dye'
import { HEX, RGB }                                                                from '@palett/enum-color-space'
import { BOLD }                                                                    from '@palett/enum-font-effects'
import { logger, xr }                                                              from '@spare/logger'
import { Trizipper }                                                               from '@vect/vector'
import { colors, convert, HEX_COLORS, ncolors, RGB_COLORS, SPARSE_NAMES, vcolors } from '../index'

const HexDye = DyeFactory.prep(HEX, BOLD)
const RgbDye = DyeFactory.prep(RGB, BOLD)

const zipper = Trizipper((name, rgb, hex) => {
  xr()
    .color(name.padStart(7))
    .hex(HexDye(hex)(hex))
    .rgb(RgbDye(rgb)(rgb.map(x => String(x).padStart(3))))
    .matchRGB(ncolors[convert(rgb)])
    .matchHex(ncolors[convert(hex)])
    |> logger
})

zipper(SPARSE_NAMES, RGB_COLORS, HEX_COLORS)
// zipper(ncolors, vcolors, colors)