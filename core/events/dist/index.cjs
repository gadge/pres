'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var enumEvents = require('@pres/enum-events');
var enumKeyNames = require('@pres/enum-key-names');
var vectorMerge = require('@vect/vector-merge');
var events = require('events');
var string_decoder = require('string_decoder');
var utilHelpers = require('@pres/util-helpers');
var enumDataTypes = require('@typen/enum-data-types');

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
const KEYCODE_META_ANYWHERE = /\x1b([a-zA-Z0-9])/; // metaKeyCodeReAnywhere

const KEYCODE_META = new RegExp('^' + KEYCODE_META_ANYWHERE.source + '$'); // metaKeyCodeRe

const KEYCODE_FUN_ANYWHERE = new RegExp('\x1b+(O|N|\\[|\\[\\[)(?:' + ['(\\d+)(?:;(\\d+))?([~^$])', '(?:M([@ #!a`])(.)(.))', // mouse
'(?:1;)?(\\d+)?([a-zA-Z])'].join('|') + ')'); // functionKeyCodeReAnywhere

const KEYCODE_FUN = new RegExp('^' + KEYCODE_FUN_ANYWHERE.source); // functionKeyCodeRe

const ESCAPE_ANYWHERE = new RegExp([KEYCODE_FUN_ANYWHERE.source, KEYCODE_META_ANYWHERE.source, /\x1b./.source].join('|')); // escapeCodeReAnywhere

/**
 * keys.js - emit key presses
 * Copyright (c) 2010-2015, Joyent, Inc. and other contributors (MIT License)
 * https://github.com/chjj/blessed
 */
// NOTE: node <=v0.8.x has no EventEmitter.listenerCount

function listenerCount(stream, event) {
  return events.EventEmitter.listenerCount ? events.EventEmitter.listenerCount(stream, event) : stream.listeners(event).length;
}
/**
 * accepts a readable Stream instance and makes it emit "keypress" events
 */


