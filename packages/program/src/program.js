/**
 * program.js - basic curses-like functionality for blessed.
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { SIGCONT, SIGTSTP }                                       from '@geia/enum-signals'
import {
  BLUR, BTNDOWN, BTNUP, DATA, DESTROY, DRAG, EXIT, FOCUS, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEMOVE, MOUSEUP, MOUSEWHEEL,
  MOVE, NEW_LISTENER, RESIZE, RESPONSE, WARNING, WHEELDOWN, WHEELUP,
}                                                                 from '@pres/enum-events'
import { ENTER, LEFT, MIDDLE, RETURN, RIGHT, UNDEFINED, UNKNOWN } from '@pres/enum-key-names'
import { EventEmitter }                                           from '@pres/events'
import { Tput }                                                   from '@pres/terminfo-parser'
import * as colors                                                from '@pres/util-colors'
import { SC }                                                     from '@texting/enum-chars'
import { FUN, NUM, STR }                                          from '@typen/enum-data-types'
import cp                                                         from 'child_process'
import fs                                                         from 'fs'
import { StringDecoder }                                          from 'string_decoder'
import util                                                       from 'util'
import { BEL, ESC }                                               from '../assets/control.chars'
import { _CHT, _CUP, _CUU, _ED, _RCP, _SCP, _SD, _SGR, _SU, CSI } from '../assets/csi.codes'
import { OSC }                                                    from '../assets/osc.codes'
import { gpmClient }                                              from './gpmclient'
import { emitKeypressEvents }                                     from './keys'

const slice = Array.prototype.slice

const nextTick = global.setImmediate || process.nextTick.bind(process)

/**
 * Program
 */
export class Program extends EventEmitter {
  #logger = null
  type = 'program'
  constructor(options = {}) {
    super()
    console.log(">>> [Program constructed]")
    const self = this
    // if (!(this instanceof Program)) return new Program(options)
    Program.configSingleton(this)
    // EventEmitter.call(this)
    if (!options || options.__proto__ !== Object.prototype) {
      const [ input, output ] = arguments
      options = { input, output }
    }
    this.options = options
    this.input = options.input || process.stdin
    this.output = options.output || process.stdout
    options.log = options.log || options.dump
    if (options.log) {
      this.#logger = fs.createWriteStream(options.log)
      if (options.dump) this.setupDump()
    }
    this.zero = options.zero !== false
    this.useBuffer = options.buffer
    this.x = 0
    this.y = 0
    this.savedX = 0
    this.savedY = 0
    this.cols = this.output.columns || 1
    this.rows = this.output.rows || 1
    this.scrollTop = 0
    this.scrollBottom = this.rows - 1
    this._terminal = options.terminal ||
      options.term ||
      process.env.TERM ||
      (process.platform === 'win32' ? 'windows-ansi' : 'xterm')
    this._terminal = this._terminal.toLowerCase()
    // OSX
    this.isOSXTerm = process.env.TERM_PROGRAM === 'Apple_Terminal'
    this.isiTerm2 =
      process.env.TERM_PROGRAM === 'iTerm.app' ||
      !!process.env.ITERM_SESSION_ID
    // VTE
    // NOTE: lxterminal does not provide an env variable to check for.
    // NOTE: gnome-terminal and sakura use a later version of VTE
    // which provides VTE_VERSION as well as supports SGR events.
    this.isXFCE = /xfce/i.test(process.env.COLORTERM)
    this.isTerminator = !!process.env.TERMINATOR_UUID
    this.isLXDE = false
    this.isVTE =
      !!process.env.VTE_VERSION ||
      this.isXFCE ||
      this.isTerminator ||
      this.isLXDE
    // xterm and rxvt - not accurate
    this.isRxvt = /rxvt/i.test(process.env.COLORTERM)
    this.isXterm = false
    this.tmux = !!process.env.TMUX
    this.tmuxVersion = (function () {
      if (!self.tmux) return 2
      try {
        const version = cp.execFileSync('tmux', [ '-V' ], { encoding: 'utf8' })
        return +/^tmux ([\d.]+)/i.exec(version.trim().split('\n')[0])[1]
      } catch (e) {
        return 2
      }
    })()
    this._buf = ''
    this._flush = this.flush.bind(this)
    if (options.tput !== false) this.setupTput()
    this.listen()
  }

  static build(options) {
    console.log('>>> [about to create pres program]')
    return new Program(options)
  }
  static configSingleton(program) {
    if (!Program.global) Program.global = program
    if (!~Program.instances.indexOf(program)) {
      Program.instances.push(program)
      program.index = Program.total
      Program.total++
    }
    if (Program._bound) return
    Program._bound = true
    unshiftEvent(process, EXIT, Program._exitHandler = function () {
      Program.instances.forEach(function (program) {
        // Potentially reset window title on exit:
        // if (program._originalTitle) {
        //   program.setTitle(program._originalTitle);
        // }
        // Ensure the buffer is flushed (it should
        // always be at this point, but who knows).
        program.flush()
        // Ensure _exiting is set (could technically
        // use process._exiting).
        program._exiting = true
      })
    })
  }
  static global = null
  static total = 0
  static instances = []

  get terminal() { return this._terminal }
  set terminal(terminal) { return this.setTerminal(terminal), this.terminal }
  get title() { return this._title }
  set title(title) { return this.setTitle(title), this._title }

