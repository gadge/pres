import { BEL, DCS, ESC, ST }                                         from '@pres/enum-control-chars'
import { DATA, KEY, KEYPRESS, MOUSE, NEW_LISTENER, RESIZE, WARNING } from '@pres/enum-events'
import { ENTER, RETURN, UNDEFINED }                                  from '@pres/enum-key-names'
import { keypressEventsEmitter }                                     from '@pres/events'
import { Tput }                                                      from '@pres/terminfo-parser'
import { whichTerminal }                                             from '@pres/terminfo-parser/src/whichTerminal'
import { slice }                                                     from '@pres/util-helpers'
import { SP, VO }                                                    from '@texting/enum-chars'
import { FUN, NUM }                                                  from '@typen/enum-data-types'
import cp                                                            from 'child_process'
import { EventEmitter }                                              from 'events'
import fs                                                            from 'fs'
import { StringDecoder }                                             from 'string_decoder'
import util                                                          from 'util'
import { ProgramCollection }                                         from './programCollection'

const nextTick = global.setImmediate || process.nextTick.bind(process)

export class IO extends EventEmitter {
  #logger = null
  #terminal = null

  constructor(options) {
    super(options)
    this.configIO(options)
  }
  configIO(options) {
    const self = this
    // EventEmitter.call(this)
    if (!options || options.__proto__ !== Object.prototype) {
      const [ input, output ] = arguments
      options = { input, output }
    } // IO
    this.options = options
    this.input = options.input || process.stdin // IO
    this.output = options.output || process.stdout // IO
    options.log = options.log || options.dump // IO - logger
    if (options.log) {
      this.#logger = fs.createWriteStream(options.log)
      if (options.dump) this.setupDump()
    } // IO - logger
    this.zero = options.zero !== false
    this.useBuffer = options.buffer // IO
    this.#terminal = whichTerminal(options) // IO
    // OSX
    this.isOSXTerm = process.env.TERM_PROGRAM === 'Apple_Terminal'
    this.isiTerm2 = process.env.TERM_PROGRAM === 'iTerm.app' || !!process.env.ITERM_SESSION_ID
    // VTE
    // NOTE: lxterminal does not provide an env variable to check for.
    // NOTE: gnome-terminal and sakura use a later version of VTE
    // which provides VTE_VERSION as well as supports SGR events.
    this.isXFCE = /xfce/i.test(process.env.COLORTERM)
    this.isTerminator = !!process.env.TERMINATOR_UUID
    this.isLXDE = false
    this.isVTE = !!process.env.VTE_VERSION || this.isXFCE || this.isTerminator || this.isLXDE
    // xterm and rxvt - not accurate
    this.isRxvt = /rxvt/i.test(process.env.COLORTERM)
    this.isXterm = false
    this.tmux = !!process.env.TMUX // IO
    this.tmuxVersion = (function () {
      if (!self.tmux) return 2
      try {
        const version = cp.execFileSync('tmux', [ '-V' ], { encoding: 'utf8' })
        return +/^tmux ([\d.]+)/i.exec(version.trim().split('\n')[0])[1]
      } catch (e) { return 2 }
    })() // IO
    this._buf = VO // IO
    this._flush = this.flush.bind(this) // IO
    if (options.tput !== false) this.setupTput() // IO
    console.log(`>> [program.configIO] [terminal] ${this.#terminal} [tmux] ${this.tmux}`)
  }