function emitKeys(stream, s) {
  if (Buffer.isBuffer(s)) {
    if (s[0] > 127 && s[1] === undefined) {
      s[0] -= 128;
      s = '\x1b' + s.toString(stream.encoding || 'utf-8');
    } else {
      s = s.toString(stream.encoding || 'utf-8');
    }
  }

  if (isMouse(s)) return;
  let buffer = [];
  let match;

  while (match = ESCAPE_ANYWHERE.exec(s)) {
    vectorMerge.acquire(buffer, s.slice(0, match.index).split('')); // buffer = buffer.concat(s.slice(0, match.index).split(''))

    buffer.push(match[0]);
    s = s.slice(match.index + match[0].length);
  }

  vectorMerge.acquire(buffer, s.split('')); // buffer = buffer.concat(s.split(''))

  buffer.forEach(s => {
    let ch,
        key = {
      sequence: s,
      name: undefined,
      ctrl: false,
      meta: false,
      shift: false
    },
        parts; // carriage return

    if (s === '\r') {
      key.name = enumKeyNames.RETURN;
    } else if (s === '\n') {
      key.name = enumKeyNames.ENTER;
    } // enter, should have been called linefeed // linefeed // key.name = 'linefeed';
    else if (s === '\t') {
      key.name = enumKeyNames.TAB;
    } else if (s === '\b' || s === '\x7f' || s === '\x1b\x7f' || s === '\x1b\b') {
      key.name = enumKeyNames.BACKSPACE, key.meta = s.charAt(0) === '\x1b';
    } // backspace or ctrl+h
    else if (s === '\x1b' || s === '\x1b\x1b') {
      key.name = enumKeyNames.ESCAPE, key.meta = s.length === 2;
    } // escape key
    else if (s === ' ' || s === '\x1b ') {
      key.name = enumKeyNames.SPACE, key.meta = s.length === 2;
    } else if (s.length === 1 && s <= '\x1a') {
      key.name = String.fromCharCode(s.charCodeAt(0) + 'a'.charCodeAt(0) - 1), key.ctrl = true;
    } // ctrl+letter
    else if (s.length === 1 && s >= 'a' && s <= 'z') {
      key.name = s;
    } // lowercase letter
    else if (s.length === 1 && s >= 'A' && s <= 'Z') {
      key.name = s.toLowerCase(), key.shift = true;
    } // shift+letter
    else if (parts = KEYCODE_META.exec(s)) {
      key.name = parts[1].toLowerCase(), key.meta = true, key.shift = /^[A-Z]$/.test(parts[1]);
    } // meta+character key
    else if (parts = KEYCODE_FUN.exec(s)) {
      // ansi escape sequence
      // reassemble the key code leaving out leading \x1b's,
      // the modifier key bitflag and any meaningless "1;" sequence
      const code = (parts[1] || '') + (parts[2] || '') + (parts[4] || '') + (parts[9] || ''),
            modifier = (parts[3] || parts[8] || 1) - 1; // Parse the key modifier

      key.ctrl = !!(modifier & 4);
      key.meta = !!(modifier & 10);
      key.shift = !!(modifier & 1);
      key.code = code; // Parse the key itself

      switch (code) {
        /* xterm ESC [ letter */
        case '[A':
          key.name = enumKeyNames.UP;
          break;

        case '[B':
          key.name = enumKeyNames.DOWN;
          break;

        case '[C':
          key.name = enumKeyNames.RIGHT;
          break;

        case '[D':
          key.name = enumKeyNames.LEFT;
          break;

        case '[E':
          key.name = enumKeyNames.CLEAR;
          break;

        case '[F':
          key.name = enumKeyNames.END;
          break;

        case '[H':
          key.name = enumKeyNames.HOME;
          break;

        /* xterm/gnome ESC O letter */

        case 'OA':
          key.name = enumKeyNames.UP;
          break;

        case 'OB':
          key.name = enumKeyNames.DOWN;
          break;

        case 'OC':
          key.name = enumKeyNames.RIGHT;
          break;

        case 'OD':
          key.name = enumKeyNames.LEFT;
          break;

        case 'OE':
          key.name = enumKeyNames.CLEAR;
          break;

        case 'OF':
          key.name = enumKeyNames.END;
          break;

        case 'OH':
          key.name = enumKeyNames.HOME;
          break;

        /* xterm/rxvt ESC [ number ~ */

        case '[1~':
          key.name = enumKeyNames.HOME;
          break;

        case '[2~':
          key.name = enumKeyNames.INSERT;
          break;

        case '[3~':
          key.name = enumKeyNames.DELETE;
          break;

        case '[4~':
          key.name = enumKeyNames.END;
          break;

        case '[5~':
          key.name = enumKeyNames.PAGEUP;
          break;

        case '[6~':
          key.name = enumKeyNames.PAGEDOWN;
          break;

        /* putty */

        case '[[5~':
          key.name = enumKeyNames.PAGEUP;
          break;

        case '[[6~':
          key.name = enumKeyNames.PAGEDOWN;
          break;

        /* rxvt */

        case '[7~':
          key.name = enumKeyNames.HOME;
          break;

        case '[8~':
          key.name = enumKeyNames.END;
          break;

        /* rxvt keys with modifiers */

        case '[a':
          key.name = enumKeyNames.UP;
          key.shift = true;
          break;

        case '[b':
          key.name = enumKeyNames.DOWN;
          key.shift = true;
          break;

        case '[c':
          key.name = enumKeyNames.RIGHT;
          key.shift = true;
          break;

        case '[d':
          key.name = enumKeyNames.LEFT;
          key.shift = true;
          break;

        case '[e':
          key.name = enumKeyNames.CLEAR;
          key.shift = true;
          break;

        case '[2$':
          key.name = enumKeyNames.INSERT;
          key.shift = true;
          break;

        case '[3$':
          key.name = enumKeyNames.DELETE;
          key.shift = true;
          break;

        case '[5$':
          key.name = enumKeyNames.PAGEUP;
          key.shift = true;
          break;

        case '[6$':
          key.name = enumKeyNames.PAGEDOWN;
          key.shift = true;
          break;

        case '[7$':
          key.name = enumKeyNames.HOME;
          key.shift = true;
          break;

        case '[8$':
          key.name = enumKeyNames.END;
          key.shift = true;
          break;

        case 'Oa':
          key.name = enumKeyNames.UP;
          key.ctrl = true;
          break;

        case 'Ob':
          key.name = enumKeyNames.DOWN;
          key.ctrl = true;
          break;

        case 'Oc':
          key.name = enumKeyNames.RIGHT;
          key.ctrl = true;
          break;

        case 'Od':
          key.name = enumKeyNames.LEFT;
          key.ctrl = true;
          break;

        case 'Oe':
          key.name = enumKeyNames.CLEAR;
          key.ctrl = true;
          break;

        case '[2^':
          key.name = enumKeyNames.INSERT;
          key.ctrl = true;
          break;

        case '[3^':
          key.name = enumKeyNames.DELETE;
          key.ctrl = true;
          break;

        case '[5^':
          key.name = enumKeyNames.PAGEUP;
          key.ctrl = true;
          break;

        case '[6^':
          key.name = enumKeyNames.PAGEDOWN;
          key.ctrl = true;
          break;

        case '[7^':
          key.name = enumKeyNames.HOME;
          key.ctrl = true;
          break;

        case '[8^':
          key.name = enumKeyNames.END;
          key.ctrl = true;
          break;

        /* xterm/gnome ESC O letter */

        case 'OP':
          key.name = 'f1';
          break;

        case 'OQ':
          key.name = 'f2';
          break;

        case 'OR':
          key.name = 'f3';
          break;

        case 'OS':
          key.name = 'f4';
          break;

        /* xterm/rxvt ESC [ number ~ */

        case '[11~':
          key.name = 'f1';
          break;

        case '[12~':
          key.name = 'f2';
          break;

        case '[13~':
          key.name = 'f3';
          break;

        case '[14~':
          key.name = 'f4';
          break;

        /* from Cygwin and used in libuv */

        case '[[A':
          key.name = 'f1';
          break;

        case '[[B':
          key.name = 'f2';
          break;

        case '[[C':
          key.name = 'f3';
          break;

        case '[[D':
          key.name = 'f4';
          break;

        case '[[E':
          key.name = 'f5';
          break;

        /* common */

        case '[15~':
          key.name = 'f5';
          break;

        case '[17~':
          key.name = 'f6';
          break;

        case '[18~':
          key.name = 'f7';
          break;

        case '[19~':
          key.name = 'f8';
          break;

        case '[20~':
          key.name = 'f9';
          break;

        case '[21~':
          key.name = 'f10';
          break;

        case '[23~':
          key.name = 'f11';
          break;

        case '[24~':
          key.name = 'f12';
          break;

        /* misc. */

        case '[Z':
          key.name = enumKeyNames.TAB;
          key.shift = true;
          break;

        default:
          key.name = enumKeyNames.UNDEFINED;
          break;
      }
    } // Don't emit a key if no name was found


    if (key.name === undefined) key = undefined;
    if (s.length === 1) ch = s;
    if (key || ch) stream.emit(enumEvents.KEYPRESS, ch, key);
  });
}

