// Every ACS angle character can be
// represented by 4 bits ordered like this:
// [langle][uangle][rangle][dangle]
const ANGLE_TABLE = {
  '0000': '', // ?
  '0001': '\u2502', // '│' // ?
  '0010': '\u2500', // '─' // ??
  '0011': '\u250c', // '┌'
  '0100': '\u2502', // '│' // ?
  '0101': '\u2502', // '│'
  '0110': '\u2514', // '└'
  '0111': '\u251c', // '├'
  '1000': '\u2500', // '─' // ??
  '1001': '\u2510', // '┐'
  '1010': '\u2500', // '─' // ??
  '1011': '\u252c', // '┬'
  '1100': '\u2518', // '┘'
  '1101': '\u2524', // '┤'
  '1110': '\u2534', // '┴'
  '1111': '\u253c'  // '┼'
}

Object.keys(ANGLE_TABLE).forEach(key => {
  ANGLE_TABLE[parseInt(key, 2)] = ANGLE_TABLE[key]
  delete ANGLE_TABLE[key]
})

export { ANGLE_TABLE }