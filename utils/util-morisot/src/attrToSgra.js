import { concatSgr }                               from '@palett/util-ansi'
import { CSI }                                     from '@pres/enum-control-chars'
import { SGR }                                     from '@pres/enum-csi-codes'
import { byteToBackSgra, byteToForeSgra, degrade } from '@pres/util-byte-colors'
import { modeToSgra }                              from '@pres/util-sgr-mode'

// codeAttr
export function attrToSgra(attr, total) {
  const mode = attr >> 18 & 0x1ff, fore = attr >> 9 & 0x1ff, back = attr & 0x1ff
  let out = modeToSgra(mode)
  if (fore !== 0x1ff) out = concatSgr(out, byteToForeSgra(degrade(fore, total)))
  if (back !== 0x1ff) out = concatSgr(out, byteToBackSgra(degrade(back, total)))
  return CSI + out + SGR
}



