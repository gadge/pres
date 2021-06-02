import { hexToInt }   from '@palett/convert'
import { logger, xr } from '@spare/logger'

export const COLORS = {

  black: '#000000', // black
  red: '#ff0000', // red
  green: '#00ff00', // green
  blue: '#0000ff', // blue
  yellow: '#ffff00', // yellow
  magenta: '#ff00ff', // magenta
  cyan: '#00ffff', // cyan
  white: '#ffffff',  // white

  black_beta: '#7f7f7f', // gray50
  red_beta: '#cd0000', // red3
  green_beta: '#00cd00', // green3
  blue_beta: '#5c5cff', // rgb:5c/5c/ff
  yellow_beta: '#cdcd00', // yellow3
  magenta_beta: '#cd00cd', // magenta3
  cyan_beta: '#00cdcd', // cyan3
  white_beta: '#e5e5e5', // gray90
}

for (const [ key, value ] of Object.entries(COLORS)) {
  xr()
    [key](value)
    .int(value |> hexToInt)
    |> logger
}
