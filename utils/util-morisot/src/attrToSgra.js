import { concatSgr }                               from '@palett/util-ansi'
import { CSI }                                     from '@pres/enum-control-chars'
import { SGR }                                     from '@pres/enum-csi-codes'
import { byteToBackSgra, byteToForeSgra, degrade } from '@pres/util-byte-colors'
import { modeToSgra }                              from '@pres/util-sgr-mode'

// codeAttr
export function attrToSgra(attr, total) {
  const mode = attr >> 18 & 0x1ff, fore = attr >> 9 & 0x1ff, back = attr & 0x1ff
  let out = modeToSgra(mode)
  out = concatSgr(out, fore === 0x1ff ? '39' : byteToForeSgra(degrade(fore, total)))
  out = concatSgr(out, back === 0x1ff ? '49' : byteToBackSgra(degrade(back, total)))
  return CSI + out + SGR
}



