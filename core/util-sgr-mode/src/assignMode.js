import { BLINK, BOLD, HIDE, INVERSE, INVISIBLE, UNDERLINE } from '@palett/enum-font-effects'

/**
 *
 * @param {number} mode
 * @param {string} scope
 * @param {any} value
 * @returns {number}
 */
export function assignMode(mode, scope, value) {
  if (scope === BOLD) return value ? ( mode | 1 ) : ( mode & ~1 ) // bold
  if (scope === UNDERLINE) return value ? ( mode | 2 ) : ( mode & ~2 ) // underline
  if (scope === BLINK) return value ? ( mode | 4 ) : ( mode & ~4 ) // blink
  if (scope === INVERSE) return value ? ( mode | 8 ) : ( mode & ~8 ) // inverse
  if (scope === INVISIBLE || scope === HIDE) return value ? ( mode | 16 ) : ( mode & ~16 ) // hide, invisible
  return mode
}

/**
 *
 * @param {number} mode
 * @param {string} scope
 * @param {(number|boolean)?} base
 * @returns {number}
 */
export function assignModeFrom(mode, scope, base) {
  if (scope === BOLD) return ( mode & ~1 ) | ( base & 1 ) // bold
  if (scope === UNDERLINE) return ( mode & ~2 ) | ( base & 2 ) // underline
  if (scope === BLINK) return ( mode & ~4 ) | ( base & 4 ) // blink
  if (scope === INVERSE) return ( mode & ~8 ) | ( base & 8 ) // inverse
  if (scope === INVISIBLE || scope === HIDE) return ( mode & ~16 ) | ( base & 16 ) // hide, invisible
  return mode
}