function isMouse(s) {
  return /\x1b\[M/.test(s) || /\x1b\[M([\x00\u0020-\uffff]{3})/.test(s) || /\x1b\[(\d+;\d+;\d+)M/.test(s) || /\x1b\[<(\d+;\d+;\d+)([mM])/.test(s) || /\x1b\[<(\d+;\d+;\d+;\d+)&w/.test(s) || /\x1b\[24([0135])~\[(\d+),(\d+)\]\r/.test(s) || /\x1b\[(O|I)/.test(s);
}

function keypressEventsEmitter(stream) {
  if (stream._keypressDecoder) return;
  stream._keypressDecoder = new string_decoder.StringDecoder('utf8');

  function onData(b) {
    if (listenerCount(stream, enumEvents.KEYPRESS) > 0) {
      const r = stream._keypressDecoder.write(b);

      if (r) emitKeys(stream, r);
    } else {
      // Nobody's watching anyway
      stream.removeListener(enumEvents.DATA, onData), stream.on(enumEvents.NEW_LISTENER, onNewListener);
    }
  }

  function onNewListener(event) {
    if (event === enumEvents.KEYPRESS) {
      stream.on(enumEvents.DATA, onData), stream.removeListener(enumEvents.NEW_LISTENER, onNewListener);
    }
  }

  listenerCount(stream, enumEvents.KEYPRESS) > 0 ? stream.on(enumEvents.DATA, onData) : stream.on(enumEvents.NEW_LISTENER, onNewListener);
}

const SP = ' ';

/**
 * alias.js - event emitter for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class EventEmitter {
  #events = {};
  #max = Infinity;

  constructor() {}

  static build() {
    return new EventEmitter();
  }

  setMaxListeners(n) {
    this.#max = n;
  }

  get events() {
    return this.#events;
  }

  addListener = this.on;

  on(type, listener) {
    let curr = this.#events[type];

    if (!curr) {
      this.#events[type] = listener;
    } else if (typeof curr === enumDataTypes.FUN) {
      this.#events[type] = [curr, listener];
    } else {
      this.#events[type].push(listener);
    }

    this.#emit(enumEvents.NEW_LISTENER, [type, listener]);
  }

  removeListener = this.off;

  off(type, listener) {
    const curr = this.#events[type];
    if (!curr) return void 0;

    if (typeof curr === enumDataTypes.FUN || curr.length === 1) {
      delete this.#events[type];
      this.#emit(enumEvents.REMOVE_LISTENER, [type, listener]);
      return void 0;
    }

    for (let i = 0, hi = curr.length; i < hi; i++) {
      if (curr[i] === listener || curr[i].listener === listener) {
        curr.splice(i, 1);
        return void this.#emit(enumEvents.REMOVE_LISTENER, [type, listener]);
      }
    }
  }

  removeAllListeners(type) {
    type ? delete this.#events[type] : this.#events = {};
  }

  once(type, listener) {
    const self = this;

    function onceHandler() {
      return self.off(type, onceHandler), listener.apply(self, arguments);
    }

    onceHandler.listener = listener;
    return this.on(type, onceHandler);
  }

  listeners(type) {
    return typeof this.#events[type] === enumDataTypes.FUN ? [this.#events[type]] : this.#events[type] ?? [];
  }

  _emit = this.#emit;

  #emit(type, args) {
    const handler = this.#events[type];
    let result;
    if (!handler) return type === enumEvents.ERROR ? function (e) {
      throw e;
    }(new args[0]()) : void 0;
    if (typeof handler === enumDataTypes.FUN) return handler.apply(this, args);

    for (const item of handler) if (item.apply(this, args) === false) result = false;

    return result !== false;
  }

  emit(type, ...args) {
    let node = this;
    this.#emit(enumEvents.EVENT, utilHelpers.slice(arguments));
    if (this.type === 'screen') return this.#emit(type, args);
    if (this.#emit(type, args) === false) return false;
    type = 'element' + SP + type;
    args.unshift(this); // const elementArgs = [ node ].concat(args)

    do {
      if (!node.events[type]) continue;
      if (node._emit(type, args) === false) return false;
    } while (node = node.sup);

    return true;
  }

} // For hooking into the main EventEmitter if we want to.
// Might be better to do things this way being that it
// will always be compatible with node, not to mention
// it gives us domain support as well.
// Node.prototype.#emit = Node.prototype.emit;
// Node.prototype.emit = function(type) {
//   var args, el;
//
//   if (this.type === 'screen') {
//     return this.#emit.apply(this, arguments);
//   }
//
//   this.#emit.apply(this, arguments);
//   if (this._bubbleStopped) return false;
//
//   args = slice.call(arguments, 1);
//   el = this;
//
//   args.unshift('element ' + type, this);
//   this._bubbleStopped = false;
//   //args.push(stopBubble);
//
//   do {
//     if (!el.#events || !el.#events[type]) continue;
//     el.#emit.apply(el, args);
//     if (this._bubbleStopped) return false;
//   } while ((el = el.sup));
//
//   return true;
// };
//
// Node.prototype._addListener = Node.prototype.addListener;
// Node.prototype.on =
// Node.prototype.addListener = function(type, listener) {
//   function on() {
//     if (listener.apply(this, arguments) === false) {
//       this._bubbleStopped = true;
//     }
//   }
//   on.listener = listener;
//   return this._addListener(type, on);
// };

exports.EventEmitter = EventEmitter;
exports.keypressEventsEmitter = keypressEventsEmitter;
