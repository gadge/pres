import { concatSgr } from '@palett/util-ansi'

/**
 *
 * @param {number} mode
 * @returns {string}
 */
export const modeToSgra = mode => {
  let tx = ''
  if (mode & 1) tx = concatSgr(tx, '1') // bold
  if (mode & 2) tx = concatSgr(tx, '4') // underline
  if (mode & 4) tx = concatSgr(tx, '5') // blink
  if (mode & 8) tx = concatSgr(tx, '7') // inverse
  if (mode & 16) tx = concatSgr(tx, '8') // invisible
  return tx
}