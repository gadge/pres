import { rand }               from '@aryth/rand'
import { hexToStr, rgbToStr } from '@palett/stringify'
import { logger, xr }         from '@spare/logger'
import { rgbToByte }          from '../dist/index.esm'
import { byteToWeb }          from '../src/convert/byteToWeb'

for (let i = 0; i < 32; i++) {
  const rgb = [ rand(255), rand(255), rand(255) ]
  const byte = rgbToByte(rgb[0], rgb[1], rgb[2])
  xr().rgb(rgb |> rgbToStr).byte(byte).quasiAssert(byteToWeb(byte)|> hexToStr) |> logger
}

const candidates = [
  [ 25, 45, 129 ],
  [ 129, 45, 25 ],
  [ 25, 75, 175 ],
  [ 175, 75, 25 ]
]

for (let rgb of candidates) {
  const byte = rgbToByte(rgb[0], rgb[1], rgb[2])
  xr().rgb(rgb |> rgbToStr).byte(byte).quasiAssert(byteToWeb(byte)|> hexToStr) |> logger
}