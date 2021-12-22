import { dil2 }           from '@palett/convert'
import { UNDERLINE }      from '@palett/enum-font-effects'
import { logger, xr }     from '@spare/logger'
import { assignModeFrom } from '../src/assignMode.js'
import { modeToSign }     from '../src/modeToSign.js'
import { signToMode }     from '../src/signToMode.js'

// BUBIH
const candidates = [
  '-----',
  'B----',
  '-U---',
  '--B--',
  '---I-',
  '----H',
  'B-B-H',
  '-U-I-',
  'BUBIH',
]

for (let sign of candidates) {
  const mode = signToMode(sign)
  xr()
    [sign](dil2(String(mode)))
    ['BUBIH'](assignModeFrom(mode, UNDERLINE, signToMode('BUBIH')) |> modeToSign)
    ['B-BIH'](assignModeFrom(mode, UNDERLINE, signToMode('B-BIH')) |> modeToSign)
    |> logger
}

