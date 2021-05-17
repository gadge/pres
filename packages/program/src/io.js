import { whichTerminal } from '@pres/terminfo-parser/src/whichTerminal'
import { VO }            from '@texting/enum-chars'
import cp                from 'child_process'
import { EventEmitter }  from 'events'
import fs                from 'fs'

export class IO extends EventEmitter {

  constructor(options) {
    super(options)

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

    this._terminal = whichTerminal(options) // IO
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
  }

}