import { ESC } from '@pres/enum-control-chars'

export function stringify(data) {
  return caret(data
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t'))
    .replace(/[^ -~]/g, ch => {
      if (ch.charCodeAt(0) > 0xff) return ch
      ch = ch.charCodeAt(0).toString(16)
      if (ch.length > 2) {
        if (ch.length < 4) ch = '0' + ch
        return `\\u${ch}`
      }
      if (ch.length < 2) ch = '0' + ch
      return `\\x${ch}`
    })
}
export function caret(data) {
  return data.replace(/[\0\x80\x1b-\x1f\x7f\x01-\x1a]/g, ch => {
    if (ch === '\0' || ch === '\x80') { ch = '@' }
    else if (ch === ESC) { ch = '[' }
    else if (ch === '\x1c') { ch = '\\' }
    else if (ch === '\x1d') { ch = ']' }
    else if (ch === '\x1e') { ch = '^' }
    else if (ch === '\x1f') { ch = '_' }
    else if (ch === '\x7f') { ch = '?' }
    else {
      ch = ch.charCodeAt(0)
      // From ('A' - 64) to ('Z' - 64).
      if (ch >= 1 && ch <= 26) { ch = String.fromCharCode(ch + 64) }
      else { return String.fromCharCode(ch) }
    }
    return `^${ch}`
  })
}