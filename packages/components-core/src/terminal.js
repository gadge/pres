/**
 * terminal.js - term.js terminal element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import {
  BLUR, DATA, DESTROY, EXIT, FOCUS, KEYPRESS, MOUSE, MOUSEDOWN, PASSTHROUGH, RENDER, RESIZE, SCROLL, TITLE,
}              from '@pres/enum-events'
import { Box } from '../core/box'
// import pty     from 'pty.js'
// import term    from 'term.js'

/**
 * Modules
 */
const nextTick = global.setImmediate || process.nextTick.bind(process)
export class Terminal extends Box {
  setScroll = this.scrollTo
  /**
   * Terminal
   */
  constructor(options = {}) {
    options.scrollable = false
    super(options)
    // if (!(this instanceof Node)) return new Terminal(options)
    // XXX Workaround for all motion
    if (this.screen.program.tmux && this.screen.program.tmuxVersion >= 2)
      this.screen.program.enableMouse()
    this.handler = options.handler
    this.shell = options.shell || process.env.SHELL || 'sh'
    this.args = options.args || []
    this.cursor = this.options.cursor
    this.cursorBlink = this.options.cursorBlink
    this.screenKeys = this.options.screenKeys
    this.style = this.style || {}
    this.style.bg = this.style.bg || 'default'
    this.style.fg = this.style.fg || 'default'
    this.termName = options.terminal ||
      options.term ||
      process.env.TERM ||
      'xterm'
    this.bootstrap()
    this.type = 'terminal'
  }
  static build(options) { return new Terminal(options) }
  bootstrap() {
    const self = this
    const element = {
      // window
      get document() { return element },
      navigator: { userAgent: 'node.js' },
      // document
      get defaultView() { return element },
      get documentElement() { return element },
      createElement: function () { return element },
      // element
      get ownerDocument() { return element },
      addEventListener: function () {},
      removeEventListener: function () {},
      getElementsByTagName: function () { return [ element ] },
      getElementById: function () { return element },
      parentNode: null,
      offsetParent: null,
      appendChild: function () {},
      removeChild: function () {},
      setAttribute: function () {},
      getAttribute: function () {},
      style: {},
      focus: function () {},
      blur: function () {},
      console: console
    }
    element.parentNode = element
    element.offsetParent = element
    this.term = require('term.js')({
      termName: this.termName,
      cols: this.width - this.iwidth,
      rows: this.height - this.iheight,
      context: element,
      document: element,
      body: element,
      sup: element,
      cursorBlink: this.cursorBlink,
      screenKeys: this.screenKeys
    })
    this.term.refresh = function () { self.screen.render() }
    this.term.keyDown = function () {}
    this.term.keyPress = function () {}
    this.term.open(element)
    // Emits key sequences in html-land.
    // Technically not necessary here.
    // In reality if we wanted to be neat, we would overwrite the keyDown and
    // keyPress methods with our own node.js-keys->terminal-keys methods, but
    // since all the keys are already coming in as escape sequences, we can just
    // send the input directly to the handler/socket (see below).
    // this.term.on(DATA, function(data) {
    //   self.handler(data);
    // });
    // Incoming keys and mouse inputs.
    // NOTE: Cannot pass mouse events - coordinates will be off!
    this.screen.program.input.on(DATA, this._onData = function (data) {
      if (self.screen.focused === self && !self._isMouse(data)) {
        self.handler(data)
      }
    })
    this.onScreenEvent(MOUSE, function (data) {
      if (self.screen.focused !== self) return
      if (data.x < self.aleft + self.ileft) return
      if (data.y < self.atop + self.itop) return
      if (data.x > self.aleft - self.ileft + self.width) return
      if (data.y > self.atop - self.itop + self.height) return
      if (self.term.x10Mouse ||
        self.term.vt200Mouse ||
        self.term.normalMouse ||
        self.term.mouseEvents ||
        self.term.utfMouse ||
        self.term.sgrMouse ||
        self.term.urxvtMouse) {

      }
      else {
        return
      }
      let b = data.raw[0]
      const x = data.x - self.aleft,
            y = data.y - self.atop
      let s
      if (self.term.urxvtMouse) {
        if (self.screen.program.sgrMouse) { b += 32 }
        s = '\x1b[' + b + ';' + ( x + 32 ) + ';' + ( y + 32 ) + 'M'
      }
      else if (self.term.sgrMouse) {
        if (!self.screen.program.sgrMouse) { b -= 32 }
        s = '\x1b[<' + b + ';' + x + ';' + y
          + ( data.action === MOUSEDOWN ? 'M' : 'm' )
      }
      else {
        if (self.screen.program.sgrMouse) { b += 32 }
        s = '\x1b[M'
          + String.fromCharCode(b)
          + String.fromCharCode(x + 32)
          + String.fromCharCode(y + 32)
      }
      self.handler(s)
    })
    this.on(FOCUS, () => { self.term.focus() })
    this.on(BLUR, () => { self.term.blur() })
    this.term.on(TITLE, title => {
      self.title = title
      self.emit(TITLE, title)
    })
    this.term.on(PASSTHROUGH, data => {
      self.screen.program.flush()
      self.screen.program.write(data)
    })
    this.on(RESIZE, () => nextTick(() => self.term.resize(self.width - self.iwidth, self.height - self.iheight)))
    this.once(RENDER, () => self.term.resize(self.width - self.iwidth, self.height - self.iheight))
    this.on(DESTROY, () => {
      self.kill()
      self.screen.program.input.removeListener(DATA, self._onData)
    })
    if (this.handler) { return }
    this.pty = require('pty.js').fork(this.shell, this.args, {
      name: this.termName,
      cols: this.width - this.iwidth,
      rows: this.height - this.iheight,
      cwd: process.env.HOME,
      env: this.options.env || process.env
    })
    this.on(RESIZE, function () {
      nextTick(function () {
        try {
          self.pty.resize(self.width - self.iwidth, self.height - self.iheight)
        } catch (e) { }
      })
    })
    this.handler = function (data) {
      self.pty.write(data)
      self.screen.render()
    }
    this.pty.on(DATA, function (data) {
      self.write(data)
      self.screen.render()
    })
    this.pty.on(EXIT, function (code) {
      self.emit(EXIT, code || null)
    })
    this.onScreenEvent(KEYPRESS, () => self.screen.render())
    this.screen._listenKeys(this)
  }
  write(data) { return this.term.write(data) }
  render() {
    const ret = this._render()
    if (!ret) return
    this.dattr = this.sattr(this.style)
    const xi = ret.xi + this.ileft,
          xl = ret.xl - this.iright,
          yi = ret.yi + this.itop,
          yl = ret.yl - this.ibottom
    let cursor
    const scrollBack = this.term.lines.length - ( yl - yi )
    for (
      let y = Math.max(yi, 0), currLine, backLine;
      y < yl;
      y++
    ) {
      if (
        !( currLine = this.screen.lines[y] ) ||
        !( backLine = this.term.lines[scrollBack + y - yi] )
      ) { break }
      if (
        y === yi + this.term.y &&
        this.term.cursorState &&
        this.screen.focused === this &&
        ( this.term.ydisp === this.term.ybase || this.term.selectMode ) &&
        !this.term.cursorHidden
      ) { cursor = xi + this.term.x }
      else { cursor = -1 }
      for (let x = Math.max(xi, 0), currCell, backCell; x < xl; x++) {
        if (
          !( currCell = currLine[x] ) ||
          !( backCell = backLine[x - xi] )
        ) { break }
        currCell[0] = backCell[0]
        if (x === cursor) {
          if (this.cursor === 'line') {
            currCell.inject(this.dattr, '\u2502')
            continue
          }
          else if (this.cursor === 'underline') { currCell.at = this.dattr | ( 2 << 18 ) }
          else if (this.cursor === 'block' || !this.cursor) { currCell.at = this.dattr | ( 8 << 18 ) }
        }
        currCell.ch = backCell.ch
        // default foreground = 257
        if (( ( currCell.at >> 9 ) & 0x1ff ) === 257) {
          currCell.at &= ~( 0x1ff << 9 )
          currCell.at |= ( ( this.dattr >> 9 ) & 0x1ff ) << 9
        }
        // default background = 256
        if (( currCell.at & 0x1ff ) === 256) {
          currCell.at &= ~0x1ff
          currCell.at |= this.dattr & 0x1ff
        }
      }
      currLine.dirty = true
    }
    return ret
  }
  _isMouse(buf) {
    let s = buf
    if (Buffer.isBuffer(s)) {
      if (s[0] > 127 && s[1] === undefined) {
        s[0] -= 128
        s = '\x1b' + s.toString('utf-8')
      }
      else { s = s.toString('utf-8') }
    }
    return ( buf[0] === 0x1b && buf[1] === 0x5b && buf[2] === 0x4d ) ||
      /^\x1b\[M([\x00\u0020-\uffff]{3})/.test(s) ||
      /^\x1b\[(\d+;\d+;\d+)M/.test(s) ||
      /^\x1b\[<(\d+;\d+;\d+)([mM])/.test(s) ||
      /^\x1b\[<(\d+;\d+;\d+;\d+)&w/.test(s) ||
      /^\x1b\[24([0135])~\[(\d+),(\d+)\]\r/.test(s) ||
      /^\x1b\[(O|I)/.test(s)
  }
  scrollTo(offset) {
    this.term.ydisp = offset
    return this.emit(SCROLL)
  }
  getScroll() { return this.term.ydisp }
  scroll(offset) {
    this.term.scrollDisp(offset)
    return this.emit(SCROLL)
  }
  resetScroll() {
    this.term.ydisp = 0
    this.term.ybase = 0
    return this.emit(SCROLL)
  }
  getScrollHeight() { return this.term.rows - 1 }
  getScrollPerc() { return ( this.term.ydisp / this.term.ybase ) * 100 }
  setScrollPerc(i) { return this.setScroll(( i / 100 ) * this.term.ybase | 0) }
  screenshot(xi, xl, yi, yl) {
    xi = 0 + ( xi || 0 )
    if (xl != null) { xl = 0 + ( xl || 0 ) }
    else { xl = this.term.lines[0].length }
    yi = 0 + ( yi || 0 )
    if (yl != null) { yl = 0 + ( yl || 0 ) }
    else { yl = this.term.lines.length }
    return this.screen.screenshot(xi, xl, yi, yl, this.term)
  }
  kill() {
    if (this.pty) {
      this.pty.destroy()
      this.pty.kill()
    }
    this.term.refresh = function () {}
    this.term.write('\x1b[H\x1b[J')
    if (this.term._blink) { clearInterval(this.term._blink) }
    this.term.destroy()
  }
}
