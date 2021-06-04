import { concatSgr } from '@palett/util-ansi'

export const modeToSgra = mode => {
  let out = ''
  if (mode & 1) { out = concatSgr(out, '1') } // bold
  if (mode & 2) { out = concatSgr(out, '4') } // underline
  if (mode & 4) { out = concatSgr(out, '5') } // blink
  if (mode & 8) { out = concatSgr(out, '7') } // inverse
  if (mode & 16) { out = concatSgr(out, '8') } // invisible
  return out
}