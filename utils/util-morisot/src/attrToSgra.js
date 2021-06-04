import { concatSgr }                               from '@palett/util-ansi'
import { CSI }                                     from '@pres/enum-control-chars'
import { SGR }                                     from '@pres/enum-csi-codes'
import { byteToBackSgra, byteToForeSgra, degrade } from '@pres/util-byte-colors'
import { modeToSgra }                              from './mode/modeToSgra'

export function attrToSgra(attr, total) {
  const mode = attr >> 18 & 0x1ff, fore = attr >> 9 & 0x1ff, back = attr & 0x1ff
  let out = modeToSgra(mode)
  out = concatSgr(out, byteToForeSgra(fore !== 0x1ff ? degrade(fore, total) : fore))
  out = concatSgr(out, byteToBackSgra(back !== 0x1ff ? degrade(back, total) : back))
  return CSI + out + SGR
}



