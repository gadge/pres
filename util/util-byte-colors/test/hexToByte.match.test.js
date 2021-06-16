import { rand }               from '@aryth/rand'
import { rgbToHex }           from '@palett/convert'
import { hexToStr, rgbToStr } from '@palett/stringify'
import { logger, xr }         from '@spare/logger'
import { hexToByte }          from '../src/hexToByte'
import { byteToWeb }          from '../src/convert/byteToWeb'

for (let i = 0; i < 32; i++) {
  const rgb = [ rand(255), rand(255), rand(255) ]
  const hex = rgb|> rgbToHex
  const byte = hexToByte(hex)
  xr().rgb(rgb |> rgbToStr).hex(hex |> hexToStr).byte(byte).quasiAssert(byteToWeb(byte)|> hexToStr) |> logger
}

const candidates = [
  [ 25, 45, 129 ],
  [ 129, 45, 25 ],
  [ 25, 75, 175 ],
  [ 175, 75, 25 ]
]

for (let rgb of candidates) {
  const hex = rgb|> rgbToHex
  const byte = hexToByte(hex)
  xr().rgb(rgb |> rgbToStr).hex(hex |> hexToStr).byte(byte).quasiAssert(byteToWeb(byte)|> hexToStr) |> logger
}