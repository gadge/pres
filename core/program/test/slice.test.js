import { slice } from '@pres/util-helpers'
import { xr }    from '@spare/logger'

const { logger } = require('@spare/logger')
const candidates = {
  undefined: undefined,
  empty: [],
  simple: [ 1, 2, 3 ],
}

for (let key in candidates) {
  try {
    xr().key(key).array(candidates[key]).sliced(slice(candidates[key])) |> logger
  } catch (e) {console.error(e)}
}