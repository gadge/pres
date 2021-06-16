/*
  Some patterns seen in terminal key escape codes, derived from combos seen
  at http://www.midnight-commander.org/browser/lib/tty/key.c

  ESC letter
  ESC [ letter
  ESC [ modifier letter
  ESC [ 1 ; modifier letter
  ESC [ num char
  ESC [ num ; modifier char
  ESC O letter
  ESC O modifier letter
  ESC O 1 ; modifier letter
  ESC N letter
  ESC [ [ num ; modifier char
  ESC [ [ 1 ; modifier letter
  ESC ESC [ num char
  ESC ESC O letter

  - char is usually ~ but $ and ^ also happen with rxvt
  - modifier is 1 +
                (shift     * 1) +
                (left_alt  * 2) +
                (ctrl      * 4) +
                (right_alt * 8)
  - two leading ESCs apparently mean the same as one leading ESC
*/

// Regexes used for ansi escape code splitting
export const KEYCODE_META_ANYWHERE = /\x1b([a-zA-Z0-9])/ // metaKeyCodeReAnywhere
export const KEYCODE_META = new RegExp('^' + KEYCODE_META_ANYWHERE.source + '$') // metaKeyCodeRe
export const KEYCODE_FUN_ANYWHERE = new RegExp('\x1b+(O|N|\\[|\\[\\[)(?:' + [
  '(\\d+)(?:;(\\d+))?([~^$])',
  '(?:M([@ #!a`])(.)(.))', // mouse
  '(?:1;)?(\\d+)?([a-zA-Z])'
].join('|') + ')') // functionKeyCodeReAnywhere
export const KEYCODE_FUN = new RegExp('^' + KEYCODE_FUN_ANYWHERE.source) // functionKeyCodeRe
export const ESCAPE_ANYWHERE = new RegExp([ KEYCODE_FUN_ANYWHERE.source, KEYCODE_META_ANYWHERE.source, /\x1b./.source ].join('|')) // escapeCodeReAnywhere
