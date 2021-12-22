import { deco, logger } from '@spare/logger'
import { Presa }        from '../src/presa.js'

const norm  = [ 3, null, 238 ]
const presa = Presa.build().assign(norm)
console.log(presa, ' (internal)')
console.log('' + presa + '', ' (default)')
console.log(`${ presa }`, ' (string)')
console.log(presa.toString(), ' (toString)')
console.log(`${ (+presa) }`, ' (number)')
presa |> deco |> logger
presa.length |> logger

