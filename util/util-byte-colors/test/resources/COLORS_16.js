import { rgbToHex } from '@palett/convert'

export const COLORS_16 = [
  [ 0, 0, 0 ], // noir
  [ 205, 0, 0 ], // rouge
  [ 0, 205, 0 ], // vert
  [ 205, 205, 0 ], // jaune
  [ 0, 0, 238 ], // bleu
  [ 205, 0, 205 ], // magenta
  [ 0, 205, 205 ], // cyan
  [ 229, 229, 229 ], // blanc
  [ 127, 127, 127 ], // noir_brillant
  [ 255, 0, 0 ], // rouge_brillant
  [ 0, 255, 0 ], // vert_brillant
  [ 255, 255, 0 ], // jaune_brillant
  [ 92, 92, 255 ], // bleu_brillant
  [ 255, 0, 255 ], // magenta_brillant
  [ 0, 255, 255 ], // cyan_brillant
  [ 255, 255, 255 ], // blanc_brillant
].map(rgbToHex)