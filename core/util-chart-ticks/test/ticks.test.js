import { decoFlat, logger, xr } from '@spare/logger'
import { Ticks }                from '../src/Ticks.js'

const candidates = {
  a: [ { y: [ 0, 1 ] } ],
  b: [ { y: [ 0.05, 0.06, 0.07 ] } ],
  c: [ { y: [ 1999, 1999.1, 1999.2 ] } ],
  d: [ { y: [ 0, 256 ] } ],
  e: [ { y: [ 35482, 35490 ] } ],
  f: [ { y: [ -10, 10 ] } ]
}

for (const [ key, seriesCollection ] of Object.entries(candidates)) {
  const ticks = Ticks.build({ abbr: true, extend: 1 })
  ticks.setTicks(seriesCollection)
  const ticks2 = Ticks.build({ abbr: true })
  ticks2.setTicks(seriesCollection)
  xr(key).ticks(decoFlat(ticks.toObject())).noExtend(decoFlat(ticks2.toObject())) |> logger
}
