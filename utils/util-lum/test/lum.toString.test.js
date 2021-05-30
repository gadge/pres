import { deco, logger } from '@spare/logger'
import { Lum }          from '../src/lum'

const norm = [ 3, null, 238 ]
const lum = Lum.build.apply(norm)
console.log(lum, ' (internal)')
console.log('' + lum + '', ' (default)')
console.log(`${ lum }`, ' (string)')
console.log(lum.toString(), ' (toString)')
console.log(`${ ( +lum ) }`, ' (number)')
lum |> deco |> logger
lum.length |> logger

