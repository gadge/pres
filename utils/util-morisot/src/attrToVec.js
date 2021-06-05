export function attrToVec(code) {
  const m = code >> 18 & 0x1ff,
        f = code >> 9 & 0x1ff,
        b = code & 0x1ff
  return [ m, f, b ]
}