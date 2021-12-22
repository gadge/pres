import { CSI }                            from '@pres/enum-control-chars'
import { SGR }                            from '@pres/enum-csi-codes'
import { logger, xr }                     from '@spare/logger'
import { range }                          from '@vect/vector'
import { byteToBackSgra, byteToForeSgra } from '../src/byteToSgra.js'

for (let n of range(0, 15)) {
  const fore = byteToForeSgra(n)
  const back = byteToBackSgra(n)
  xr()
    .index(n)
    [CSI + fore + SGR + 'fore' + CSI + SGR](fore)
    [CSI + back + SGR + 'back' + CSI + SGR](back) |> logger
}

for (let n = 16; n < 256; n += 8) {
  const fore = byteToForeSgra(n)
  const back = byteToBackSgra(n)
  xr()
    .index(n)
    [CSI + fore + SGR + 'fore' + CSI + SGR](fore)
    [CSI + back + SGR + 'back' + CSI + SGR](back) |> logger
}