  get terminal() { return this.#terminal }
  set terminal(terminal) { return this.setTerminal(terminal), this.terminal }
  log() { return this.#log('LOG', util.format.apply(util, arguments)) }
  debug() {
    return !this.options.debug
      ? void 0
      : this.#log('DEBUG', util.format.apply(util, arguments))
  }
  #log(pre, msg) { return this.#logger?.write(pre + ': ' + msg + '\n-\n') }
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
            if (ch.length < 4) ch = '0' + ch
            return `\\u${ch}`
          }
          if (ch.length < 2) ch = '0' + ch
          return `\\x${ch}`
        })
    }
    function caret(data) {
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
    this.input.on(DATA, data => self.#log('IN', stringify(decoder.write(data))))
    this.output.write = function (data) {
      self.#log('OUT', stringify(data))
      return write.apply(this, arguments)
    }
  }
  setupTput() {
    console.log('>> [io.setupTput]')
    if (this._tputSetup) return
    this._tputSetup = true
    const
      self    = this,
      options = this.options,
      write   = this.wr.bind(this)
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
        args = slice(arguments),
        cap  = args.shift()
      if (tput[cap]) return this.wr(tput[cap].apply(tput, args))
    }
    Object.keys(tput).forEach(key => {
      if (self[key] == null) self[key] = tput[key]
      if (typeof tput[key] !== FUN) return void (self.put[key] = tput[key])
      self.put[key] = tput.padding
        ? function () { return tput._print(tput[key].apply(tput, arguments), write) }
        : function () { return self.wr(tput[key].apply(tput, arguments)) }
    })
  }
  setTerminal(terminal) {
    this.#terminal = terminal.toLowerCase()
    delete this._tputSetup
    this.setupTput()
  }
  has(name) { return this.tput?.has(name) ?? false }
  term(is) { return this.terminal.indexOf(is) === 0 }
  listen() {
    const self = this
    // console.log(`>> [this.input._presInput = ${this.input._presInput}]`)
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
    this.on(NEW_LISTENER, function handler(type) { if (type === MOUSE) { self.removeListener(NEW_LISTENER, handler), self.bindMouse() } })
    // Listen for resize on output
    if (!this.output._presOutput) { (this.output._presOutput = 1), this.#listenOutput() }
    else { this.output._presOutput++ }
    console.log(`>> [program.listen] [ ${this.eventNames()} ]`)
  }
  #listenInput() {
    const self = this
    setTimeout(() => {}, 3000)
    // Input
    this.input.on(KEYPRESS, this.input._keypressHandler = (ch, key) => {
      key = key || { ch: ch }
      // A mouse sequence. The `keys` module doesn't understand these.
      if (key.name === UNDEFINED && (key.code === '[M' || key.code === '[I' || key.code === '[O')) return void 0
      // Not sure what this is, but we should probably ignore it.
      if (key.name === UNDEFINED) return void 0
      if (key.name === ENTER && key.sequence === '\n') key.name = 'linefeed'
      if (key.name === RETURN && key.sequence === '\r') self.input.emit(KEYPRESS, ch, merge({}, key, { name: ENTER }))
      const name = `${key.ctrl ? 'C-' : VO}${key.meta ? 'M-' : VO}${key.shift && key.name ? 'S-' : VO}${key.name || ch}`
      key.full = name
      ProgramCollection.instances.forEach(program => {
        if (program.input !== self.input) return void 0
        program.emit(KEYPRESS, ch, key)
        program.emit(KEY + SP + name, ch, key)
      })
    })
    this.input.on(DATA,
      this.input._dataHandler =
        data => ProgramCollection.instances.forEach(
          program => program.input !== self.input ? void 0 : void program.emit(DATA, data)
        )
    )
    keypressEventsEmitter(this.input)
    console.log(`>> [program.#listenInput] [ ${this.input.eventNames()} ]`)
  }
  #listenOutput() {
    const self = this
    if (!this.output.isTTY) nextTick(() => self.emit(WARNING, 'Output is not a TTY'))
    // Output
    function resize() {
      ProgramCollection.instances.forEach(p => {
        const { output } = p
        if (output !== self.output) return void 0
        p.cols = output.columns
        p.rows = output.rows
        p.emit(RESIZE)
      })
    }
    this.output.on(RESIZE, this.output._resizeHandler = () => {
      ProgramCollection.instances.forEach(p => {
        if (p.output !== self.output) return
        const { options: { resizeTimeout }, _resizeTimer } = p
        if (!resizeTimeout) return resize()
        if (_resizeTimer) clearTimeout(_resizeTimer), (delete p._resizeTimer)
        const time = typeof resizeTimeout === NUM ? resizeTimeout : 300
        p._resizeTimer = setTimeout(resize, time)
      })
    })
    console.log(`>> [program.#listenOutput] [ ${this.output.eventNames()} ]`)
  }

  out(name, ...args) {
    this.ret = true
    const out = this[name].apply(this, args)
    this.ret = false
    return out
  }
  ow(text) { if (this.output.writable) this.output.write(text) }
  wr(text) { return this.ret ? text : this.useBuffer ? this.bf(text) : this.ow(text) }
  tw(data) {
    const self = this
    let
      iter = 0,
      timer
    if (this.tmux) {
      // Replace all STs with BELs so they can be nested within the DCS code.
      data = data.replace(/\x1b\\/g, BEL)
      // Wrap in tmux forward DCS:
      data = DCS + 'tmux;' + ESC + data + ST
      // If we've never even flushed yet, it means we're still in
      // the normal buffer. Wait for alt screen buffer.
      if (this.output.bytesWritten === 0) {
        timer = setInterval(() => {
          if (self.output.bytesWritten > 0 || ++iter === 50) {
            clearInterval(timer)
            self.flush()
            self.ow(data)
          }
        }, 100)
        return true
      }
      // NOTE: Flushing the buffer is required in some cases.
      // The DCS code must be at the start of the output.
      this.flush()
      // Write out raw now that the buffer is flushed.
      return this.ow(data)
    }
    return this.wr(data)
  }
  bf(text) {
    if (this._exiting) return void (this.flush(), this.ow(text))
    if (this._buf) return void (this._buf += text)
    this._buf = text
    nextTick(this._flush)
    return true
  }
  print(text, attr) { return attr ? this.wr(this.text(text, attr)) : this.wr(text) }
  flush() {
    if (!this._buf) return
    this.ow(this._buf)
    this._buf = VO
  }
}

function merge(target) {
  slice
    .call(arguments, 1)
    .forEach(source => Object.keys(source).forEach(key => target[key] = source[key]))
  return target
}