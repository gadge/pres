import { deco, logger } from '@spare/logger'
import { Presa }        from '../src/presa'

const presa = Presa.build()
console.log(presa)
presa |> deco |> logger
presa.length |> logger

