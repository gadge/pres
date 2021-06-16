import { logger, Xr } from '@spare/logger'

const list = [
  'up',
  'down',
  'right',
  'left',
  'clear',
  'end',
  'home',
  'insert',
  'delete',
  'pageup',
  'pagedown',
  'tab',
  'undefined',

]

for (let key of [ ...new Set(list) ]) {
  Xr()[key](key.toUpperCase()) |> logger
}