const BIT4_TO_GREY_SCALE = {
  0: 0,
  1: 2,
  2: 3,
  3: 5,
  4: 7,
  5: 8,
  6: 10,
  7: 11,
  8: 13,
  9: 15,
  10: 16,
  11: 18,
  12: 19,
  13: 21,
  14: 23,
}

export const srgbToGrey = (r, g, b) => {
  if (r !== g || g !== b) return null
  const pos = BIT4_TO_GREY_SCALE[r]
  return pos < 24 ? pos : null
}