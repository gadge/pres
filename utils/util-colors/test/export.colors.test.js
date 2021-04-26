import { DyeFactory }               from '@palett/dye'
import { HEX, RGB }                 from '@palett/enum-color-space'
import { BOLD }                     from '@palett/enum-font-effects'
import { logger, xr }               from '@spare/logger'
import { Trizipper }                from '@vect/vector'
import { colors, ncolors, vcolors } from '../index'

const HexDye = DyeFactory.prep(HEX, BOLD)
const RgbDye = DyeFactory.prep(RGB, BOLD)

const zipper = Trizipper((name, rgb, hex) => {
  xr()
    .color(name.padStart(7))
    .hex(HexDye(hex)(hex))
    .rgb(RgbDye(rgb)(rgb.map(x => x.toString().padStart(3))))
    |> logger
})

zipper(ncolors, vcolors, colors)