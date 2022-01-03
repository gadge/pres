/**
 * terminal.js - term.js terminal element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import {
  BLUR, DATA, DESTROY, FOCUS, KEYPRESS, MOUSE, MOUSEDOWN, PASSTHROUGH, RENDER, RESIZE, SCROLL, TITLE,
}                      from '@pres/enum-events'
import { nextTick }    from '@pres/util-helpers'
import { styleToAttr } from '@pres/util-sgr-attr'
import term            from 'term.js'
import { Box }         from '../core/box'


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
    this.term = term({
      termName: this.termName,
      cols: this.width - this.intW,
      rows: this.height - this.intH,
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
      if (data.x < self.absL + self.intL) return
      if (data.y < self.absT + self.intT) return
      if (data.x > self.absL - self.intL + self.width) return
      if (data.y > self.absT - self.intT + self.height) return
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
      const x = data.x - self.absL,
            y = data.y - self.absT
      let s
      if (self.term.urxvtMouse) {
        if (self.screen.program.sgrMouse) { b += 32 }
        s = '\x1b[' + b + ';' + (x + 32) + ';' + (y + 32) + 'M'
      }
      else if (self.term.sgrMouse) {
        if (!self.screen.program.sgrMouse) { b -= 32 }
        s = '\x1b[<' + b + ';' + x + ';' + y
          + (data.action === MOUSEDOWN ? 'M' : 'm')
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
    this.term.on(TITLE, title => { self.title = title, self.emit(TITLE, title) })
    this.term.on(PASSTHROUGH, data => { self.screen.program.flush(), self.screen.program.write(data) })
    this.on(RESIZE, () => nextTick(() => self.term.resize(self.width - self.intW, self.height - self.intH)))
    this.once(RENDER, () => self.term.resize(self.width - self.intW, self.height - self.intH))
    this.on(DESTROY, () => { self.kill(), self.screen.program.input.removeListener(DATA, self._onData) })
    if (this.handler) { return }
    // this.pty = fork(this.shell, this.args, {
    //   name: this.termName,
    //   cols: this.width - this.intW,
    //   rows: this.height - this.intH,
    //   cwd: process.env.HOME,
    //   env: this.options.env || process.env
    // })
    this.on(RESIZE, () => nextTick(() => {
      try { self.pty.resize(self.width - self.intW, self.height - self.intH) } catch (e) { }
    }))
    this.handler = data => { self.pty.write(data), self.screen.render() }
    // this.pty.on(DATA, data => { self.write(data), self.screen.render() })
    // this.pty.on(EXIT, code => { self.emit(EXIT, code || null) })
    this.onScreenEvent(KEYPRESS, () => self.screen.render())
    this.screen._listenKeys(this)
  }
  write(data) { return this.term.write(data) }
  render() {
    const ret = this.renderElement()
    if (!ret) return
    this.dattr = styleToAttr(this.style)
    const xLo = ret.xLo + this.intL,
          xHi = ret.xHi - this.intR,
          yLo = ret.yLo + this.intT,
          yHi = ret.yHi - this.intB
    let cursor
    const scrollBack = this.term.lines.length - (yHi - yLo)
    for (
      let y = Math.max(yLo, 0), currLine, backLine;
      y < yHi;
      y++
    ) {
      if (
        !(currLine = this.screen.lines[y]) ||
        !(backLine = this.term.lines[scrollBack + y - yLo])
      ) { break }
      if (
        y === yLo + this.term.y &&
        this.term.cursorState &&
        this.screen.focused === this &&
        (this.term.ydisp === this.term.ybase || this.term.selectMode) &&
        !this.term.cursorHidden
      ) { cursor = xLo + this.term.x }
      else { cursor = -1 }
      for (let x = Math.max(xLo, 0), currCell, backCell; x < xHi; x++) {
        if (
          !(currCell = currLine[x]) ||
          !(backCell = backLine[x - xLo])
        ) { break }
        currCell[0] = backCell[0]
        if (x === cursor) {
          if (this.cursor === 'line') {
            currCell.inject(this.dattr, '\u2502')
            continue
          }
          else if (this.cursor === 'underline') { currCell.at = this.dattr | (2 << 18) }
          else if (this.cursor === 'block' || !this.cursor) { currCell.at = this.dattr | (8 << 18) }
        }
        currCell.ch = backCell.ch
        // default foreground = 257
        if (((currCell.at >> 9) & 0x1ff) === 257) {
          currCell.at &= ~(0x1ff << 9)
          currCell.at |= ((this.dattr >> 9) & 0x1ff) << 9
        }
        // default background = 256
        if ((currCell.at & 0x1ff) === 256) {
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
    return (buf[0] === 0x1b && buf[1] === 0x5b && buf[2] === 0x4d) ||
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
  get scrollHeight() { return this.term.rows - 1 }
  get scrollPercent() { return (this.term.ydisp / this.term.ybase) * 100 }
  set scrollPercent(i) { return this.setScroll((i / 100) * this.term.ybase | 0) }
  screenshot(xLo, xHi, yLo, yHi) {
    xLo = 0 + (xLo || 0)
    if (xHi != null) { xHi = 0 + (xHi || 0) }
    else { xHi = this.term.lines[0].length }
    yLo = 0 + (yLo || 0)
    if (yHi != null) { yHi = 0 + (yHi || 0) }
    else { yHi = this.term.lines.length }
    return this.screen.screenshot(xLo, xHi, yLo, yHi, this.term)
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