  log() { return this.#log('LOG', util.format.apply(util, arguments)) }
  debug() {
    return !this.options.debug
      ? void 0
      : this.#log('DEBUG', util.format.apply(util, arguments))
  }
  #log(pre, msg) {
    if (!this.#logger) return
    return this.#logger.write(pre + ': ' + msg + '\n-\n')
  }

  setupDump() {
    const
      self    = this,
      write   = this.output.write,
      decoder = new StringDecoder('utf8')
    function stringify(data) {
      return caret(data
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t'))
        .replace(/[^ -~]/g, ch => {
          if (ch.charCodeAt(0) > 0xff) return ch
          ch = ch.charCodeAt(0).toString(16)
          if (ch.length > 2) {
            if (ch.length < 4) ch = `0${ch}`
            return `\\u${ch}`
          }
          if (ch.length < 2) ch = `0${ch}`
          return `\\x${ch}`
        })
    }
    function caret(data) {
      return data.replace(/[\0\x80\x1b-\x1f\x7f\x01-\x1a]/g, ch => {
        if (ch === '\0' || ch === '\x80') {
          ch = '@'
        }
        else if (ch === ESC) {
          ch = '['
        }
        else if (ch === '\x1c') {
          ch = '\\'
        }
        else if (ch === '\x1d') {
          ch = ']'
        }
        else if (ch === '\x1e') {
          ch = '^'
        }
        else if (ch === '\x1f') {
          ch = '_'
        }
        else if (ch === '\x7f') {
          ch = '?'
        }
        else {
          ch = ch.charCodeAt(0)
          // From ('A' - 64) to ('Z' - 64).
          if (ch >= 1 && ch <= 26) { ch = String.fromCharCode(ch + 64) }
          else { return String.fromCharCode(ch) }
        }
        return `^${ch}`
      })
    }
    this.input.on(DATA, data => self.#log('IN', stringify(decoder.write(data))))
    this.output.write = function (data) {
      self.#log('OUT', stringify(data))
      return write.apply(this, arguments)
    }
  }
  setupTput() {
    if (this._tputSetup) return
    this._tputSetup = true
    const
      self    = this,
      options = this.options,
      write   = this.#write.bind(this)
    const tput = this.tput = new Tput({
      terminal: this.terminal,
      padding: options.padding,
      extended: options.extended,
      printf: options.printf,
      termcap: options.termcap,
      forceUnicode: options.forceUnicode
    })
    if (tput.error) nextTick(() => self.emit(WARNING, tput.error.message))
    if (tput.padding) nextTick(() => self.emit(WARNING, 'Terminfo padding has been enabled.'))
    this.put = function () {
      const
        args = slice.call(arguments),
        cap  = args.shift()
      if (tput[cap])
        return this.#write(tput[cap].apply(tput, args))
    }
    Object.keys(tput).forEach(key => {
      if (self[key] == null) self[key] = tput[key]
      if (typeof tput[key] !== FUN) return void (self.put[key] = tput[key])
      self.put[key] = tput.padding
        ? function () { return tput._print(tput[key].apply(tput, arguments), write) }
        : function () { return self.#write(tput[key].apply(tput, arguments)) }
    })
  }
  setTerminal(terminal) {
    this._terminal = terminal.toLowerCase()
    delete this._tputSetup
    this.setupTput()
  }
  has(name) { return this.tput?.has(name) ?? false }
  term(is) { return this.terminal.indexOf(is) === 0 }
  listen() {
    const self = this
    // console.log(`>>> [this.input._presInput = ${this.input._presInput}]`)
    // Potentially reset window title on exit:
    // if (!this.isRxvt) {
    //   if (!this.isVTE) this.setTitleModeFeature(3);
    //   this.manipulateWindow(21, function(err, data) {
    //     if (err) return;
    //     self._originalTitle = data.text;
    //   });
    // }
    // Listen for keys/mouse on input
    if (!this.input._presInput) {
      this.input._presInput = 1
      this.#listenInput()
    }
    else {
      this.input._presInput++
    }
    this.on(NEW_LISTENER, this._newHandler = function fn(type) {
      if (type === KEYPRESS || type === MOUSE) {
        self.removeListener(NEW_LISTENER, fn)
        if (self.input.setRawMode && !self.input.isRaw) {
          self.input.setRawMode(true)
          self.input.resume()
        }
      }
    })
    this.on(NEW_LISTENER, function fn(type) {
      if (type === MOUSE) {
        self.removeListener(NEW_LISTENER, fn)
        self.bindMouse()
      }
    })
    // Listen for resize on output
    if (!this.output._presOutput) {
      this.output._presOutput = 1
      this.#listenOutput()
    }
    else {
      this.output._presOutput++
    }
  }
  #listenInput() {
    const self = this
    console.log('>>> [Program.prototype.#listenInput]')
    setTimeout(() => {}, 3000)
    // Input
    this.input.on(KEYPRESS, this.input._keypressHandler = function (ch, key) {
      key = key || { ch: ch }
      // A mouse sequence. The `keys` module doesn't understand these.
      if (key.name === UNDEFINED && (key.code === '[M' || key.code === '[I' || key.code === '[O')) return
      // Not sure what this is, but we should probably ignore it.
      if (key.name === UNDEFINED) return
      if (key.name === ENTER && key.sequence === '\n') key.name = 'linefeed'
      if (key.name === RETURN && key.sequence === '\r') self.input.emit(KEYPRESS, ch, merge({}, key, { name: ENTER }))
      const name = `${key.ctrl ? 'C-' : ''}${key.meta ? 'M-' : ''}${key.shift && key.name ? 'S-' : ''}${key.name || ch}`
      key.full = name
      Program.instances.forEach(function (program) {
        if (program.input !== self.input) return
        program.emit(KEYPRESS, ch, key)
        program.emit(`key ${name}`, ch, key)
      })
    })
    this.input.on(DATA,
      this.input._dataHandler =
        data => Program.instances.forEach(
          program => program.input !== self.input ? void 0 : void program.emit(DATA, data)
        )
    )
    emitKeypressEvents(this.input)
  }
  #listenOutput() {
    const self = this
    if (!this.output.isTTY) nextTick(() => self.emit(WARNING, 'Output is not a TTY'))
    // Output
    function resize() {
      Program.instances.forEach(p => {
        const { output } = p
        if (output !== self.output) return void 0
        p.cols = output.columns
        p.rows = output.rows
        p.emit(RESIZE)
      })
    }
    this.output.on(RESIZE, this.output._resizeHandler = () => {
      Program.instances.forEach(p => {
        if (p.output !== self.output) return
        const { options: { resizeTimeout }, _resizeTimer } = p
        if (!resizeTimeout) return resize()
        if (_resizeTimer) clearTimeout(_resizeTimer), (delete p._resizeTimer)
        const time = typeof resizeTimeout === NUM ? resizeTimeout : 300
        p._resizeTimer = setTimeout(resize, time)
      })
    })
  }
  destroy() {
    const index = Program.instances.indexOf(this)
    if (~index) {
      Program.instances.splice(index, 1)
      Program.total--
      this.flush()
      this._exiting = true
      Program.global = Program.instances[0]
      if (Program.total === 0) {
        Program.global = null
        process.removeListener(EXIT, Program._exitHandler)
        delete Program._exitHandler
        delete Program._bound
      }
      this.input._presInput--
      this.output._presOutput--
      if (this.input._presInput === 0) {
        this.input.removeListener(KEYPRESS, this.input._keypressHandler)
        this.input.removeListener(DATA, this.input._dataHandler)
        delete this.input._keypressHandler
        delete this.input._dataHandler
        if (this.input.setRawMode) {
          if (this.input.isRaw) { this.input.setRawMode(false) }
          if (!this.input.destroyed) { this.input.pause() }
        }
      }
      if (this.output._presOutput === 0) {
        this.output.removeListener(RESIZE, this.output._resizeHandler)
        delete this.output._resizeHandler
      }
      this.removeListener(NEW_LISTENER, this._newHandler)
      delete this._newHandler
      this.destroyed = true
      this.emit(DESTROY)
    }
  }
  key(key, listener) {
    if (typeof key === STR) key = key.split(/\s*,\s*/)
    key.forEach(function (key) { return this.on(`key ${key}`, listener) }, this)
  }
  onceKey(key, listener) {
    if (typeof key === STR) key = key.split(/\s*,\s*/)
    key.forEach(function (key) { return this.once(`key ${key}`, listener) }, this)
  }

  unkey = this.removeKey
  removeKey(key, listener) {
    if (typeof key === STR) key = key.split(/\s*,\s*/)
    key.forEach(function (key) { return this.removeListener(`key ${key}`, listener) }, this)
  }
  bindMouse() {
    if (this._boundMouse) return
    this._boundMouse = true
    const decoder = new StringDecoder('utf8'),
          self    = this
    this.on(DATA, function (data) {
      const text = decoder.write(data)
      if (!text) return
      self.#bindMouse(text, data)
    })
  }
  #bindMouse(s, buf) {
    const self = this
    let
      key,
      parts,
      b,
      x,
      y,
      mod,
      params,
      down,
      page,
      button
    key = {
      name: undefined,
      ctrl: false,
      meta: false,
      shift: false
    }
    if (Buffer.isBuffer(s)) {
      if (s[0] > 127 && s[1] === undefined) {
        s[0] -= 128
        s = ESC + s.toString('utf-8')
      }
      else {
        s = s.toString('utf-8')
      }
    }
    // if (this.8bit) {
    //   s = s.replace(/\233/g, CSI);
    //   buf = new Buffer(s, 'utf8');
    // }
    // XTerm / X10 for buggy VTE
    // VTE can only send unsigned chars and no unicode for coords. This limits
    // them to 0xff. However, normally the x10 protocol does not allow a byte
    // under 0x20, but since VTE can have the bytes overflow, we can consider
    // bytes below 0x20 to be up to 0xff + 0x20. This gives a limit of 287. Since
    // characters ranging from 223 to 248 confuse javascript's utf parser, we
    // need to parse the raw binary. We can detect whether the terminal is using
    // a bugged VTE version by examining the coordinates and seeing whether they
    // are a value they would never otherwise be with a properly implemented x10
    // protocol. This method of detecting VTE is only 99% reliable because we
    // can't check if the coords are 0x00 (255) since that is a valid x10 coord
    // technically.
    const bx = s.charCodeAt(4)
    const by = s.charCodeAt(5)
    if (
      buf[0] === 0x1b && buf[1] === 0x5b && buf[2] === 0x4d &&
      (
        this.isVTE ||
        bx >= 65533 || by >= 65533 ||
        (bx > 0x00 && bx < 0x20) ||
        (by > 0x00 && by < 0x20) ||
        (buf[4] > 223 && buf[4] < 248 && buf.length === 6) ||
        (buf[5] > 223 && buf[5] < 248 && buf.length === 6)
      )
    ) {
      b = buf[3]
      x = buf[4]
      y = buf[5]
      // unsigned char overflow.
      if (x < 0x20) x += 0xff
      if (y < 0x20) y += 0xff
      // Convert the coordinates into a
      // properly formatted x10 utf8 sequence.
      s = CSI + `M${String.fromCharCode(b)}${String.fromCharCode(x)}${String.fromCharCode(y)}`
    }
    // XTerm / X10
    if ((parts = /^\x1b\[M([\x00\u0020-\uffff]{3})/.exec(s))) {
      b = parts[1].charCodeAt(0)
      x = parts[1].charCodeAt(1)
      y = parts[1].charCodeAt(2)
      key.name = MOUSE
      key.type = 'X10'
      key.raw = [ b, x, y, parts[0] ]
      key.buf = buf
      key.x = x - 32
      key.y = y - 32
      if (this.zero) key.x--, key.y--
      if (x === 0) key.x = 255
      if (y === 0) key.y = 255

      mod = b >> 2
      key.shift = !!(mod & 1)
      key.meta = !!((mod >> 1) & 1)
      key.ctrl = !!((mod >> 2) & 1)
      b -= 32
      if ((b >> 6) & 1) {
        key.action = b & 1 ? WHEELDOWN : WHEELUP
        key.button = MIDDLE
      }
      else if (b === 3) {
        // NOTE: x10 and urxvt have no way
        // of telling which button mouseup used.
        key.action = MOUSEUP
        key.button = this._lastButton || UNKNOWN
        delete this._lastButton
      }
      else {
        key.action = MOUSEDOWN
        button = b & 3
        key.button =
          button === 0 ? LEFT :
            button === 1 ? MIDDLE :
              button === 2 ? RIGHT :
                UNKNOWN
        this._lastButton = key.button
      }
      // Probably a movement.
      // The *newer* VTE gets mouse movements comepletely wrong.
      // This presents a problem: older versions of VTE that get it right might
      // be confused by the second conditional in the if statement.
      // NOTE: Possibly just switch back to the if statement below.
      // none, shift, ctrl, alt
      // gnome: 32, 36, 48, 40
      // xterm: 35, _, 51, _
      // urxvt: 35, _, _, _
      // if (key.action === MOUSEDOWN && key.button === UNKNOWN) {
      if (
        b === 35 || b === 39 || b === 51 || b === 43 ||
        (this.isVTE && (b === 32 || b === 36 || b === 48 || b === 40))
      ) {
        delete key.button
        key.action = MOUSEMOVE
      }
      self.emit(MOUSE, key)
      return
    }
    // URxvt
    if ((parts = /^\x1b\[(\d+;\d+;\d+)M/.exec(s))) {
      params = parts[1].split(SC)
      b = +params[0]
      x = +params[1]
      y = +params[2]
      key.name = MOUSE
      key.type = 'urxvt'
      key.raw = [ b, x, y, parts[0] ]
      key.buf = buf
      key.x = x
      key.y = y
      if (this.zero) key.x--, key.y--

      mod = b >> 2
      key.shift = !!(mod & 1)
      key.meta = !!((mod >> 1) & 1)
      key.ctrl = !!((mod >> 2) & 1)
      // XXX Bug in urxvt after wheelup/down on mousemove
      // NOTE: This may be different than 128/129 depending
      // on mod keys.
      if (b === 128 || b === 129) b = 67
      b -= 32
      if ((b >> 6) & 1) {
        key.action = b & 1 ? WHEELDOWN : WHEELUP
        key.button = MIDDLE
      }
      else if (b === 3) {
        // NOTE: x10 and urxvt have no way
        // of telling which button mouseup used.
        key.action = MOUSEUP
        key.button = this._lastButton || UNKNOWN
        delete this._lastButton
      }
      else {
        key.action = MOUSEDOWN
        button = b & 3
        key.button =
          button === 0 ? LEFT
            : button === 1 ? MIDDLE
            : button === 2 ? RIGHT
              : UNKNOWN
        // NOTE: 0/32 = mousemove, 32/64 = mousemove with left down
        // if ((b >> 1) === 32)
        this._lastButton = key.button
      }
      // Probably a movement.
      // The *newer* VTE gets mouse movements comepletely wrong.
      // This presents a problem: older versions of VTE that get it right might
      // be confused by the second conditional in the if statement.
      // NOTE: Possibly just switch back to the if statement below.
      // none, shift, ctrl, alt
      // urxvt: 35, _, _, _
      // gnome: 32, 36, 48, 40
      // if (key.action === MOUSEDOWN && key.button === UNKNOWN) {
      if (b === 35 || b === 39 || b === 51 || b === 43 ||
        (this.isVTE && (b === 32 || b === 36 || b === 48 || b === 40))) {
        delete key.button
        key.action = MOUSEMOVE
      }
      self.emit(MOUSE, key)
      return
    }
    // SGR
    if ((parts = /^\x1b\[<(\d+;\d+;\d+)([mM])/.exec(s))) {
      down = parts[2] === 'M'
      params = parts[1].split(SC)
      b = +params[0]
      x = +params[1]
      y = +params[2]
      key.name = MOUSE
      key.type = 'sgr'
      key.raw = [ b, x, y, parts[0] ]
      key.buf = buf
      key.x = x
      key.y = y
      if (this.zero) key.x--, key.y--
      mod = b >> 2
      key.shift = !!(mod & 1)
      key.meta = !!((mod >> 1) & 1)
      key.ctrl = !!((mod >> 2) & 1)
      if ((b >> 6) & 1) {
        key.action = b & 1 ? WHEELDOWN : WHEELUP
        key.button = MIDDLE
      }
      else {
        key.action = down
          ? MOUSEDOWN
          : MOUSEUP
        button = b & 3
        key.button =
          button === 0 ? LEFT
            : button === 1 ? MIDDLE
            : button === 2 ? RIGHT
              : UNKNOWN
      }
      // Probably a movement.
      // The *newer* VTE gets mouse movements comepletely wrong.
      // This presents a problem: older versions of VTE that get it right might
      // be confused by the second conditional in the if statement.
      // NOTE: Possibly just switch back to the if statement below.
      // none, shift, ctrl, alt
      // xterm: 35, _, 51, _
      // gnome: 32, 36, 48, 40
      // if (key.action === MOUSEDOWN && key.button === UNKNOWN) {
      if (b === 35 || b === 39 || b === 51 || b === 43 ||
        (this.isVTE && (b === 32 || b === 36 || b === 48 || b === 40))) {
        delete key.button
        key.action = MOUSEMOVE
      }
      self.emit(MOUSE, key)
      return
    }
    // DEC
    // The xterm mouse documentation says there is a
    // `<` prefix, the DECRQLP says there is no prefix.
    if ((parts = /^\x1b\[<(\d+;\d+;\d+;\d+)&w/.exec(s))) {
      params = parts[1].split(SC)
      b = +params[0]
      x = +params[1]
      y = +params[2]
      page = +params[3]
      key.name = MOUSE
      key.type = 'dec'
      key.raw = [ b, x, y, parts[0] ]
      key.buf = buf
      key.x = x
      key.y = y
      key.page = page
      if (this.zero) key.x--, key.y--
      key.action = b === 3
        ? MOUSEUP
        : MOUSEDOWN
      key.button =
        b === 2 ? LEFT
          : b === 4 ? MIDDLE
          : b === 6 ? RIGHT
            : UNKNOWN
      self.emit(MOUSE, key)
      return
    }
    // vt300
    if ((parts = /^\x1b\[24([0135])~\[(\d+),(\d+)\]\r/.exec(s))) {
      b = +parts[1]
      x = +parts[2]
      y = +parts[3]
      key.name = MOUSE
      key.type = 'vt300'
      key.raw = [ b, x, y, parts[0] ]
      key.buf = buf
      key.x = x
      key.y = y
      if (this.zero) key.x--, key.y--
      key.action = MOUSEDOWN
      key.button = b === 1 ? LEFT : b === 2 ? MIDDLE : b === 5 ? RIGHT : UNKNOWN
      self.emit(MOUSE, key)
      return
    }
    if ((parts = /^\x1b\[(O|I)/.exec(s))) {
      key.action = parts[1] === 'I'
        ? FOCUS
        : BLUR
      self.emit(MOUSE, key)
      self.emit(key.action)
    }
  }
  enableGpm() {
    const self = this
    if (this.gpm) return
    this.gpm = gpmClient()
    this.gpm.on(BTNDOWN, function (btn, modifier, x, y) {
      x--, y--
      const key = {
        name: MOUSE,
        type: 'GPM',
        action: MOUSEDOWN,
        button: self.gpm.ButtonName(btn),
        raw: [ btn, modifier, x, y ],
        x: x,
        y: y,
        shift: self.gpm.hasShiftKey(modifier),
        meta: self.gpm.hasMetaKey(modifier),
        ctrl: self.gpm.hasCtrlKey(modifier)
      }
      self.emit(MOUSE, key)
    })
    this.gpm.on(BTNUP, function (btn, modifier, x, y) {
      x--, y--
      const key = {
        name: MOUSE,
        type: 'GPM',
        action: MOUSEUP,
        button: self.gpm.ButtonName(btn),
        raw: [ btn, modifier, x, y ],
        x: x,
        y: y,
        shift: self.gpm.hasShiftKey(modifier),
        meta: self.gpm.hasMetaKey(modifier),
        ctrl: self.gpm.hasCtrlKey(modifier)
      }
      self.emit(MOUSE, key)
    })
    this.gpm.on(MOVE, function (btn, modifier, x, y) {
      x--, y--
      const key = {
        name: MOUSE,
        type: 'GPM',
        action: MOUSEMOVE,
        button: self.gpm.ButtonName(btn),
        raw: [ btn, modifier, x, y ],
        x: x,
        y: y,
        shift: self.gpm.hasShiftKey(modifier),
        meta: self.gpm.hasMetaKey(modifier),
        ctrl: self.gpm.hasCtrlKey(modifier)
      }
      self.emit(MOUSE, key)
    })
    this.gpm.on(DRAG, function (btn, modifier, x, y) {
      x--, y--
      const key = {
        name: MOUSE,
        type: 'GPM',
        action: MOUSEMOVE,
        button: self.gpm.ButtonName(btn),
        raw: [ btn, modifier, x, y ],
        x: x,
        y: y,
        shift: self.gpm.hasShiftKey(modifier),
        meta: self.gpm.hasMetaKey(modifier),
        ctrl: self.gpm.hasCtrlKey(modifier)
      }
      self.emit(MOUSE, key)
    })
    this.gpm.on(MOUSEWHEEL, function (btn, modifier, x, y, dx, dy) {
      const key = {
        name: MOUSE,
        type: 'GPM',
        action: dy > 0 ? WHEELUP : WHEELDOWN,
        button: self.gpm.ButtonName(btn),
        raw: [ btn, modifier, x, y, dx, dy ],
        x: x,
        y: y,
        shift: self.gpm.hasShiftKey(modifier),
        meta: self.gpm.hasMetaKey(modifier),
        ctrl: self.gpm.hasCtrlKey(modifier)
      }
      self.emit(MOUSE, key)
    })
  }
  disableGpm() {
    if (this.gpm) {
      this.gpm.stop()
      delete this.gpm
    }
  }
  bindResponse() {
    if (this._boundResponse) return
    this._boundResponse = true
    const decoder = new StringDecoder('utf8'),
          self    = this
    this.on(DATA, function (data) {
      data = decoder.write(data)
      if (!data) return
      self.#bindResponse(data)
    })
  }
  #bindResponse(s) {
    const out = {}
    let parts
    if (Buffer.isBuffer(s)) {
      if (s[0] > 127 && s[1] === undefined) {
        s[0] -= 128
        s = ESC + s.toString('utf-8')
      }
      else {
        s = s.toString('utf-8')
      }
    }
    // CSI P s c
    // Send Device Attributes (Primary DA).
    // CSI > P s c
    // Send Device Attributes (Secondary DA).
    if ((parts = /^\x1b\[(\?|>)(\d*(?:;\d*)*)c/.exec(s))) {
      parts = parts[2].split(SC).map(ch => +ch || 0)
      out.event = 'device-attributes'
      out.code = 'DA'
      if (parts[1] === '?') {
        out.type = 'primary-attribute'
        // VT100-style params:
        if (parts[0] === 1 && parts[2] === 2) {
          out.term = 'vt100'
          out.advancedVideo = true
        }
        else if (parts[0] === 1 && parts[2] === 0) {
          out.term = 'vt101'
        }
        else if (parts[0] === 6) {
          out.term = 'vt102'
        }
        else if (parts[0] === 60 &&
          parts[1] === 1 && parts[2] === 2 &&
          parts[3] === 6 && parts[4] === 8 &&
          parts[5] === 9 && parts[6] === 15) {
          out.term = 'vt220'
        }
        else {
          // VT200-style params:
          parts.forEach(function (attr) {
            switch (attr) {
              case 1:
                out.cols132 = true
                break
              case 2:
                out.printer = true
                break
              case 6:
                out.selectiveErase = true
                break
              case 8:
                out.userDefinedKeys = true
                break
              case 9:
                out.nationalReplacementCharsets = true
                break
              case 15:
                out.technicalCharacters = true
                break
              case 18:
                out.userWindows = true
                break
              case 21:
                out.horizontalScrolling = true
                break
              case 22:
                out.ansiColor = true
                break
              case 29:
                out.ansiTextLocator = true
                break
            }
          })
        }
      }
      else {
        out.type = 'secondary-attribute'
        switch (parts[0]) {
          case 0:
            out.term = 'vt100'
            break
          case 1:
            out.term = 'vt220'
            break
          case 2:
            out.term = 'vt240'
            break
          case 18:
            out.term = 'vt330'
            break
          case 19:
            out.term = 'vt340'
            break
          case 24:
            out.term = 'vt320'
            break
          case 41:
            out.term = 'vt420'
            break
          case 61:
            out.term = 'vt510'
            break
          case 64:
            out.term = 'vt520'
            break
          case 65:
            out.term = 'vt525'
            break
        }
        out.firmwareVersion = parts[1]
        out.romCartridgeRegistrationNumber = parts[2]
      }
      // LEGACY
      out.deviceAttributes = out
      this.emit(RESPONSE, out)
      this.emit(`response ${out.event}`, out)
      return
    }
    // CSI Ps n  Device Status Report (DSR).
    //     Ps = 5  -> Status Report.  Result (``OK'') is
    //   CSI 0 n
    // CSI ? Ps n
    //   Device Status Report (DSR, DEC-specific).
    //     Ps = 1 5  -> Report Printer status as CSI ? 1 0  n  (ready).
    //     or CSI ? 1 1  n  (not ready).
    //     Ps = 2 5  -> Report UDK status as CSI ? 2 0  n  (unlocked)
    //     or CSI ? 2 1  n  (locked).
    //     Ps = 2 6  -> Report Keyboard status as
    //   CSI ? 2 7  ;  1  ;  0  ;  0  n  (North American).
    //   The last two parameters apply to VT400 & up, and denote key-
    //   board ready and LK01 respectively.
    //     Ps = 5 3  -> Report Locator status as
    //   CSI ? 5 3  n  Locator available, if compiled-in, or
    //   CSI ? 5 0  n  No Locator, if not.
    if ((parts = /^\x1b\[(\?)?(\d+)(?:;(\d+);(\d+);(\d+))?n/.exec(s))) {
      out.event = 'device-status'
      out.code = 'DSR'
      if (!parts[1] && parts[2] === '0' && !parts[3]) {
        out.type = 'device-status'
        out.status = 'OK'
        // LEGACY
        out.deviceStatus = out.status
        this.emit(RESPONSE, out)
        this.emit(`response ${out.event}`, out)
        return
      }
      if (parts[1] && (parts[2] === '10' || parts[2] === '11') && !parts[3]) {
        out.type = 'printer-status'
        out.status = parts[2] === '10'
          ? 'ready'
          : 'not ready'
        // LEGACY
        out.printerStatus = out.status
        this.emit(RESPONSE, out)
        this.emit(`response ${out.event}`, out)
        return
      }
      if (parts[1] && (parts[2] === '20' || parts[2] === '21') && !parts[3]) {
        out.type = 'udk-status'
        out.status = parts[2] === '20'
          ? 'unlocked'
          : 'locked'
        // LEGACY
        out.UDKStatus = out.status
        this.emit(RESPONSE, out)
        this.emit(`response ${out.event}`, out)
        return
      }
      if (parts[1] &&
        parts[2] === '27' &&
        parts[3] === '1' &&
        parts[4] === '0' &&
        parts[5] === '0') {
        out.type = 'keyboard-status'
        out.status = 'OK'
        // LEGACY
        out.keyboardStatus = out.status
        this.emit(RESPONSE, out)
        this.emit(`response ${out.event}`, out)
        return
      }
      if (parts[1] && (parts[2] === '53' || parts[2] === '50') && !parts[3]) {
        out.type = 'locator-status'
        out.status = parts[2] === '53'
          ? 'available'
          : 'unavailable'
        // LEGACY
        out.locator = out.status
        this.emit(RESPONSE, out)
        this.emit(`response ${out.event}`, out)
        return
      }
      out.type = 'error'
      out.text = `Unhandled: ${JSON.stringify(parts)}`
      // LEGACY
      out.error = out.text
      this.emit(RESPONSE, out)
      this.emit(`response ${out.event}`, out)
      return
    }
    // CSI Ps n  Device Status Report (DSR).
    //     Ps = 6  -> Report Cursor Position (CPR) [row;column].
    //   Result is
    //   CSI r ; c R
    // CSI ? Ps n
    //   Device Status Report (DSR, DEC-specific).
    //     Ps = 6  -> Report Cursor Position (CPR) [row;column] as CSI
    //     ? r ; c R (assumes page is zero).
    if ((parts = /^\x1b\[(\?)?(\d+);(\d+)R/.exec(s))) {
      out.event = 'device-status'
      out.code = 'DSR'
      out.type = 'cursor-status'
      out.status = {
        x: +parts[3],
        y: +parts[2],
        page: !parts[1] ? undefined : 0
      }
      out.x = out.status.x
      out.y = out.status.y
      out.page = out.status.page
      // LEGACY
      out.cursor = out.status
      this.emit(RESPONSE, out)
      this.emit(`response ${out.event}`, out)
      return
    }
    // CSI Ps ; Ps ; Ps t
    //   Window manipulation (from dtterm, as well as extensions).
    //   These controls may be disabled using the allowWindowOps
    //   resource.  Valid values for the first (and any additional
    //   parameters) are:
    //     Ps = 1 1  -> Report xterm window state.  If the xterm window
    //     is open (non-iconified), it returns CSI 1 t .  If the xterm
    //     window is iconified, it returns CSI 2 t .
    //     Ps = 1 3  -> Report xterm window position.  Result is CSI 3
    //     ; x ; y t
    //     Ps = 1 4  -> Report xterm window in pixels.  Result is CSI
    //     4  ;  height ;  width t
    //     Ps = 1 8  -> Report the size of the text area in characters.
    //     Result is CSI  8  ;  height ;  width t
    //     Ps = 1 9  -> Report the size of the screen in characters.
    //     Result is CSI  9  ;  height ;  width t
    if ((parts = /^\x1b\[(\d+)(?:;(\d+);(\d+))?t/.exec(s))) {
      out.event = 'window-manipulation'
      out.code = ''
      if ((parts[1] === '1' || parts[1] === '2') && !parts[2]) {
        out.type = 'window-state'
        out.state = parts[1] === '1'
          ? 'non-iconified'
          : 'iconified'
        // LEGACY
        out.windowState = out.state
        this.emit(RESPONSE, out)
        this.emit(`response ${out.event}`, out)
        return
      }
      if (parts[1] === '3' && parts[2]) {
        out.type = 'window-position'
        out.position = {
          x: +parts[2],
          y: +parts[3]
        }
        out.x = out.position.x
        out.y = out.position.y
        // LEGACY
        out.windowPosition = out.position
        this.emit(RESPONSE, out)
        this.emit(`response ${out.event}`, out)
        return
      }
      if (parts[1] === '4' && parts[2]) {
        out.type = 'window-size-pixels'
        out.size = {
          height: +parts[2],
          width: +parts[3]
        }
        out.height = out.size.height
        out.width = out.size.width
        // LEGACY
        out.windowSizePixels = out.size
        this.emit(RESPONSE, out)
        this.emit(`response ${out.event}`, out)
        return
      }
      if (parts[1] === '8' && parts[2]) {
        out.type = 'textarea-size'
        out.size = {
          height: +parts[2],
          width: +parts[3]
        }
        out.height = out.size.height
        out.width = out.size.width
        // LEGACY
        out.textAreaSizeCharacters = out.size
        this.emit(RESPONSE, out)
        this.emit(`response ${out.event}`, out)
        return
      }
      if (parts[1] === '9' && parts[2]) {
        out.type = 'screen-size'
        out.size = {
          height: +parts[2],
          width: +parts[3]
        }
        out.height = out.size.height
        out.width = out.size.width
        // LEGACY
        out.screenSizeCharacters = out.size
        this.emit(RESPONSE, out)
        this.emit(`response ${out.event}`, out)
        return
      }
      out.type = 'error'
      out.text = `Unhandled: ${JSON.stringify(parts)}`
      // LEGACY
      out.error = out.text
      this.emit(RESPONSE, out)
      this.emit(`response ${out.event}`, out)
      return
    }
    // rxvt-unicode does not support window manipulation
    //   Result Normal: OSC l/L 0xEF 0xBF 0xBD
    //   Result ASCII: OSC l/L 0x1c (file separator)
    //   Result UTF8->ASCII: OSC l/L 0xFD
    // Test with:
    //   echo -ne '\ePtmux;\e\e[>3t\e\\'
    //   sleep 2 && echo -ne '\ePtmux;\e\e[21t\e\\' & cat -v
    //   -
    //   echo -ne '\e[>3t'
    //   sleep 2 && echo -ne '\e[21t' & cat -v
    if ((parts = /^\x1b\](l|L)([^\x07\x1b]*)$/.exec(s))) {
      parts[2] = 'rxvt'
      s = OSC + `${parts[1]}${parts[2]}\x1b\\`
    }
    // CSI Ps ; Ps ; Ps t
    //   Window manipulation (from dtterm, as well as extensions).
    //   These controls may be disabled using the allowWindowOps
    //   resource.  Valid values for the first (and any additional
    //   parameters) are:
    //     Ps = 2 0  -> Report xterm window's icon label.  Result is
    //     OSC  L  label ST
    //     Ps = 2 1  -> Report xterm window's title.  Result is OSC  l
    //     label ST
    if ((parts = /^\x1b\](l|L)([^\x07\x1b]*)(?:\x07|\x1b\\)/.exec(s))) {
      out.event = 'window-manipulation'
      out.code = ''
      if (parts[1] === 'L') {
        out.type = 'window-icon-label'
        out.text = parts[2]
        // LEGACY
        out.windowIconLabel = out.text
        this.emit(RESPONSE, out)
        this.emit(`response ${out.event}`, out)
        return
      }
      if (parts[1] === 'l') {
        out.type = 'window-title'
        out.text = parts[2]
        // LEGACY
        out.windowTitle = out.text
        this.emit(RESPONSE, out)
        this.emit(`response ${out.event}`, out)
        return
      }
      out.type = 'error'
      out.text = `Unhandled: ${JSON.stringify(parts)}`
      // LEGACY
      out.error = out.text
      this.emit(RESPONSE, out)
      this.emit(`response ${out.event}`, out)
      return
    }
    // CSI Ps ' |
    //   Request Locator Position (DECRQLP).
    //     -> CSI Pe ; Pb ; Pr ; Pc ; Pp &  w
    //   Parameters are [event;button;row;column;page].
    //   Valid values for the event:
    //     Pe = 0  -> locator unavailable - no other parameters sent.
    //     Pe = 1  -> request - xterm received a DECRQLP.
    //     Pe = 2  -> left button down.
    //     Pe = 3  -> left button up.
    //     Pe = 4  -> middle button down.
    //     Pe = 5  -> middle button up.
    //     Pe = 6  -> right button down.
    //     Pe = 7  -> right button up.
    //     Pe = 8  -> M4 button down.
    //     Pe = 9  -> M4 button up.
    //     Pe = 1 0  -> locator outside filter rectangle.
    //   ``button'' parameter is a bitmask indicating which buttons are
    //     pressed:
    //     Pb = 0  <- no buttons down.
    //     Pb & 1  <- right button down.
    //     Pb & 2  <- middle button down.
    //     Pb & 4  <- left button down.
    //     Pb & 8  <- M4 button down.
    //   ``row'' and ``column'' parameters are the coordinates of the
    //     locator position in the xterm window, encoded as ASCII deci-
    //     mal.
    //   The ``page'' parameter is not used by xterm, and will be omit-
    //   ted.
    // NOTE:
    // This is already implemented in the #bindMouse
    // method, but it might make more sense here.
    // The xterm mouse documentation says there is a
    // `<` prefix, the DECRQLP says there is no prefix.
    if ((parts = /^\x1b\[(\d+(?:;\d+){4})&w/.exec(s))) {
      parts = parts[1].split(SC).map(ch => +ch)
      out.event = 'locator-position'
      out.code = 'DECRQLP'
      switch (parts[0]) {
        case 0:
          out.status = 'locator-unavailable'
          break
        case 1:
          out.status = 'request'
          break
        case 2:
          out.status = 'left-button-down'
          break
        case 3:
          out.status = 'left-button-up'
          break
        case 4:
          out.status = 'middle-button-down'
          break
        case 5:
          out.status = 'middle-button-up'
          break
        case 6:
          out.status = 'right-button-down'
          break
        case 7:
          out.status = 'right-button-up'
          break
        case 8:
          out.status = 'm4-button-down'
          break
        case 9:
          out.status = 'm4-button-up'
          break
        case 10:
          out.status = 'locator-outside'
          break
      }
      out.mask = parts[1]
      out.row = parts[2]
      out.col = parts[3]
      out.page = parts[4]
      // LEGACY
      out.locatorPosition = out
      this.emit(RESPONSE, out)
      this.emit(`response ${out.event}`, out)
      return
    }
    // OSC Ps ; Pt BEL
    // OSC Ps ; Pt ST
    // Set Text Parameters
    if ((parts = /^\x1b\](\d+);([^\x07\x1b]+)(?:\x07|\x1b\\)/.exec(s))) {
      out.event = 'text-params'
      out.code = 'Set Text Parameters'
      out.ps = +s[1]
      out.pt = s[2]
      this.emit(RESPONSE, out)
      this.emit(`response ${out.event}`, out)
    }
  }
  response(name, text, callback, noBypass) {
    const self = this
    if (arguments.length === 2) {
      callback = text
      text = name
      name = null
    }
    if (!callback) callback = () => {}
    this.bindResponse()
    name = name
      ? `response ${name}`
      : RESPONSE
    let responseHandler
    this.once(name, responseHandler = event => {
      if (timeout) clearTimeout(timeout)
      if (event.type === 'error') { return callback(new Error(`${event.event}: ${event.text}`)) }
      return callback(null, event)
    })
    const timeout = setTimeout(() => {
      self.removeListener(name, responseHandler)
      return callback(new Error('Timeout.'))
    }, 2000)
    return noBypass ? this.#write(text) : this.#writeTm(text)
  }

  // #out=this.#out
  write = this.#out
  _write = this.#write
  #out(text) { if (this.output.writable) this.output.write(text) }
  #buffer(text) {
    if (this._exiting) return void (this.flush(), this.#out(text))
    if (this._buf) return void (this._buf += text)
    this._buf = text
    nextTick(this._flush)
    return true
  }
  flush() {
    if (!this._buf) return
    this.#out(this._buf)
    this._buf = ''
  }
  #write(text) { return this.ret ? text : this.useBuffer ? this.#buffer(text) : this.#out(text) }
  #writeTm(data) {
    const self = this
    let
      iter = 0,
      timer
    if (this.tmux) {
      // Replace all STs with BELs so they can be nested within the DCS code.
      data = data.replace(/\x1b\\/g, BEL)
      // Wrap in tmux forward DCS:
      data = `\x1bPtmux;\x1b${data}\x1b\\`
      // If we've never even flushed yet, it means we're still in
      // the normal buffer. Wait for alt screen buffer.
      if (this.output.bytesWritten === 0) {
        timer = setInterval(() => {
          if (self.output.bytesWritten > 0 || ++iter === 50) {
            clearInterval(timer)
            self.flush()
            self.#out(data)
          }
        }, 100)
        return true
      }
      // NOTE: Flushing the buffer is required in some cases.
      // The DCS code must be at the start of the output.
      this.flush()
      // Write out raw now that the buffer is flushed.
      return this.#out(data)
    }
    return this.#write(data)
  }
  print(text, attr) { return attr ? this.#write(this.text(text, attr)) : this.#write(text) }

  recoords() {
    this.x < 0 ? (this.x = 0) : this.x >= this.cols ? (this.x = this.cols - 1) : void 0
    this.y < 0 ? (this.y = 0) : this.y >= this.rows ? (this.y = this.rows - 1) : void 0
  }
  setx(x) { return this.cursorCharAbsolute(x) }
  sety(y) { return this.linePosAbsolute(y) }
  move(x, y) { return this.cursorPos(y, x) }
  omove(x, y) {
    const { zero } = this
    x = !zero ? (x || 1) - 1 : x || 0
    y = !zero ? (y || 1) - 1 : y || 0
    if (y === this.y && x === this.x) { return }
    if (y === this.y) { x > this.x ? this.cuf(x - this.x) : x < this.x ? this.cub(this.x - x) : void 0 }
    else if (x === this.x) { y > this.y ? this.cud(y - this.y) : y < this.y ? this.cuu(this.y - y) : void 0 }
    else {
      if (!zero) x++, y++
      this.cup(y, x)
    }
  }
  rsetx(x) { return !x ? void 0 : x > 0 ? this.forward(x) : this.back(-x) }
  rsety(y) { return !y ? void 0 : y > 0 ? this.up(y) : this.down(-y) } // return this.VPositionRelative(y);
  rmove(x, y) { this.rsetx(x), this.rsety(y) }
  simpleInsert(ch, i, attr) { return this.#write(this.repeat(ch, i), attr) }
  repeat(ch, i) {
    if (!i || i < 0) i = 0
    return Array(i + 1).join(ch)
  }
  copyToClipboard(text) {
    return this.isiTerm2 ? (this.#writeTm(OSC + `50;CopyToCliboard=${text}` + BEL), true) : false
  }
  cursorShape(shape, blink) {
    if (this.isiTerm2) {
      switch (shape) {
        case 'block':
          if (!blink) { this.#writeTm(OSC + '50;CursorShape=0;BlinkingCursorEnabled=0' + BEL) }
          else { this.#writeTm(OSC + '50;CursorShape=0;BlinkingCursorEnabled=1' + BEL) }
          break
        case 'underline':
          // !blink ? this.#writeTm('\x1b]50' + ';CursorShape=n;BlinkingCursorEnabled=0' + BEL) : this.#writeTm('\x1b]50' + ';CursorShape=n;BlinkingCursorEnabled=1' + BEL)
          break
        case 'line':
          !blink ? this.#writeTm(OSC + '50;CursorShape=1;BlinkingCursorEnabled=0' + BEL) : this.#writeTm(OSC + '50' + ';CursorShape=1;BlinkingCursorEnabled=1' + BEL)
          break
      }
      return true
    }
    else if (this.term('xterm') || this.term('screen')) {
      switch (shape) {
        case 'block':
          if (!blink) {
            this.#writeTm(CSI + '0 q')
          }
          else {
            this.#writeTm(CSI + '1 q')
          }
          break
        case 'underline':
          if (!blink) {
            this.#writeTm(CSI + '2 q')
          }
          else {
            this.#writeTm(CSI + '3 q')
          }
          break
        case 'line':
          if (!blink) {
            this.#writeTm(CSI + '4 q')
          }
          else {
            this.#writeTm(CSI + '5 q')
          }
          break
      }
      return true
    }
    return false
  }
  cursorColor(color) {
    if (this.term('xterm') || this.term('rxvt') || this.term('screen')) {
      this.#writeTm(OSC + `12;${color}` + BEL)
      return true
    }
    return false
  }
  cursorReset = this.resetCursor
  resetCursor() {
    if (this.term('xterm') || this.term('rxvt') || this.term('screen')) {
      // XXX
      // return this.resetColors();
      this.#writeTm(CSI + '0 q')
      this.#writeTm(OSC + '112' + BEL)
      // urxvt doesnt support OSC 112
      this.#writeTm(OSC + '' + '12;white' + BEL)
      return true
    }
    return false
  }
  getTextParams(param, callback) {
    return this.response('text-params', OSC + `${param};?` + BEL,
      (err, data) => err ? callback(err) : callback(null, data.pt))
  }
  getCursorColor(callback) { return this.getTextParams(12, callback) }

  /**
   * Normal
   */
  nul() {
    //if (this.has('pad')) return this.put.pad();
    return this.#write('\x80')
  }
  bel = this.bell
  bell() { return this.has('bel') ? this.put.bel() : this.#write(BEL) }
  // CSI Pm h  Set Mode (SM).
  //     Ps = 2  -> Keyboard Action Mode (AM).
  //     Ps = 4  -> Insert Mode (IRM).
  //     Ps = 1 2  -> Send/receive (SRM).
  //     Ps = 2 0  -> Automatic Newline (LNM).
  // CSI ? Pm h
  //   DEC Private Mode Set (DECSET).
  //     Ps = 1  -> Application Cursor Keys (DECCKM).
  //     Ps = 2  -> Designate USASCII for character sets G0-G3
  //     (DECANM), and set VT100 mode.
  //     Ps = 3  -> 132 Column Mode (DECCOLM).
  //     Ps = 4  -> Smooth (Slow) Scroll (DECSCLM).
  //     Ps = 5  -> Reverse Video (DECSCNM).
  //     Ps = 6  -> Origin Mode (DECOM).
  //     Ps = 7  -> Wraparound Mode (DECAWM).
  //     Ps = 8  -> Auto-repeat Keys (DECARM).
  //     Ps = 9  -> Send Mouse X & Y on button press.  See the sec-
  //     tion Mouse Tracking.
  //     Ps = 1 0  -> Show toolbar (rxvt).
  //     Ps = 1 2  -> Start Blinking Cursor (att610).
  //     Ps = 1 8  -> Print form feed (DECPFF).
  //     Ps = 1 9  -> Set print extent to full screen (DECPEX).
  //     Ps = 2 5  -> Show Cursor (DECTCEM).
  //     Ps = 3 0  -> Show scrollbar (rxvt).
  //     Ps = 3 5  -> Enable font-shifting functions (rxvt).
  //     Ps = 3 8  -> Enter Tektronix Mode (DECTEK).
  //     Ps = 4 0  -> Allow 80 -> 132 Mode.
  //     Ps = 4 1  -> more(1) fix (see curses resource).
  //     Ps = 4 2  -> Enable Nation Replacement Character sets (DECN-
  //     RCM).
  //     Ps = 4 4  -> Turn On Margin Bell.
  //     Ps = 4 5  -> Reverse-wraparound Mode.
  //     Ps = 4 6  -> Start Logging.  This is normally disabled by a
  //     compile-time option.
  //     Ps = 4 7  -> Use Alternate Screen Buffer.  (This may be dis-
  //     abled by the titeInhibit resource).
  //     Ps = 6 6  -> Application keypad (DECNKM).
  //     Ps = 6 7  -> Backarrow key sends backspace (DECBKM).
  //     Ps = 1 0 0 0  -> Send Mouse X & Y on button press and
  //     release.  See the section Mouse Tracking.
  //     Ps = 1 0 0 1  -> Use Hilite Mouse Tracking.
  //     Ps = 1 0 0 2  -> Use Cell Motion Mouse Tracking.
  //     Ps = 1 0 0 3  -> Use All Motion Mouse Tracking.
  //     Ps = 1 0 0 4  -> Send FocusIn/FocusOut events.
  //     Ps = 1 0 0 5  -> Enable Extended Mouse Mode.
  //     Ps = 1 0 1 0  -> Scroll to bottom on tty output (rxvt).
  //     Ps = 1 0 1 1  -> Scroll to bottom on key press (rxvt).
  //     Ps = 1 0 3 4  -> Interpret "meta" key, sets eighth bit.
  //     (enables the eightBitInput resource).
  //     Ps = 1 0 3 5  -> Enable special modifiers for Alt and Num-
  //     Lock keys.  (This enables the numLock resource).
  //     Ps = 1 0 3 6  -> Send ESC   when Meta modifies a key.  (This
  //     enables the metaSendsEscape resource).
  //     Ps = 1 0 3 7  -> Send DEL from the editing-keypad Delete
  //     key.
  //     Ps = 1 0 3 9  -> Send ESC  when Alt modifies a key.  (This
  //     enables the altSendsEscape resource).
  //     Ps = 1 0 4 0  -> Keep selection even if not highlighted.
  //     (This enables the keepSelection resource).
  //     Ps = 1 0 4 1  -> Use the CLIPBOARD selection.  (This enables
  //     the selectToClipboard resource).
  //     Ps = 1 0 4 2  -> Enable Urgency window manager hint when
  //     Control-G is received.  (This enables the bellIsUrgent
  //     resource).
  //     Ps = 1 0 4 3  -> Enable raising of the window when Control-G
  //     is received.  (enables the popOnBell resource).
  //     Ps = 1 0 4 7  -> Use Alternate Screen Buffer.  (This may be
  //     disabled by the titeInhibit resource).
  //     Ps = 1 0 4 8  -> Save cursor as in DECSC.  (This may be dis-
  //     abled by the titeInhibit resource).
  //     Ps = 1 0 4 9  -> Save cursor as in DECSC and use Alternate
  //     Screen Buffer, clearing it first.  (This may be disabled by
  //     the titeInhibit resource).  This combines the effects of the 1
  //     0 4 7  and 1 0 4 8  modes.  Use this with terminfo-based
  //     applications rather than the 4 7  mode.
  //     Ps = 1 0 5 0  -> Set terminfo/termcap function-key mode.
  //     Ps = 1 0 5 1  -> Set Sun function-key mode.
  //     Ps = 1 0 5 2  -> Set HP function-key mode.
  //     Ps = 1 0 5 3  -> Set SCO function-key mode.
  //     Ps = 1 0 6 0  -> Set legacy keyboard emulation (X11R6).
  //     Ps = 1 0 6 1  -> Set VT220 keyboard emulation.
  //     Ps = 2 0 0 4  -> Set bracketed paste mode.
  // Modes:
  vtab() {
    this.y++
    this.recoords()
    return this.#write('\x0b')
  }
  ff = this.form
  form() {
    if (this.has('ff')) return this.put.ff()
    return this.#write('\x0c')
  }
  kbs = this.backspace
  backspace() {
    this.x--
    this.recoords()
    if (this.has('kbs')) return this.put.kbs()
    return this.#write('\x08')
  }
  ht = this.tab
  tab() {
    this.x += 8
    this.recoords()
    if (this.has('ht')) return this.put.ht()
    return this.#write('\t')
  }
  shiftOut() {
    // if (this.has('S2')) return this.put.S2();
    return this.#write('\x0e')
  }
  shiftIn() {
    // if (this.has('S3')) return this.put.S3();
    return this.#write('\x0f')
  }
  cr = this.return
  return() {
    this.x = 0
    if (this.has('cr')) return this.put.cr()
    return this.#write('\r')
  }
  nel = this.feed
  newline = this.feed
  feed() {
    if (this.tput && this.tput.bools.eat_newline_glitch && this.x >= this.cols) return
    this.x = 0
    this.y++
    this.recoords()
    if (this.has('nel')) return this.put.nel()
    return this.#write('\n')
  }
  ind = this.index
  index() {
    this.y++
    this.recoords()
    if (this.tput) return this.put.ind()
    return this.#write('\x1bD')
  }
  ri = this.reverseIndex
  reverse = this.reverseIndex
  reverseIndex() {
    this.y--
    this.recoords()
    if (this.tput) return this.put.ri()
    return this.#write('\x1bM')
  }
  // CSI Pm l  Reset Mode (RM).
  //     Ps = 2  -> Keyboard Action Mode (AM).
  //     Ps = 4  -> Replace Mode (IRM).
  //     Ps = 1 2  -> Send/receive (SRM).
  //     Ps = 2 0  -> Normal Linefeed (LNM).
  // CSI ? Pm l
  //   DEC Private Mode Reset (DECRST).
  //     Ps = 1  -> Normal Cursor Keys (DECCKM).
  //     Ps = 2  -> Designate VT52 mode (DECANM).
  //     Ps = 3  -> 80 Column Mode (DECCOLM).
  //     Ps = 4  -> Jump (Fast) Scroll (DECSCLM).
  //     Ps = 5  -> Normal Video (DECSCNM).
  //     Ps = 6  -> Normal Cursor Mode (DECOM).
  //     Ps = 7  -> No Wraparound Mode (DECAWM).
  //     Ps = 8  -> No Auto-repeat Keys (DECARM).
  //     Ps = 9  -> Don't send Mouse X & Y on button press.
  //     Ps = 1 0  -> Hide toolbar (rxvt).
  //     Ps = 1 2  -> Stop Blinking Cursor (att610).
  //     Ps = 1 8  -> Don't print form feed (DECPFF).
  //     Ps = 1 9  -> Limit print to scrolling region (DECPEX).
  //     Ps = 2 5  -> Hide Cursor (DECTCEM).
  //     Ps = 3 0  -> Don't show scrollbar (rxvt).
  //     Ps = 3 5  -> Disable font-shifting functions (rxvt).
  //     Ps = 4 0  -> Disallow 80 -> 132 Mode.
  //     Ps = 4 1  -> No more(1) fix (see curses resource).
  //     Ps = 4 2  -> Disable Nation Replacement Character sets (DEC-
  //     NRCM).
  //     Ps = 4 4  -> Turn Off Margin Bell.
  //     Ps = 4 5  -> No Reverse-wraparound Mode.
  //     Ps = 4 6  -> Stop Logging.  (This is normally disabled by a
  //     compile-time option).
  //     Ps = 4 7  -> Use Normal Screen Buffer.
  //     Ps = 6 6  -> Numeric keypad (DECNKM).
  //     Ps = 6 7  -> Backarrow key sends delete (DECBKM).
  //     Ps = 1 0 0 0  -> Don't send Mouse X & Y on button press and
  //     release.  See the section Mouse Tracking.
  //     Ps = 1 0 0 1  -> Don't use Hilite Mouse Tracking.
  //     Ps = 1 0 0 2  -> Don't use Cell Motion Mouse Tracking.
  //     Ps = 1 0 0 3  -> Don't use All Motion Mouse Tracking.
  //     Ps = 1 0 0 4  -> Don't send FocusIn/FocusOut events.
  //     Ps = 1 0 0 5  -> Disable Extended Mouse Mode.
  //     Ps = 1 0 1 0  -> Don't scroll to bottom on tty output
  //     (rxvt).
  //     Ps = 1 0 1 1  -> Don't scroll to bottom on key press (rxvt).
  //     Ps = 1 0 3 4  -> Don't interpret "meta" key.  (This disables
  //     the eightBitInput resource).
  //     Ps = 1 0 3 5  -> Disable special modifiers for Alt and Num-
  //     Lock keys.  (This disables the numLock resource).
  //     Ps = 1 0 3 6  -> Don't send ESC  when Meta modifies a key.
  //     (This disables the metaSendsEscape resource).
  //     Ps = 1 0 3 7  -> Send VT220 Remove from the editing-keypad
  //     Delete key.
  //     Ps = 1 0 3 9  -> Don't send ESC  when Alt modifies a key.
  //     (This disables the altSendsEscape resource).
  //     Ps = 1 0 4 0  -> Do not keep selection when not highlighted.
  //     (This disables the keepSelection resource).
  //     Ps = 1 0 4 1  -> Use the PRIMARY selection.  (This disables
  //     the selectToClipboard resource).
  //     Ps = 1 0 4 2  -> Disable Urgency window manager hint when
  //     Control-G is received.  (This disables the bellIsUrgent
  //     resource).
  //     Ps = 1 0 4 3  -> Disable raising of the window when Control-
  //     G is received.  (This disables the popOnBell resource).
  //     Ps = 1 0 4 7  -> Use Normal Screen Buffer, clearing screen
  //     first if in the Alternate Screen.  (This may be disabled by
  //     the titeInhibit resource).
  //     Ps = 1 0 4 8  -> Restore cursor as in DECRC.  (This may be
  //     disabled by the titeInhibit resource).
  //     Ps = 1 0 4 9  -> Use Normal Screen Buffer and restore cursor
  //     as in DECRC.  (This may be disabled by the titeInhibit
  //     resource).  This combines the effects of the 1 0 4 7  and 1 0
  //     4 8  modes.  Use this with terminfo-based applications rather
  //     than the 4 7  mode.
  //     Ps = 1 0 5 0  -> Reset terminfo/termcap function-key mode.
  //     Ps = 1 0 5 1  -> Reset Sun function-key mode.
  //     Ps = 1 0 5 2  -> Reset HP function-key mode.
  //     Ps = 1 0 5 3  -> Reset SCO function-key mode.
  //     Ps = 1 0 6 0  -> Reset legacy keyboard emulation (X11R6).
  //     Ps = 1 0 6 1  -> Reset keyboard emulation to Sun/PC style.
  // ESC E Next Line (NEL is 0x85).
  nextLine() {
    this.y++
    this.x = 0
    this.recoords()
    if (this.has('nel')) return this.put.nel()
    return this.#write('\x1bE')
  }
  // ESC c Full Reset (RIS).
  reset() {
    this.x = this.y = 0
    if (this.has('rs1') || this.has('ris')) {
      return this.has('rs1')
        ? this.put.rs1()
        : this.put.ris()
    }
    return this.#write('\x1bc')
  }
  // ESC H Tab Set (HTS is 0x88).
  tabSet() { return this.tput ? this.put.hts() : this.#write('\x1bH') }
  sc = this.saveCursor
  saveCursor(key) {
    if (key) return this.lsaveCursor(key)
    this.savedX = this.x || 0
    this.savedY = this.y || 0
    if (this.tput) return this.put.sc()
    return this.#write('\x1b7')
  }
  rc = this.restoreCursor
  restoreCursor(key, hide) {
    if (key) return this.lrestoreCursor(key, hide)
    this.x = this.savedX || 0
    this.y = this.savedY || 0
    if (this.tput) return this.put.rc()
    return this.#write('\x1b8')
  }
  // Save Cursor Locally
  lsaveCursor(key) {
    key = key || 'local'
    this._saved = this._saved || {}
    this._saved[key] = this._saved[key] || {}
    this._saved[key].x = this.x
    this._saved[key].y = this.y
    this._saved[key].hidden = this.cursorHidden
  }
  // Restore Cursor Locally
  lrestoreCursor(key, hide) {
    let pos
    key = key || 'local'
    if (!this._saved || !this._saved[key]) return
    pos = this._saved[key]
    //delete this._saved[key];
    this.cup(pos.y, pos.x)
    if (hide && pos.hidden !== this.cursorHidden)
      pos.hidden ? this.hideCursor() : this.showCursor()
  }
  // ESC # 3 DEC line height/width
  lineHeight() { return this.#write('\x1b#') }
  // ESC (,),*,+,-,. Designate G0-G2 Character Set.
  charset(val, level) {
    level = level || 0
    // See also:
    // acs_chars / acsc / ac
    // enter_alt_charset_mode / smacs / as
    // exit_alt_charset_mode / rmacs / ae
    // enter_pc_charset_mode / smpch / S2
    // exit_pc_charset_mode / rmpch / S3

    switch (level) {
      case 0:
        level = '('
        break
      case 1:
        level = ')'
        break
      case 2:
        level = '*'
        break
      case 3:
        level = '+'
        break
    }
    const name = typeof val === STR
      ? val.toLowerCase()
      : val

    switch (name) {
      case 'acs':
      case 'scld': // DEC Special Character and Line Drawing Set.
        if (this.tput) return this.put.smacs()
        val = '0'
        break
      case 'uk': // UK
        val = 'A'
        break
      case 'us': // United States (USASCII).
      case 'usascii':
      case 'ascii':
        if (this.tput) return this.put.rmacs()
        val = 'B'
        break
      case 'dutch': // Dutch
        val = '4'
        break
      case 'finnish': // Finnish
        val = 'C'
        val = '5'
        break
      case 'french': // French
        val = 'R'
        break
      case 'frenchcanadian': // FrenchCanadian
        val = 'Q'
        break
      case 'german':  // German
        val = 'K'
        break
      case 'italian': // Italian
        val = 'Y'
        break
      case 'norwegiandanish': // NorwegianDanish
        val = 'E'
        val = '6'
        break
      case 'spanish': // Spanish
        val = 'Z'
        break
      case 'swedish': // Swedish
        val = 'H'
        val = '7'
        break
      case 'swiss': // Swiss
        val = '='
        break
      case 'isolatin': // ISOLatin (actually /A)
        val = '/A'
        break
      default: // Default
        if (this.tput) return this.put.rmacs()
        val = 'B'
        break
    }
    return this.#write(`\x1b(${val}`)
  }

  enter_alt_charset_mode = this.smacs
  as = this.smacs
  smacs() { return this.charset('acs') }

  exit_alt_charset_mode = this.rmacs
  ae = this.rmacs
  rmacs() { return this.charset('ascii') }
  // Invoke the G1 Character Set as GR (LS1R).
  setG(val) {
    // if (this.tput) return this.put.S2();
    // if (this.tput) return this.put.S3();
    switch (val) {
      case 1:
        val = '~' // GR
        break
      case 2:
        val = 'n' // GL
        val = '}' // GR
        val = 'N' // Next Char Only
        break
      case 3:
        val = 'o' // GL
        val = '|' // GR
        val = 'O' // Next Char Only
        break
    }
    return this.#write(ESC + val)
  }
  /**
   * OSC
   */

  // OSC Ps ; Pt ST
  // OSC Ps ; Pt BEL
  //   Set Text Parameters.
  setTitle(title) {
    this._title = title
    // if (this.term('screen')) {
    //   // Tmux pane
    //   // if (this.tmux) {
    //   //   return this.#write(OSC + '2;' + title + '\x1b\\');
    //   // }
    //   return this.#write('\x1bk' + title + '\x1b\\');
    // }
    return this.#writeTm(OSC + `0;${title}` + BEL)
  }
  // CSI Ps ; Ps r
  //   Set Scrolling Region [top;bottom] (default = full size of win-
  //   dow) (DECSTBM).
  //   Reset colors
  resetColors(param) {
    return this.has('Cr') ? this.put.Cr(param) : this.#writeTm(OSC + '112' + BEL)
    //return this.#writeTm(OSC + '112;' + param + BEL);
  }
  //   Change dynamic colors
  dynamicColors(param) {
    return this.has('Cs') ? this.put.Cs(param) : this.#writeTm(OSC + `12;${param}` + BEL)
  }
  // Sel data
  selData(a, b) {
    return this.has('Ms')
      ? this.put.Ms(a, b)
      : this.#writeTm(OSC + `52;${a};${b}` + BEL)
  }

  /**
   * CSI
   */

  // CSI Ps A
  // Cursor Up Ps Times (default = 1) (CUU).
  cuu = this.cursorUp
  up = this.cursorUp
  cursorUp(n) {
    this.y -= n || 1
    this.recoords()
    return !this.tput
      ? this.#write(CSI + (n || '') + _CUU)
      : !this.tput.strings.parm_up_cursor
        ? this.#write(this.repeat(this.tput.cuu1(), n))
        : this.put.cuu(n)
  }
  // CSI Ps B
  // Cursor Down Ps Times (default = 1) (CUD).
  cud = this.cursorDown
  down = this.cursorDown
  cursorDown(n) {
    this.y += n || 1
    this.recoords()
    return !this.tput
      ? this.#write(CSI + (n || '') + 'B')
      : !this.tput.strings.parm_down_cursor
        ? this.#write(this.repeat(this.tput.cud1(), n))
        : this.put.cud(n)
  }
  // CSI Ps C
  // Cursor Forward Ps Times (default = 1) (CUF).
  cuf = this.cursorForward
  right = this.cursorForward
  forward = this.cursorForward
  cursorForward(n) {
    this.x += n || 1
    this.recoords()
    return !this.tput
      ? this.#write(CSI + (n || '') + 'C')
      : !this.tput.strings.parm_right_cursor
        ? this.#write(this.repeat(this.tput.cuf1(), n))
        : this.put.cuf(n)
  }
  // CSI Ps D
  // Cursor Backward Ps Times (default = 1) (CUB).
  cub = this.cursorBackward
  left = this.cursorBackward
  back = this.cursorBackward
  cursorBackward(n) {
    this.x -= n || 1
    this.recoords()
    return !this.tput
      ? this.#write(CSI + (n || '') + 'D')
      : !this.tput.strings.parm_left_cursor
        ? this.#write(this.repeat(this.tput.cub1(), n))
        : this.put.cub(n)
  }

  // XTerm mouse events
  // http://invisible-island.net/xterm/ctlseqs/ctlseqs.html#Mouse%20Tracking
  // To better understand these
  // the xterm code is very helpful:
  // Relevant files:
  //   button.c, charproc.c, misc.c
  // Relevant functions in xterm/button.c:
  //   BtnCode, EmitButtonCode, EditorButton, SendMousePosition
  // send a mouse event:
  // regular/utf8: ^[[M Cb Cx Cy
  // urxvt: ^[[ Cb ; Cx ; Cy M
  // sgr: ^[[ Cb ; Cx ; Cy M/m
  // vt300: ^[[ 24(1/3/5)~ [ Cx , Cy ] \r
  // locator: CSI P e ; P b ; P r ; P c ; P p & w
  // motion example of a left click:
  // ^[[M 3<^[[M@4<^[[M@5<^[[M@6<^[[M@7<^[[M#7<
  // mouseup, mousedown, mousewheel

  // Cursor Position [row;column] (default = [1,1]) (CUP).
  cup = this.cursorPos
  pos = this.cursorPos
  cursorPos(r, c) {
    const { zero } = this
    this.x = c = !zero ? (c || 1) - 1 : c || 0
    this.y = r = !zero ? (r || 1) - 1 : r || 0
    this.recoords()
    return this.tput
      ? this.put.cup(r, c)
      : this.#write(CSI + `${r + 1};${c + 1}` + _CUP)
  }

  ed = this.eraseInDisplay
  eraseInDisplay(param) {
    if (this.tput) {
      switch (param) {
        case 'above':
          param = 1
          break
        case 'all':
          param = 2
          break
        case 'saved':
          param = 3
          break
        case 'below':
        default:
          param = 0
          break
      }
      // extended tput.E3 = ^[[3;J
      return this.put.ed(param)
    }
    switch (param) {
      case 'above':
        return this.#write(CSI + '1' + _ED)
      case 'all':
        return this.#write(CSI + '2' + _ED)
      case 'saved':
        return this.#write(CSI + '3' + _ED)
      case 'below':
      default:
        return this.#write(CSI + _ED)
    }
  }
  clear() {
    this.x = 0
    this.y = 0
    return this.tput ? this.put.clear() : this.#write(CSI + _CUP + CSI + _ED)
  }

  el = this.eraseInLine
  eraseInLine(param) {
    if (this.tput) {
      //if (this.tput.back_color_erase) ...
      switch (param) {
        case LEFT:
          param = 1
          break
        case 'all':
          param = 2
          break
        case RIGHT:
        default:
          param = 0
          break
      }
      return this.put.el(param)
    }
    switch (param) {
      case LEFT:
        return this.#write(CSI + '1K')
      case 'all':
        return this.#write(CSI + '2K')
      case RIGHT:
      default:
        return this.#write(CSI + 'K')
    }
  }

  sgr = this.charAttributes
  attr = this.charAttributes
  charAttributes(param, val) { return this.#write(this._attr(param, val)) }
  text(text, attr) { return this._attr(attr, true) + text + this._attr(attr, false) }

  _attr(param, val) {
    const self = this
    let parts,
        color,
        m
    if (Array.isArray(param)) {
      parts = param
      param = parts[0] || 'normal'
    }
    else {
      param = param || 'normal'
      parts = param.split(/\s*[,;]\s*/)
    }
    if (parts.length > 1) {
      const used = {},
            out  = []
      parts.forEach(function (part) {
        part = self._attr(part, val).slice(2, -1)
        if (part === '') return
        if (used[part]) return
        used[part] = true
        out.push(part)
      })
      return CSI + `${out.join(SC)}m`
    }
    if (param.indexOf('no ') === 0) {
      param = param.substring(3)
      val = false
    }
    else if (param.indexOf('!') === 0) {
      param = param.substring(1)
      val = false
    }
    switch (param) {
      // attributes
      case 'normal':
      case 'default':
        return val === false ? '' : CSI + _SGR
      case 'bold':
        return val === false ? CSI + '22' + _SGR : CSI + '1' + _SGR
      case 'ul':
      case 'underline':
      case 'underlined':
        return val === false ? CSI + '24' + _SGR : CSI + '4' + _SGR
      case 'blink':
        return val === false ? CSI + '25' + _SGR : CSI + '5' + _SGR
      case 'inverse':
        return val === false ? CSI + '27' + _SGR : CSI + '7' + _SGR
      case 'invisible':
        return val === false ? CSI + '28' + _SGR : CSI + '8' + _SGR
      // 8-color foreground
      case 'black fg':
        return val === false ? CSI + '39' + _SGR : CSI + '30' + _SGR
      case 'red fg':
        return val === false ? CSI + '39' + _SGR : CSI + '31' + _SGR
      case 'green fg':
        return val === false ? CSI + '39' + _SGR : CSI + '32' + _SGR
      case 'yellow fg':
        return val === false ? CSI + '39' + _SGR : CSI + '33' + _SGR
      case 'blue fg':
        return val === false ? CSI + '39' + _SGR : CSI + '34' + _SGR
      case 'magenta fg':
        return val === false ? CSI + '39' + _SGR : CSI + '35' + _SGR
      case 'cyan fg':
        return val === false ? CSI + '39' + _SGR : CSI + '36' + _SGR
      case 'white fg':
      case 'light grey fg':
      case 'light gray fg':
      case 'bright grey fg':
      case 'bright gray fg':
        return val === false ? CSI + '39' + _SGR : CSI + '37' + _SGR
      case 'default fg':
        return val === false ? '' : CSI + '39' + _SGR
      // 8-color background
      case 'black bg':
        return val === false ? CSI + '49' + _SGR : CSI + '40' + _SGR
      case 'red bg':
        return val === false ? CSI + '49' + _SGR : CSI + '41' + _SGR
      case 'green bg':
        return val === false ? CSI + '49' + _SGR : CSI + '42' + _SGR
      case 'yellow bg':
        return val === false ? CSI + '49' + _SGR : CSI + '43' + _SGR
      case 'blue bg':
        return val === false ? CSI + '49' + _SGR : CSI + '44' + _SGR
      case 'magenta bg':
        return val === false ? CSI + '49' + _SGR : CSI + '45' + _SGR
      case 'cyan bg':
        return val === false ? CSI + '49' + _SGR : CSI + '46' + _SGR
      case 'white bg':
      case 'light grey bg':
      case 'light gray bg':
      case 'bright grey bg':
      case 'bright gray bg':
        return val === false ? CSI + '49' + _SGR : CSI + '47' + _SGR
      case 'default bg':
        return val === false ? '' : CSI + '49' + _SGR
      // 16-color foreground
      case 'light black fg':
      case 'bright black fg':
      case 'grey fg':
      case 'gray fg':
        return val === false ? CSI + '39' + _SGR : CSI + '90' + _SGR
      case 'light red fg':
      case 'bright red fg':
        return val === false ? CSI + '39' + _SGR : CSI + '91' + _SGR
      case 'light green fg':
      case 'bright green fg':
        return val === false ? CSI + '39' + _SGR : CSI + '92' + _SGR
      case 'light yellow fg':
      case 'bright yellow fg':
        return val === false ? CSI + '39' + _SGR : CSI + '93' + _SGR
      case 'light blue fg':
      case 'bright blue fg':
        return val === false ? CSI + '39' + _SGR : CSI + '94' + _SGR
      case 'light magenta fg':
      case 'bright magenta fg':
        return val === false ? CSI + '39' + _SGR : CSI + '95' + _SGR
      case 'light cyan fg':
      case 'bright cyan fg':
        return val === false ? CSI + '39' + _SGR : CSI + '96' + _SGR
      case 'light white fg':
      case 'bright white fg':
        return val === false ? CSI + '39' + _SGR : CSI + '97' + _SGR
      // 16-color background
      case 'light black bg':
      case 'bright black bg':
      case 'grey bg':
      case 'gray bg':
        return val === false ? CSI + '49' + _SGR : CSI + '100' + _SGR
      case 'light red bg':
      case 'bright red bg':
        return val === false ? CSI + '49' + _SGR : CSI + '101' + _SGR
      case 'light green bg':
      case 'bright green bg':
        return val === false ? CSI + '49' + _SGR : CSI + '102' + _SGR
      case 'light yellow bg':
      case 'bright yellow bg':
        return val === false ? CSI + '49' + _SGR : CSI + '103' + _SGR
      case 'light blue bg':
      case 'bright blue bg':
        return val === false ? CSI + '49' + _SGR : CSI + '104' + _SGR
      case 'light magenta bg':
      case 'bright magenta bg':
        return val === false ? CSI + '49' + _SGR : CSI + '105' + _SGR
      case 'light cyan bg':
      case 'bright cyan bg':
        return val === false ? CSI + '49' + _SGR : CSI + '106' + _SGR
      case 'light white bg':
      case 'bright white bg':
        return val === false ? CSI + '49' + _SGR : CSI + '107' + _SGR
      // non-16-color rxvt default fg and bg
      case 'default fg bg':
        return val === false ? '' : this.term('rxvt') ? CSI + '100' + _SGR : CSI + '39;49' + _SGR
      default:
        // 256-color fg and bg
        if (param[0] === '#') param = param.replace(/#(?:[0-9a-f]{3}){1,2}/i, colors.match)
        m = /^(-?\d+) (fg|bg)$/.exec(param)
        if (m) {
          color = +m[1]
          if (val === false || color === -1) { return this._attr(`default ${m[2]}`) }
          color = colors.reduce(color, this.tput.colors)
          if (color < 16 || (this.tput && this.tput.colors <= 16)) {
            if (m[2] === 'fg') {
              if (color < 8) { color += 30 }
              else if (color < 16) {
                color -= 8
                color += 90
              }
            }
            else if (m[2] === 'bg') {
              if (color < 8) { color += 40 }
              else if (color < 16) {
                color -= 8
                color += 100
              }
            }
            return CSI + `${color}m`
          }
          if (m[2] === 'fg') { return CSI + `38;5;${color}m` }
          if (m[2] === 'bg') { return CSI + `48;5;${color}m` }
        }
        if (/^[\d;]*$/.test(param)) { return CSI + `${param}m` }
        return null
    }
  }

  fg = this.setForeground
  setForeground(color, val) {
    color = `${color.split(/\s*[,;]\s*/).join(' fg, ')} fg`
    return this.attr(color, val)
  }

  bg = this.setBackground
  setBackground(color, val) {
    color = `${color.split(/\s*[,;]\s*/).join(' bg, ')} bg`
    return this.attr(color, val)
  }

  dsr = this.deviceStatus
  deviceStatus(param, callback, dec, noBypass) {
    return dec
      ? this.response('device-status', CSI + `?${param || '0'}n`, callback, noBypass)
      : this.response('device-status', CSI + `${param || '0'}n`, callback, noBypass)
  }
  getCursor(callback) { return this.deviceStatus(6, callback, false, true) }
  saveReportedCursor(callback) {
    const self = this
    if (this.tput.strings.user7 === CSI + '6n' || this.term('screen')) {
      return this.getCursor(function (err, data) {
        if (data) { (self._rx = data.status.x), (self._ry = data.status.y) }
        return callback ? callback(err) : void 0
      })
    }
    return callback ? callback() : void 0
  }
  // CSI Ps g  Tab Clear (TBC).
  //     Ps = 0  -> Clear Current Column (default).
  //     Ps = 3  -> Clear All.
  // Potentially:
  //   Ps = 2  -> Clear Stops on Line.
  restoreReportedCursor() {
    if (this._rx == null) return
    return this.cup(this._ry, this._rx)
    // return this.nel();
  }

  /**
   * Additions
   */

  ich = this.insertChars
  insertChars(param) {
    this.x += param || 1
    this.recoords()
    if (this.tput) return this.put.ich(param)
    return this.#write(CSI + `${param || 1}@`)
  }

  cnl = this.cursorNextLine
  cursorNextLine(param) {
    this.y += param || 1
    this.recoords()
    return this.#write(CSI + `${param || ''}E`)
  }

  cpl = this.cursorPrecedingLine
  cursorPrecedingLine(param) {
    this.y -= param || 1
    this.recoords()
    return this.#write(CSI + `${param || ''}F`)
  }

  cha = this.cursorCharAbsolute
  cursorCharAbsolute(param) {
    param = !this.zero ? (param || 1) - 1 : param || 0
    this.x = param
    this.y = 0
    this.recoords()
    if (this.tput) return this.put.hpa(param)
    return this.#write(CSI + `${param + 1}G`)
  }

  il = this.insertLines
  insertLines(param) { return this.tput ? this.put.il(param) : this.#write(CSI + `${param || ''}L`) }

  dl = this.deleteLines
  deleteLines(param) { return this.tput ? this.put.dl(param) : this.#write(CSI + `${param || ''}M`) }

  dch = this.deleteChars
  deleteChars(param) { return this.tput ? this.put.dch(param) : this.#write(CSI + `${param || ''}P`) }

  ech = this.deleteChars
  eraseChars(param) { return this.tput ? this.put.ech(param) : this.#write(CSI + `${param || ''}X`) }

  hpa = this.charPosAbsolute
  charPosAbsolute(param) {
    this.x = param || 0
    this.recoords()
    if (this.tput) { return this.put.hpa.apply(this.put, arguments) }
    param = slice.call(arguments).join(SC)
    return this.#write(CSI + `${param || ''}\``)
  }

  hpr = this.HPositionRelative
  HPositionRelative(param) {
    if (this.tput) return this.cuf(param)
    this.x += param || 1
    this.recoords()
    // Does not exist:
    // if (this.tput) return this.put.hpr(param);
    return this.#write(CSI + `${param || ''}a`)
  }

  da = this.sendDeviceAttributes
  sendDeviceAttributes(param, callback) { return this.response('device-attributes', CSI + `${param || ''}c`, callback) }

  vpa = this.linePosAbsolute
  linePosAbsolute(param) {
    this.y = param || 1
    this.recoords()
    if (this.tput) return this.put.vpa.apply(this.put, arguments)
    param = slice.call(arguments).join(SC)
    return this.#write(CSI + `${param || ''}d`)
  }

  vpr = this.VPositionRelative
  VPositionRelative(param) {
    if (this.tput) return this.cud(param)
    this.y += param || 1
    this.recoords()
    // Does not exist:
    // if (this.tput) return this.put.vpr(param);
    return this.#write(CSI + `${param || ''}e`)
  }

  hvp = this.HVPosition
  HVPosition(row, col) {
    if (!this.zero) {
      row = (row || 1) - 1
      col = (col || 1) - 1
    }
    else {
      row = row || 0
      col = col || 0
    }
    this.y = row
    this.x = col
    this.recoords()
    // Does not exist (?):
    // if (this.tput) return this.put.hvp(row, col);
    if (this.tput) return this.put.cup(row, col)
    return this.#write(CSI + `${row + 1};${col + 1}f`)
  }

  sm = this.setMode
  setMode() {
    const param = slice.call(arguments).join(SC)
    return this.#write(CSI + `${param || ''}h`)
  }

  decset() {
    const param = slice.call(arguments).join(SC)
    return this.setMode(`?${param}`)
  }

  dectcem = this.showCursor
  cnorm = this.showCursor
  cvvis = this.showCursor
  showCursor() {
    this.cursorHidden = false
    // NOTE: In xterm terminfo:
    // cnorm stops blinking cursor
    // cvvis starts blinking cursor
    if (this.tput) return this.put.cnorm()
    //if (this.tput) return this.put.cvvis();
    // return this.#write(CSI + '?12l\x1b[?25h'); // cursor_normal
    // return this.#write(CSI + '?12;25h'); // cursor_visible
    return this.setMode('?25')
  }

  alternate = this.alternateBuffer
  smcup = this.alternateBuffer
  alternateBuffer() {
    this.isAlt = true
    if (this.tput) return this.put.smcup()
    if (this.term('vt') || this.term('linux')) return
    this.setMode('?47')
    return this.setMode('?1049')
  }

  rm = this.resetMode
  resetMode() {
    const param = slice.call(arguments).join(SC)
    return this.#write(CSI + `${param || ''}l`)
  }

  decrst() {
    const param = slice.call(arguments).join(SC)
    return this.resetMode(`?${param}`)
  }

  dectcemh = this.hideCursor
  cursor_invisible = this.hideCursor
  vi = this.hideCursor
  civis = this.hideCursor
  hideCursor() {
    this.cursorHidden = true
    if (this.tput) return this.put.civis()
    return this.resetMode('?25')
  }

  rmcup = this.normalBuffer
  normalBuffer() {
    this.isAlt = false
    if (this.tput) return this.put.rmcup()
    this.resetMode('?47')
    return this.resetMode('?1049')
  }
  enableMouse() {
    if (process.env.BLESSED_FORCE_MODES) {
      const modes = process.env.BLESSED_FORCE_MODES.split(',')
      const options = {}
      for (let n = 0; n < modes.length; ++n) {
        const pair = modes[n].split('=')
        const v = pair[1] !== '0'
        switch (pair[0].toUpperCase()) {
          case 'SGRMOUSE':
            options.sgrMouse = v
            break
          case 'UTFMOUSE':
            options.utfMouse = v
            break
          case 'VT200MOUSE':
            options.vt200Mouse = v
            break
          case 'URXVTMOUSE':
            options.urxvtMouse = v
            break
          case 'X10MOUSE':
            options.x10Mouse = v
            break
          case 'DECMOUSE':
            options.decMouse = v
            break
          case 'PTERMMOUSE':
            options.ptermMouse = v
            break
          case 'JSBTERMMOUSE':
            options.jsbtermMouse = v
            break
          case 'VT200HILITE':
            options.vt200Hilite = v
            break
          case 'GPMMOUSE':
            options.gpmMouse = v
            break
          case 'CELLMOTION':
            options.cellMotion = v
            break
          case 'ALLMOTION':
            options.allMotion = v
            break
          case 'SENDFOCUS':
            options.sendFocus = v
            break
        }
      }
      return this.setMouse(options, true)
    }
    // NOTE:
    // Cell Motion isn't normally need for anything below here, but we'll
    // activate it for tmux (whether using it or not) in case our all-motion
    // passthrough does not work. It can't hurt.
    if (this.term('rxvt-unicode')) return this.setMouse({
      urxvtMouse: true,
      cellMotion: true,
      allMotion: true
    }, true)
    // rxvt does not support the X10 UTF extensions
    if (this.term('rxvt')) return this.setMouse({
      vt200Mouse: true,
      x10Mouse: true,
      cellMotion: true,
      allMotion: true
    }, true)
    // libvte is broken. Older versions do not support the
    // X10 UTF extension. However, later versions do support
    // SGR/URXVT.
    if (this.isVTE) return this.setMouse({
      // NOTE: Could also use urxvtMouse here.
      sgrMouse: true,
      cellMotion: true,
      allMotion: true
    }, true)
    if (this.term('linux')) return this.setMouse({
      vt200Mouse: true,
      gpmMouse: true
    }, true)
    if (
      this.term('xterm') ||
      this.term('screen') ||
      (this.tput && this.tput.strings.key_mouse)
    ) return this.setMouse({
      vt200Mouse: true,
      utfMouse: true,
      cellMotion: true,
      allMotion: true
    }, true)
  }
  // CSI ? Ps$ p
  //   Request DEC private mode (DECRQM).  For VT300 and up, reply is
  //     CSI ? Ps; Pm$ p
  //   where Ps is the mode number as in DECSET, Pm is the mode value
  disableMouse() {
    if (!this._currentMouse) return
    const o = {}
    Object.keys(this._currentMouse).forEach(key => o[key] = false)
    return this.setMouse(o, false)
  }
  // Set Mouse
  setMouse(opt, enable) {
    if (opt.normalMouse != null) { (opt.vt200Mouse = opt.normalMouse), (opt.allMotion = opt.normalMouse) }
    if (opt.hiliteTracking != null) { opt.vt200Hilite = opt.hiliteTracking }
    if (enable === true) {
      if (this._currentMouse) {
        this.setMouse(opt)
        Object.keys(opt).forEach(function (key) { this._currentMouse[key] = opt[key] }, this)
        return
      }
      this._currentMouse = opt
      this.mouseEnabled = true
    }
    else if (enable === false) { (delete this._currentMouse), (this.mouseEnabled = false) }
    //     Ps = 9  -> Send Mouse X & Y on button press.  See the section Mouse Tracking.
    //     Ps = 9  -> Don't send Mouse X & Y on button press.
    // x10 mouse
    if (opt.x10Mouse != null) { opt.x10Mouse ? this.setMode('?9') : this.resetMode('?9') }
    //     Ps = 1 0 0 0  -> Send Mouse X & Y on button press and release.  See the section Mouse Tracking.
    //     Ps = 1 0 0 0  -> Don't send Mouse X & Y on button press and release.  See the section Mouse Tracking.
    // vt200 mouse
    if (opt.vt200Mouse != null) { opt.vt200Mouse ? this.setMode('?1000') : this.resetMode('?1000') }
    //     Ps = 1 0 0 1  -> Use Hilite Mouse Tracking.
    //     Ps = 1 0 0 1  -> Don't use Hilite Mouse Tracking.
    if (opt.vt200Hilite != null) { opt.vt200Hilite ? this.setMode('?1001') : this.resetMode('?1001') }
    //     Ps = 1 0 0 2  -> Use Cell Motion Mouse Tracking.
    //     Ps = 1 0 0 2  -> Don't use Cell Motion Mouse Tracking.
    // button event mouse
    if (opt.cellMotion != null) { opt.cellMotion ? this.setMode('?1002') : this.resetMode('?1002') }
    //     Ps = 1 0 0 3  -> Use All Motion Mouse Tracking.
    //     Ps = 1 0 0 3  -> Don't use All Motion Mouse Tracking.
    // any event mouse
    if (opt.allMotion != null) {
      // NOTE: Latest versions of tmux seem to only support cellMotion (not
      // allMotion). We pass all motion through to the terminal.
      if (this.tmux && this.tmuxVersion >= 2) {
        if (opt.allMotion) this.#writeTm(CSI + '?1003h')
        else this.#writeTm(CSI + '?1003l')
      }
      else {
        if (opt.allMotion) this.setMode('?1003')
        else this.resetMode('?1003')
      }
    }
    //     Ps = 1 0 0 4  -> Send FocusIn/FocusOut events.
    //     Ps = 1 0 0 4  -> Don't send FocusIn/FocusOut events.
    if (opt.sendFocus != null) { opt.sendFocus ? this.setMode('?1004') : this.resetMode('?1004') }
    //     Ps = 1 0 0 5  -> Enable Extended Mouse Mode.
    //     Ps = 1 0 0 5  -> Disable Extended Mouse Mode.
    if (opt.utfMouse != null) { opt.utfMouse ? this.setMode('?1005') : this.resetMode('?1005') }
    // sgr mouse
    if (opt.sgrMouse != null) { opt.sgrMouse ? this.setMode('?1006') : this.resetMode('?1006') }
    // urxvt mouse
    if (opt.urxvtMouse != null) { opt.urxvtMouse ? this.setMode('?1015') : this.resetMode('?1015') }
    // dec mouse
    if (opt.decMouse != null) { opt.decMouse ? this.#write(CSI + '1;2\'z\x1b[1;3\'{') : this.#write(CSI + '\'z') }
    // pterm mouse
    if (opt.ptermMouse != null) {
      // + = advanced mode
      opt.ptermMouse ? this.#write(CSI + '>1h\x1b[>6h\x1b[>7h\x1b[>1h\x1b[>9l') : this.#write(CSI + '>1l\x1b[>6l\x1b[>7l\x1b[>1l\x1b[>9h')
    }
    // jsbterm mouse
    if (opt.jsbtermMouse != null) { opt.jsbtermMouse ? this.#write(CSI + '0~ZwLMRK+1Q\x1b\\') : this.#write(CSI + '0~ZwQ\x1b\\') }
    // gpm mouse
    if (opt.gpmMouse != null) { opt.gpmMouse ? this.enableGpm() : this.disableGpm() }
  }

  decstbm = this.setScrollRegion
  csr = this.setScrollRegion
  setScrollRegion(top, bottom) {
    if (!this.zero) {
      top = (top || 1) - 1
      bottom = (bottom || this.rows) - 1
    }
    else {
      top = top || 0
      bottom = bottom || (this.rows - 1)
    }
    this.scrollTop = top
    this.scrollBottom = bottom
    this.x = 0
    this.y = 0
    this.recoords()
    if (this.tput) return this.put.csr(top, bottom)
    return this.#write(CSI + `${top + 1};${bottom + 1}r`)
  }

  scA = this.saveCursorA
  saveCursorA() {
    this.savedX = this.x
    this.savedY = this.y
    if (this.tput) return this.put.sc()
    return this.#write(CSI + _SCP)
  }

  rcA = this.restoreCursorA
  restoreCursorA() {
    this.x = this.savedX || 0
    this.y = this.savedY || 0
    if (this.tput) return this.put.rc()
    return this.#write(CSI + _RCP)
  }

  cht = this.cursorForwardTab
  cursorForwardTab(param) {
    this.x += 8
    this.recoords()
    if (this.tput) return this.put.tab(param)
    return this.#write(CSI + `${param || 1}` + _CHT)
  }

  cht = this.cursorForwardTab
  scrollUp(param) {
    this.y -= param || 1
    this.recoords()
    if (this.tput) return this.put.parm_index(param)
    return this.#write(CSI + `${param || 1}` + _SU)
  }

  sd = this.scrollDown
  scrollDown(param) {
    this.y += param || 1
    this.recoords()
    if (this.tput) return this.put.parm_rindex(param)
    return this.#write(CSI + `${param || 1}` + _SD)
  }

  initMouseTracking() { return this.#write(CSI + `${slice.call(arguments).join(SC)}T`) }

  resetTitleModes() { return this.#write(CSI + `>${slice.call(arguments).join(SC)}T`) }

  cbt = this.cursorBackwardTab
  cursorBackwardTab(param) {
    this.x -= 8
    this.recoords()
    if (this.tput) return this.put.cbt(param)
    return this.#write(CSI + `${param || 1}Z`)
  }

  rep = this.repeatPrecedingCharacter
  repeatPrecedingCharacter(param) {
    this.x += param || 1
    this.recoords()
    if (this.tput) return this.put.rep(param)
    return this.#write(CSI + `${param || 1}b`)
  }

  tbc = this.tabClear
  tabClear(param) { return this.tput ? this.put.tbc(param) : this.#write(CSI + `${param || 0}g`) }

  mc = this.mediaCopy
  mediaCopy() { return this.#write(CSI + `${slice.call(arguments).join(SC)}i`) }

  print_screen = this.mc0
  ps = this.mc0
  mc0() { return this.tput ? this.put.mc0() : this.mc('0') }

  prtr_on = this.mc5
  po = this.mc5
  mc5() { return this.tput ? this.put.mc5() : this.mc('5') }

  prtr_off = this.mc4
  pf = this.mc4
  mc4() { return this.tput ? this.put.mc4() : this.mc('4') }

  prtr_non = this.mc5p
  pO = this.mc5p
  mc5p() { return this.tput ? this.put.mc5p() : this.mc('?5') }

  setResources() { return this.#write(CSI + `>${slice.call(arguments).join(SC)}m`) }

  disableModifiers(param) { return this.#write(CSI + `>${param || ''}n`) }

  setPointerMode(param) { return this.#write(CSI + `>${param || ''}p`) }

  decstr = this.softReset
  rs2 = this.softReset
  softReset() {
    //if (this.tput) return this.put.init_2string();
    //if (this.tput) return this.put.reset_2string();
    if (this.tput) return this.put.rs2()
    //return this.#write(CSI + '!p');
    //return this.#write(CSI + '!p\x1b[?3;4l\x1b[4l\x1b>'); // init
    return this.#write(CSI + '!p\x1b[?3;4l\x1b[4l\x1b>') // reset
  }

  decrqm = this.requestAnsiMode
  requestAnsiMode(param) { return this.#write(CSI + `${param || ''}$p`) }

  decrqmp = this.requestPrivateMode
  requestPrivateMode(param) { return this.#write(CSI + `?${param || ''}$p`) }

  decscl = this.setConformanceLevel
  setConformanceLevel() { return this.#write(CSI + `${slice.call(arguments).join(SC)}"p`) }

  decll = this.loadLEDs
  loadLEDs(param) { return this.#write(CSI + `${param || ''}q`) }

  decscusr = this.setCursorStyle
  setCursorStyle(param) {
    switch (param) {
      case 'blinking block':
        param = 1
        break
      case 'block':
      case 'steady block':
        param = 2
        break
      case 'blinking underline':
        param = 3
        break
      case 'underline':
      case 'steady underline':
        param = 4
        break
      case 'blinking bar':
        param = 5
        break
      case 'bar':
      case 'steady bar':
        param = 6
        break
    }
    if (param === 2 && this.has('Se')) {
      return this.put.Se()
    }
    if (this.has('Ss')) {
      return this.put.Ss(param)
    }
    return this.#write(CSI + `${param || 1} q`)
  }

  decsca = this.setCharProtectionAttr
  setCharProtectionAttr(param) {
    return this.#write(CSI + `${param || 0}"q`)
  }

  deccara = this.setAttrInRectangle
  restorePrivateValues() { return this.#write(CSI + `?${slice.call(arguments).join(SC)}r`) }

  decrara = this.reverseAttrInRectangle
  setAttrInRectangle() { return this.#write(CSI + `${slice.call(arguments).join(SC)}$r`) }

  decswbv = this.setWarningBellVolume
  savePrivateValues() { return this.#write(CSI + `?${slice.call(arguments).join(SC)}s`) }

  decsmbv = this.setMarginBellVolume
  manipulateWindow() {
    const args = slice.call(arguments)
    const callback = typeof args[args.length - 1] === FUN
      ? args.pop()
      : function () {}
    return this.response('window-manipulation', CSI + `${args.join(SC)}t`, callback)
  }
  getWindowSize(callback) { return this.manipulateWindow(18, callback) }

  reverseAttrInRectangle() { return this.#write(CSI + `${slice.call(arguments).join(SC)}$t`) }

  setTitleModeFeature() { return this.#writeTm(CSI + `>${slice.call(arguments).join(SC)}t`) }

  setWarningBellVolume(param) { return this.#write(CSI + `${param || ''} t`) }

  setMarginBellVolume(param) { return this.#write(CSI + `${param || ''} u`) }

  deccra = this.copyRectangle
  copyRectangle() { return this.#write(CSI + `${slice.call(arguments).join(SC)}$v`) }

  decefr = this.enableFilterRectangle
  enableFilterRectangle() { return this.#write(CSI + `${slice.call(arguments).join(SC)}'w`) }

  decreqtparm = this.requestParameters
  requestParameters(param) { return this.#write(CSI + `${param || 0}x`) }

  decsace = this.selectChangeExtent
  selectChangeExtent(param) { return this.#write(CSI + `${param || 0}x`) }

  decfra = this.fillRectangle
  fillRectangle() { return this.#write(CSI + `${slice.call(arguments).join(SC)}$x`) }

  decelr = this.enableLocatorReporting
  enableLocatorReporting() { return this.#write(CSI + `${slice.call(arguments).join(SC)}'z`) }

  decera = this.eraseRectangle
  eraseRectangle() { return this.#write(CSI + `${slice.call(arguments).join(SC)}$z`) }

  decsle = this.setLocatorEvents
  setLocatorEvents() { return this.#write(CSI + `${slice.call(arguments).join(SC)}'{`) }

  decsera = this.selectiveEraseRectangle
  selectiveEraseRectangle() { return this.#write(CSI + `${slice.call(arguments).join(SC)}$\{`) }

  decrqlp = this.requestLocatorPosition
  req_mouse_pos = this.requestLocatorPosition
  reqmp = this.requestLocatorPosition
  requestLocatorPosition(param, callback) {
    // See also:
    // get_mouse / getm / Gm
    // mouse_info / minfo / Mi
    // Correct for tput?
    if (this.has('req_mouse_pos')) {
      const code = this.tput.req_mouse_pos(param)
      return this.response('locator-position', code, callback)
    }
    return this.response('locator-position', CSI + `${param || ''}'|`, callback)
  }

  decic = this.insertColumns
  insertColumns() { return this.#write(CSI + `${slice.call(arguments).join(SC)} }`) }

  decdc = this.deleteColumns
  deleteColumns() { return this.#write(CSI + `${slice.call(arguments).join(SC)} ~`) }
  out(name) {
    const args = Array.prototype.slice.call(arguments, 1)
    this.ret = true
    const out = this[name].apply(this, args)
    this.ret = false
    return out
  }
  sigtstp(callback) {
    const resume = this.pause()
    process.once(SIGCONT, () => { resume(), (callback ? callback() : undefined) })
    process.kill(process.pid, SIGTSTP)
  }
  pause(callback) {
    const self         = this,
          isAlt        = this.isAlt,
          mouseEnabled = this.mouseEnabled
    this.lsaveCursor('pause')
    //this.csr(0, screen.height - 1);
    if (isAlt) this.normalBuffer()
    this.showCursor()
    if (mouseEnabled) this.disableMouse()
    const write = this.output.write
    this.output.write = function () {}
    if (this.input.setRawMode) this.input.setRawMode(false)
    this.input.pause()
    return this._resume = function () {
      delete self._resume
      if (self.input.setRawMode) self.input.setRawMode(true)
      self.input.resume()
      self.output.write = write
      if (isAlt) self.alternateBuffer()
      //self.csr(0, screen.height - 1);
      if (mouseEnabled) self.enableMouse()
      self.lrestoreCursor('pause', true)
      if (callback) callback()
    }
  }
  resume() { if (this._resume) return this._resume() }
}

/**
 * Helpers
 */

// We could do this easier by just manipulating the _events object, or for
// older versions of node, manipulating the array returned by listeners(), but
// neither of these methods are guaranteed to work in future versions of node.
function unshiftEvent(target, event, listener) {
  const listeners = target.listeners(event)
  target.removeAllListeners(event)
  target.on(event, listener)
  listeners.forEach(listener => target.on(event, listener))
}
function merge(target) {
  slice
    .call(arguments, 1)
    .forEach(source => Object.keys(source).forEach(key => target[key] = source[key]))
  return target
}
