import { COLOR_MAPPING } from '../assets/index.js'

export function reduce(color, total) {
  if (color >= 16 && total <= 16) { color = COLOR_MAPPING[color] }
  else if (color >= 8 && total <= 8) { color -= 8 }
  else if (color >= 2 && total <= 2) { color %= 2 }
  return color
}