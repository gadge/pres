import { SC } from '@texting/enum-chars'

export const validByte = (index) => index !== 0x1ff

export const byteToSgra = (n, isFore) => {
  if (!validByte(n)) { return '' }
  if (n < 8) return String(n + ( isFore ? 30 : 40 ))
  if (n < 16) return String(n - 8 + ( isFore ? 90 : 100 ))
  return ( isFore ? '38' : '48' ) + SC + '5' + SC + n
}

