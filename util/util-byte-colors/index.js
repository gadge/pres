export {
  WEB_SAFE_MATRIX_INDEX, WEB_SAFE_MATRIX_HEX, COLOR_HEXES_BIT4, COLOR_NAMES_BIT3, COLOR_NAMES_BIT4
}                                              from './assets'
export { byteToGrey }                          from './src/convert/byteToGrey'
export { byteToWeb, byteToCoord, coordToWeb }  from './src/convert/byteToWeb'
export { hexToWeb, hexToCoord, }               from './src/convert/hexToWeb'
export { srgbToWeb, srgbToCoord, coordToByte } from './src/convert/srgbToWeb'
export { byteToHex }                           from './src/byteToHex'
export { byteToBackSgra, byteToForeSgra }      from './src/byteToSgra'
export { degrade }                             from './src/degrade'
export { hexToByte }                           from './src/hexToByte'
export { rgbToByte }                           from './src/rgbToByte'
export { toByte }                              from './src/toByte'