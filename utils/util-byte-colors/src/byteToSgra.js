export const validByte = (index) => index !== 0x1ff

export const byteToForeSgra = (n) => {
  if (!validByte(n)) { return '' }
  if (n < 8) return String(n + 30)
  if (n < 16) return String(n - 8 + 90)
  return '38;5;' + n
}

export const byteToBackSgra = (n) => {
  if (!validByte(n)) { return '' }
  if (n < 8) return String(n + 40)
  if (n < 16) return String(n - 8 + 100)
  return '48;5;' + n
}

