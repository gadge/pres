import { roundD2 } from '@aryth/math'
import { SP }      from '@texting/enum-chars'

const trailZero = (num) => {
  if (!num) return '0'
  const tx = '' + roundD2(num)
  let i = tx.indexOf('.')
  if (!~i) { return tx + '.00' }
  let df = tx.length - i
  if (df === 3) { return tx }
  if (df === 2) { return tx + '0' }
  if (df === 1) { return tx + '00' }
  return tx
}

const powSI = (pow, dec) => {
  if (pow === 0) return 'B'                //
  if (pow === 1) return dec ? 'KB' : 'KiB' // Kilo
  if (pow === 2) return dec ? 'MB' : 'MiB' // Mega
  if (pow === 3) return dec ? 'GB' : 'GiB' // Giga
  if (pow === 4) return dec ? 'TB' : 'TiB' // Tera
  if (pow === 5) return dec ? 'PB' : 'PiB' // Peta
  if (pow === 6) return dec ? 'EB' : 'EiB' // Exa
  if (pow === 7) return dec ? 'ZB' : 'ZiB' // Zetta
  if (pow === 8) return dec ? 'YB' : 'YiB' // Yotta
}

export const humanScale = (num, dec) => {
  const B10 = dec ? 1000 : 1024
  let pow = 0
  while (num > B10) { num /= B10, pow++ }
  return trailZero(num) + SP + powSI(pow, dec)
}

export let queue = (arr, item) => ( arr.push(item), arr.shift() )


