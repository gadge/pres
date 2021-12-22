'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

/**
 * Angle Table
 */
const ANGLES = {
  '\u2518': true,
  // '┘'
  '\u2510': true,
  // '┐'
  '\u250c': true,
  // '┌'
  '\u2514': true,
  // '└'
  '\u253c': true,
  // '┼'
  '\u251c': true,
  // '├'
  '\u2524': true,
  // '┤'
  '\u2534': true,
  // '┴'
  '\u252c': true,
  // '┬'
  '\u2502': true,
  // '│'
  '\u2500': true // '─'

}
const ANGLES_L = {
  '\u250c': true,
  // '┌'
  '\u2514': true,
  // '└'
  '\u253c': true,
  // '┼'
  '\u251c': true,
  // '├'
  '\u2534': true,
  // '┴'
  '\u252c': true,
  // '┬'
  '\u2500': true // '─'

}
const ANGLES_U = {
  '\u2510': true,
  // '┐'
  '\u250c': true,
  // '┌'
  '\u253c': true,
  // '┼'
  '\u251c': true,
  // '├'
  '\u2524': true,
  // '┤'
  '\u252c': true,
  // '┬'
  '\u2502': true // '│'

}
const ANGLES_R = {
  '\u2518': true,
  // '┘'
  '\u2510': true,
  // '┐'
  '\u253c': true,
  // '┼'
  '\u2524': true,
  // '┤'
  '\u2534': true,
  // '┴'
  '\u252c': true,
  // '┬'
  '\u2500': true // '─'

}
const ANGLES_D = {
  '\u2518': true,
  // '┘'
  '\u2514': true,
  // '└'
  '\u253c': true,
  // '┼'
  '\u251c': true,
  // '├'
  '\u2524': true,
  // '┤'
  '\u2534': true,
  // '┴'
  '\u2502': true // '│'

} // var cdangles = {
//   '\u250c': true  // '┌'
// };

// Every ACS angle character can be
// represented by 4 bits ordered like this:
// [langle][uangle][rangle][dangle]
const ANGLE_TABLE = {
  '0000': '',
  // ?
  '0001': '\u2502',
  // '│' // ?
  '0010': '\u2500',
  // '─' // ??
  '0011': '\u250c',
  // '┌'
  '0100': '\u2502',
  // '│' // ?
  '0101': '\u2502',
  // '│'
  '0110': '\u2514',
  // '└'
  '0111': '\u251c',
  // '├'
  '1000': '\u2500',
  // '─' // ??
  '1001': '\u2510',
  // '┐'
  '1010': '\u2500',
  // '─' // ??
  '1011': '\u252c',
  // '┬'
  '1100': '\u2518',
  // '┘'
  '1101': '\u2524',
  // '┤'
  '1110': '\u2534',
  // '┴'
  '1111': '\u253c' // '┼'

}
Object.keys(ANGLE_TABLE).forEach(key => {
  ANGLE_TABLE[parseInt(key, 2)] = ANGLE_TABLE[key]
  delete ANGLE_TABLE[key]
})

exports.ANGLES = ANGLES
exports.ANGLES_D = ANGLES_D
exports.ANGLES_L = ANGLES_L
exports.ANGLES_R = ANGLES_R
exports.ANGLES_U = ANGLES_U
exports.ANGLE_TABLE = ANGLE_TABLE
