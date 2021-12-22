/**
 * keys.js - emit key presses
 * Copyright (c) 2010-2015, Joyent, Inc. and other contributors (MIT License)
 * https://github.com/chjj/blessed
 */
import { DATA, KEYPRESS, NEW_LISTENER }               from '@pres/enum-events'
import {
  BACKSPACE, CLEAR, DELETE, DOWN, END, ENTER, ESCAPE, HOME, INSERT, LEFT, PAGEDOWN, PAGEUP, RETURN, RIGHT, SPACE, TAB, UNDEFINED, UP
}                                                     from '@pres/enum-key-names'
import { acquire }                                    from '@vect/vector-merge'
import { EventEmitter }                               from 'events'
import { StringDecoder }                              from 'string_decoder'
import { ESCAPE_ANYWHERE, KEYCODE_FUN, KEYCODE_META } from '../assets/regex' // lazy load

// NOTE: node <=v0.8.x has no EventEmitter.listenerCount

function listenerCount(stream, event) {
  return EventEmitter.listenerCount
    ? EventEmitter.listenerCount(stream, event)
    : stream.listeners(event).length
}
/**
 * accepts a readable Stream instance and makes it emit "keypress" events
 */

function emitKeys(stream, s) {
  if (Buffer.isBuffer(s)) {
    if (s[0] > 127 && s[1] === undefined) {
      s[0] -= 128
      s = '\x1b' + s.toString(stream.encoding || 'utf-8')
    }
    else {
      s = s.toString(stream.encoding || 'utf-8')
    }
  }
  if (isMouse(s)) return
  let buffer = []
  let match
  while (( match = ESCAPE_ANYWHERE.exec(s) )) {
    acquire(buffer, s.slice(0, match.index).split(''))
    // buffer = buffer.concat(s.slice(0, match.index).split(''))
    buffer.push(match[0])
    s = s.slice(match.index + match[0].length)
  }
  acquire(buffer, s.split(''))
  // buffer = buffer.concat(s.split(''))
  buffer.forEach(s => {
    let ch,
        key = { sequence: s, name: undefined, ctrl: false, meta: false, shift: false },
        parts
    // carriage return
    if (s === '\r') { key.name = RETURN }
    else if (s === '\n') { key.name = ENTER } // enter, should have been called linefeed // linefeed // key.name = 'linefeed';
    else if (s === '\t') { key.name = TAB }
    else if (s === '\b' || s === '\x7f' || s === '\x1b\x7f' || s === '\x1b\b') { key.name = BACKSPACE, key.meta = ( s.charAt(0) === '\x1b' ) } // backspace or ctrl+h
    else if (s === '\x1b' || s === '\x1b\x1b') { key.name = ESCAPE, key.meta = ( s.length === 2 ) } // escape key
    else if (s === ' ' || s === '\x1b ') { key.name = SPACE, key.meta = ( s.length === 2 ) }
    else if (s.length === 1 && s <= '\x1a') { key.name = String.fromCharCode(s.charCodeAt(0) + 'a'.charCodeAt(0) - 1), key.ctrl = true } // ctrl+letter
    else if (s.length === 1 && s >= 'a' && s <= 'z') { key.name = s } // lowercase letter
    else if (s.length === 1 && s >= 'A' && s <= 'Z') { key.name = s.toLowerCase(), key.shift = true } // shift+letter
    else if (( parts = KEYCODE_META.exec(s) )) { key.name = parts[1].toLowerCase(), key.meta = true, key.shift = /^[A-Z]$/.test(parts[1]) } // meta+character key
    else if (( parts = KEYCODE_FUN.exec(s) )) {
      // ansi escape sequence
      // reassemble the key code leaving out leading \x1b's,
      // the modifier key bitflag and any meaningless "1;" sequence
      const code     = ( parts[1] || '' ) + ( parts[2] || '' ) + ( parts[4] || '' ) + ( parts[9] || '' ),
            modifier = ( parts[3] || parts[8] || 1 ) - 1
      // Parse the key modifier
      key.ctrl = !!( modifier & 4 )
      key.meta = !!( modifier & 10 )
      key.shift = !!( modifier & 1 )
      key.code = code
      // Parse the key itself
      switch (code) {
        /* xterm ESC [ letter */
        case '[A':
          key.name = UP
          break
        case '[B':
          key.name = DOWN
          break
        case '[C':
          key.name = RIGHT
          break
        case '[D':
          key.name = LEFT
          break
        case '[E':
          key.name = CLEAR
          break
        case '[F':
          key.name = END
          break
        case '[H':
          key.name = HOME
          break

        /* xterm/gnome ESC O letter */
        case 'OA':
          key.name = UP
          break
        case 'OB':
          key.name = DOWN
          break
        case 'OC':
          key.name = RIGHT
          break
        case 'OD':
          key.name = LEFT
          break
        case 'OE':
          key.name = CLEAR
          break
        case 'OF':
          key.name = END
          break
        case 'OH':
          key.name = HOME
          break

        /* xterm/rxvt ESC [ number ~ */
        case '[1~':
          key.name = HOME
          break
        case '[2~':
          key.name = INSERT
          break
        case '[3~':
          key.name = DELETE
          break
        case '[4~':
          key.name = END
          break
        case '[5~':
          key.name = PAGEUP
          break
        case '[6~':
          key.name = PAGEDOWN
          break

        /* putty */
        case '[[5~':
          key.name = PAGEUP
          break
        case '[[6~':
          key.name = PAGEDOWN
          break

        /* rxvt */
        case '[7~':
          key.name = HOME
          break
        case '[8~':
          key.name = END
          break

        /* rxvt keys with modifiers */
        case '[a':
          key.name = UP
          key.shift = true
          break
        case '[b':
          key.name = DOWN
          key.shift = true
          break
        case '[c':
          key.name = RIGHT
          key.shift = true
          break
        case '[d':
          key.name = LEFT
          key.shift = true
          break
        case '[e':
          key.name = CLEAR
          key.shift = true
          break

        case '[2$':
          key.name = INSERT
          key.shift = true
          break
        case '[3$':
          key.name = DELETE
          key.shift = true
          break
        case '[5$':
          key.name = PAGEUP
          key.shift = true
          break
        case '[6$':
          key.name = PAGEDOWN
          key.shift = true
          break
        case '[7$':
          key.name = HOME
          key.shift = true
          break
        case '[8$':
          key.name = END
          key.shift = true
          break

        case 'Oa':
          key.name = UP
          key.ctrl = true
          break
        case 'Ob':
          key.name = DOWN
          key.ctrl = true
          break
        case 'Oc':
          key.name = RIGHT
          key.ctrl = true
          break
        case 'Od':
          key.name = LEFT
          key.ctrl = true
          break
        case 'Oe':
          key.name = CLEAR
          key.ctrl = true
          break

        case '[2^':
          key.name = INSERT
          key.ctrl = true
          break
        case '[3^':
          key.name = DELETE
          key.ctrl = true
          break
        case '[5^':
          key.name = PAGEUP
          key.ctrl = true
          break
        case '[6^':
          key.name = PAGEDOWN
          key.ctrl = true
          break
        case '[7^':
          key.name = HOME
          key.ctrl = true
          break
        case '[8^':
          key.name = END
          key.ctrl = true
          break

        /* xterm/gnome ESC O letter */
        case 'OP':
          key.name = 'f1'
          break
        case 'OQ':
          key.name = 'f2'
          break
        case 'OR':
          key.name = 'f3'
          break
        case 'OS':
          key.name = 'f4'
          break

        /* xterm/rxvt ESC [ number ~ */
        case '[11~':
          key.name = 'f1'
          break
        case '[12~':
          key.name = 'f2'
          break
        case '[13~':
          key.name = 'f3'
          break
        case '[14~':
          key.name = 'f4'
          break

        /* from Cygwin and used in libuv */
        case '[[A':
          key.name = 'f1'
          break
        case '[[B':
          key.name = 'f2'
          break
        case '[[C':
          key.name = 'f3'
          break
        case '[[D':
          key.name = 'f4'
          break
        case '[[E':
          key.name = 'f5'
          break

        /* common */
        case '[15~':
          key.name = 'f5'
          break
        case '[17~':
          key.name = 'f6'
          break
        case '[18~':
          key.name = 'f7'
          break
        case '[19~':
          key.name = 'f8'
          break
        case '[20~':
          key.name = 'f9'
          break
        case '[21~':
          key.name = 'f10'
          break
        case '[23~':
          key.name = 'f11'
          break
        case '[24~':
          key.name = 'f12'
          break

        /* misc. */
        case '[Z':
          key.name = TAB
          key.shift = true
          break
        default:
          key.name = UNDEFINED
          break
      }
    }
    // Don't emit a key if no name was found
    if (key.name === undefined) key = undefined
    if (s.length === 1) ch = s
    if (key || ch) stream.emit(KEYPRESS, ch, key)
  })
}
function isMouse(s) {
  return /\x1b\[M/.test(s) ||
    /\x1b\[M([\x00\u0020-\uffff]{3})/.test(s) ||
    /\x1b\[(\d+;\d+;\d+)M/.test(s) ||
    /\x1b\[<(\d+;\d+;\d+)([mM])/.test(s) ||
    /\x1b\[<(\d+;\d+;\d+;\d+)&w/.test(s) ||
    /\x1b\[24([0135])~\[(\d+),(\d+)\]\r/.test(s) ||
    /\x1b\[(O|I)/.test(s)
}

export function keypressEventsEmitter(stream) {
  if (stream._keypressDecoder) return
  stream._keypressDecoder = new StringDecoder('utf8')
  function onData(b) {
    if (listenerCount(stream, KEYPRESS) > 0) {
      const r = stream._keypressDecoder.write(b)
      if (r) emitKeys(stream, r)
    }
    else {
      // Nobody's watching anyway
      stream.removeListener(DATA, onData), stream.on(NEW_LISTENER, onNewListener)
    }
  }
  function onNewListener(event) {
    if (event === KEYPRESS) { stream.on(DATA, onData), stream.removeListener(NEW_LISTENER, onNewListener) }
  }
  listenerCount(stream, KEYPRESS) > 0 ? stream.on(DATA, onData) : stream.on(NEW_LISTENER, onNewListener)
}
