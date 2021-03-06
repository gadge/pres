/**
 * screen.js - screen node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Node }                                                        from '@pres/components-node'
import { ANGLE_TABLE, ANGLES, ANGLES_D, ANGLES_L, ANGLES_R, ANGLES_U } from '@pres/enum-angle-table'
import { CSI, LF }                                                     from '@pres/enum-control-chars'
import { SGR }                                                         from '@pres/enum-csi-codes'
import {
  BLUR, CLICK, DESTROY, ELEMENT_CLICK, ELEMENT_MOUSEOUT, ELEMENT_MOUSEOVER, ELEMENT_MOUSEUP, ERROR, EXIT, FOCUS,
  KEYPRESS, MOUSE, MOUSEDOWN, MOUSEMOVE, MOUSEOUT, MOUSEOVER, MOUSEUP, MOUSEWHEEL, NEW_LISTENER, PRERENDER, RENDER,
  RESIZE, WARNING, WHEELDOWN, WHEELUP,
}                                                                      from '@pres/enum-events'
import { GlobalScreen }                                                from '@pres/global-screen'
import { Program }                                                     from '@pres/program'
import * as colors                                                     from '@pres/util-blessed-colors'
import { degrade }                                                     from '@pres/util-byte-colors'
import * as helpers                                                    from '@pres/util-helpers'
import { Logger }                                                      from '@pres/util-helpers'
import { Mor }                                                         from '@pres/util-morisot'
import { attrToSgra, sgraToAttr, styleToAttr }                         from '@pres/util-sgr-attr'
import * as unicode                                                    from '@pres/util-unicode'
import { SP }                                                          from '@texting/enum-chars'
import { FUN, OBJ, STR }                                               from '@typen/enum-data-types'
import cp, { spawn }                                                   from 'child_process'
import { Log }                                                         from '../src/log'
import { Cadre }                                                       from '../utils/Cadre'
import { Detic }                                                       from '../utils/Detic'
import { GridScale }                                                   from '../utils/GridScale'
import { Box }                                                         from './box'

export class Screen extends Node {
  type = 'screen'
  #buffer = ''
  constructor(options = {}) {
    options.sku = options.sku ?? 'screen'
    super(options, true)
    GlobalScreen.initialize(this)
    this.setupProgram(options)
    Node.prototype.setup.call(this, options)
    // super(options) // Node.call(this, options)
    Screen.prototype.config.call(this, options)
  }
  static build(options) { return new Screen(options) }
  config(options) {
    const self = this
    // this.type = this.type ?? 'screen'
    this.autoPadding = options.autoPadding !== false
    this.tabc = Array((options.tabSize || 4) + 1).join(' ')
    this.dockBorders = options.dockBorders
    this.ignoreLocked = options.ignoreLocked || []
    this._unicode = this.tput.unicode || this.tput.numerics.U8 === 1
    this.fullUnicode = this.options.fullUnicode && this._unicode
    this.dattr = (0 << 18) | (0x1ff << 9) | 0x1ff
    this.renders = 0
    this.setupPos()
    this.padding = Cadre.build(options.padding) // { left: 0, top: 0, right: 0, bottom: 0 }
    this.gridScale = new GridScale(this.padding)
    this.hover = null
    this.history = []
    this.clickable = []
    this.keyable = []
    this.grabKeys = false
    this.lockKeys = false
    this.focused
    this.#buffer = ''
    this.renderIndex = -1
    if (options.title) this.title = options.title
    const cursor = options.cursor ?? (options.cursor = {
      artificial: options.artificialCursor,
      shape: options.cursorShape,
      blink: options.cursorBlink,
      color: options.cursorColor
    })
    this.cursor = {
      artificial: cursor.artificial || false,
      shape: cursor.shape || 'block',
      blink: cursor.blink || false,
      color: cursor.color || null,
      _set: false,
      _state: 1,
      _hidden: true
    }
    this.program.on(RESIZE, () => {
      self.alloc()
      self.render()
      function resizeHandler(node) {
        node.emit(RESIZE)
        node.sub.forEach(resizeHandler)
      }
      resizeHandler(self)
    })
    this.program.on(FOCUS, () => self.emit(FOCUS))
    this.program.on(BLUR, () => self.emit(BLUR))
    this.program.on(WARNING, text => self.emit(WARNING, text))
    this.on(NEW_LISTENER, type => {
      const pressListen = type === KEYPRESS || type.indexOf('key ') === 0
      const mouseListen = type === MOUSE
      if (pressListen || mouseListen) {
        if (pressListen) self._listenKeys()
        if (mouseListen) self._listenMouse()
      }
      if (
        type === MOUSE ||
        type === CLICK ||
        type === MOUSEOVER ||
        type === MOUSEOUT ||
        type === MOUSEDOWN ||
        type === MOUSEUP ||
        type === MOUSEWHEEL ||
        type === WHEELDOWN ||
        type === WHEELUP ||
        type === MOUSEMOVE
      ) self._listenMouse()
    })
    this.setMaxListeners(Infinity)
    this.enter()
    this.postEnter()
    this.on('adjourn', () => GlobalScreen.journal = false)
  }
  setupPos() {
    const t = this.t = this.top = this.absT = this.relT = this.intT = 0
    const b = this.b = this.bottom = this.absB = this.relB = this.intB = 0
    const l = this.l = this.left = this.absL = this.relL = this.intL = 0
    const r = this.r = this.right = this.absR = this.relR = this.intR = 0
    const h = this.h = this.height
    const w = this.w = this.width
    this.intH = 0
    this.intW = 0
    this.pos = new Detic(t, b, l, r, w, h)
  }
  setupProgram(options) {
    if (options.rsety && options.listen) options = { program: options }
    this.program = options.program ?? Program.build({
      input: options.input,
      output: options.output,
      log: options.log,
      debug: options.debug,
      dump: options.dump,
      terminal: options.terminal || options.term,
      resizeTimeout: options.resizeTimeout,
      forceUnicode: options.forceUnicode,
      tput: true,
      buffer: true,
      zero: true
    })

    this.program.setupTput()
    this.program.useBuffer = true
    this.program.zero = true
    this.program.options.resizeTimeout = options.resizeTimeout
    if (options.forceUnicode != null) {
      this.program.tput.features.unicode = options.forceUnicode
      this.program.tput.unicode = options.forceUnicode
    }
    this.tput = this.program.tput
    Logger.log('screen', 'setup-program', 'this.program.type', this.program.type)
  }
  get title() { return this.program.title }
  set title(title) { return this.program.title = title }
  get terminal() { return this.program.terminal }
  set terminal(terminal) { return this.setTerminal(terminal), this.program.terminal }
  get cols() { return this.program.cols }
  get rows() { return this.program.rows }
  get width() { return this.program.cols }
  get height() { return this.program.rows }
  get focused() { return this.history[this.history.length - 1] }
  set focused(el) {return this.focusPush(el) }

  get lines() { return this.currLines }
  get olines() { return this.prevLines }

  get position() { return this.pos }
  set position(val) { this.pos = val }

  alloc(dirty) {
    this.currLines = []
    this.prevLines = []
    for (let y = 0, normCell = Mor.build(this.dattr, SP); y < this.rows; y++) {
      const currLine = this.currLines[y] = [],
            prevLine = this.prevLines[y] = []
      currLine.dirty = !!dirty
      for (let x = 0; x < this.cols; x++) {
        currLine[x] = normCell.copy() // [ this.dattr, ' ' ]
        prevLine[x] = normCell.copy()
      }
    }
    this.program.clear()
  }
  realloc() { return this.alloc(true) }
  clearRegion(xLo, xHi, yLo, yHi, override) { return this.fillRegion(this.dattr, ' ', xLo, xHi, yLo, yHi, override) }
  fillRegion(at, ch, xLo, xHi, yLo, yHi, override) {
    const lines = this.currLines
    if (xLo < 0) xLo = 0
    if (yLo < 0) yLo = 0
    for (let line, temp = Mor.build(at, ch); yLo < yHi; yLo++) {
      if (!(line = lines[yLo])) break
      for (let i = xLo, cell; i < xHi; i++) {
        if (!(cell = line[i])) break
        if (override || !cell.eq(temp)) {
          cell.assign(temp), line.dirty = true
        }
      }
    }
  }
  #reduceColor(color) { return degrade(color, this.tput.colors) }
  #cursorAttr(cursor, normAttr) {
    const { shape } = cursor
    let at = normAttr || this.dattr,
        cursorAttr,
        ch
    if (shape === 'line') {
      at &= ~(0x1ff << 9)
      at |= 7 << 9
      ch = '\u2502'
    }
    else if (shape === 'underline') {
      at &= ~(0x1ff << 9)
      at |= 7 << 9
      at |= 2 << 18
    }
    else if (shape === 'block') {
      at &= ~(0x1ff << 9)
      at |= 7 << 9
      at |= 8 << 18
    }
    else if (typeof shape === OBJ && shape) {
      cursorAttr = styleToAttr(cursor, shape)
      if (shape.bold || shape.underline || shape.blink || shape.inverse || shape.invisible) {
        at &= ~(0x1ff << 18)
        at |= ((cursorAttr >> 18) & 0x1ff) << 18
      }
      if (shape.fg) {
        at &= ~(0x1ff << 9)
        at |= ((cursorAttr >> 9) & 0x1ff) << 9 // paste cursorAttr's
      }
      if (shape.bg) {
        at &= ~(0x1ff << 0)
        at |= cursorAttr & 0x1ff
      }
      if (shape.ch) { ch = shape.ch }
    }
    if (cursor.color != null) {
      at &= ~(0x1ff << 9)
      at |= cursor.color << 9
    }
    return Mor.build(at, ch)
  }
  screenshot(xLo, xHi, yLo, yHi, term) {
    if (xLo == null) xLo = 0
    if (xHi == null) xHi = this.cols
    if (yLo == null) yLo = 0
    if (yHi == null) yHi = this.rows
    if (xLo < 0) xLo = 0
    if (yLo < 0) yLo = 0
    const tempAttr = this.dattr
    if (term) { this.dattr = term.defAttr }
    let main = ''
    const normAttr = this.dattr
    for (let y = yLo, line; y < yHi; y++) {
      if (!(line = term?.lines[y] ?? this.currLines[y])) break
      let out      = '',
          currAttr = this.dattr
      for (let x = xLo, cell; x < xHi; x++) {
        if (!(cell = line[x])) break
        let at = cell.at, ch = cell.ch
        if (at !== currAttr) {
          if (currAttr !== normAttr) { out += CSI + SGR }
          if (at !== normAttr) {
            let nextAttr = at
            if (term) {
              if (((nextAttr >> 9) & 0x1ff) === 257) nextAttr |= 0x1ff << 9
              if (((nextAttr) & 0x1ff) === 256) nextAttr |= 0x1ff
            }
            out += attrToSgra(nextAttr, this.tput.colors)
          }
        }
        if (this.fullUnicode && unicode.charWidth(cell.ch) === 2) { x === xHi - 1 ? (ch = ' ') : x++ }
        out += ch
        currAttr = at
      }
      if (currAttr !== normAttr) { out += CSI + SGR }
      if (out) { main += (y > 0 ? LF : '') + out }
    }
    main = main.replace(/(?:\s*\x1b\[40m\s*\x1b\[m\s*)*$/, '') + LF
    if (term) { this.dattr = tempAttr }
    return main
  }
  attrCode(sgra, baseAttr, normAttr) { return sgraToAttr(sgra, baseAttr, normAttr) } // sgra to blessed attr
  codeAttr(attr) { return attrToSgra(attr, this.tput.colors) } // blessed attr to sgra
  render() {
    // const [ h, w ] = size(this.currLines)
    // console.log('>> [screen.render]', this.currLines)
    // console.log('>> [screen.render]', h, w)
    const self = this
    if (this.destroyed) return void 0
    this.emit(PRERENDER)
    this._borderStops = {}
    // TODO: Possibly get rid of .dirty altogether.
    // TODO: Could possibly drop .dirty and just clear the `lines` buffer every
    // time before a screen.render. This way clearRegion doesn't have to be
    // called in arbitrary places for the sake of clearing a spot where an
    // element used to be (e.g. when an element moves or is hidden). There could
    // be some overhead though.
    // this.screen.clearRegion(0, this.cols, 0, this.rows);
    this.renderIndex = 0
    this.sub.forEach(node => { (node.index = self.renderIndex++), node.render() })
    this.renderIndex = -1
    if (this.screen.dockBorders) { this.#dockBorders() }
    this.draw(0, this.currLines.length - 1)
    // XXX Workaround to deal with cursor pos before the screen has rendered and
    // prevPos is not reliable (stale).
    if (this.focused?._updateCursor) { this.focused._updateCursor(true) }
    this.renders++
    this.emit(RENDER)
  }
  draw(start, end) {
    let main = ''
    let clr,
        neq
    let lx = -1,
        ly = -1
    let acs
    if (this.#buffer) { main += this.#buffer, this.#buffer = '' }
    const { cursor, program, tput, options } = this
    for (let y = start; y <= end; y++) {
      let currLine = this.currLines[y],
          prevLine = this.prevLines[y]
      if (!currLine.dirty && !(cursor.artificial && y === program.y)) continue
      currLine.dirty = false
      let out = ''
      let currAttr = this.dattr

      for (let x = 0, currCell, prevCell; (x < currLine.length) && (currCell = currLine[x]); x++) {
        /** @type {Mor} */
        let nextCell = currCell.copy()
        let at = nextCell.at // let at = currCell.at
        let ch = nextCell.ch // let ch = currCell.ch
        // Render the artificial cursor.
        if (
          cursor.artificial && !cursor._hidden && cursor._state && x === program.x && y === program.y) {
          const cursorAttr = this.#cursorAttr(this.cursor, nextCell.at)
          nextCell.assign(cursorAttr)
          if (cursorAttr.ch) ch = cursorAttr.ch
          at = cursorAttr.at
        }
        // Take advantage of xterm's back_color_erase feature by using a
        // lookahead. Stop spitting out so many damn spaces. NOTE: Is checking
        // the bg for non BCE terminals worth the overhead?
        if (
          options.useBCE &&
          ch === ' ' &&
          (tput.booleans.back_color_erase || (at & 0x1ff) === (this.dattr & 0x1ff)) &&
          ((at >> 18) & 8) === ((this.dattr >> 18) & 8)
        ) {
          clr = true
          neq = false
          for (let i = x, currCell, prevCell; (i < currLine.length) && (currCell = currLine[i]); i++) {
            if (currCell.at !== at || currCell.ch !== ' ') {
              clr = false
              break
            }
            if ((prevCell = prevLine[i]) && !(currCell.eq(prevCell))) { neq = true }
          }
          if (clr && neq) {
            lx = -1, ly = -1
            if (at !== currAttr) { out += attrToSgra(at, this.tput.colors), currAttr = at }
            out += this.tput.cup(y, x), out += this.tput.el()
            for (let i = x, prevCell; (i < currLine.length) && (prevCell = prevLine[i]); i++) {
              prevCell.inject(at, ' ')
            }
            break
          }
        }
        // Optimize by comparing the real output
        // buffer to the pending output buffer.
        prevCell = prevLine[x]
        if (at === prevCell.at && ch === prevCell.ch) {
          if (lx === -1) { lx = x, ly = y }
          continue
        }
        else if (lx !== -1) {
          if (this.tput.literals.parm_right_cursor) { out += y === ly ? this.tput.cuf(x - lx) : this.tput.cup(y, x) }
          else { out += this.tput.cup(y, x) }
          lx = -1, ly = -1
        }
        prevCell.inject(at, ch)
        if (at !== currAttr) {
          if (currAttr !== this.dattr) { out += CSI + SGR }
          if (at !== this.dattr) {
            // console.log(`>> [{${ this.codename }}.draw()]`, `out += attrToSgra(${ at }, ${ this.tput.colors })`)
            out += attrToSgra(at, this.tput.colors)
          }
        }
        // If we find a double-width char, eat the next character which should be
        // a space due to parseContent's behavior.
        if (this.fullUnicode) {
          // If this is a surrogate pair double-width char, we can ignore it
          // because parseContent already counted it as length=2.
          if (unicode.charWidth(currLine[x].ch) === 2) {
            // NOTE: At cols=44, the bug that is avoided
            // by the angles check occurs in widget-unicode:
            // Might also need: `line[x + 1][0] !== line[x][0]`
            // for borderless boxes?
            if (x === currLine.length - 1 || ANGLES[currLine[x + 1].ch]) {
              // If we're at the end, we don't have enough space for a
              // double-width. Overwrite it with a space and ignore.
              ch = ' '
              prevCell.ch = '\0'
            }
            else {
              // ALWAYS refresh double-width chars because this special cursor
              // behavior is needed. There may be a more efficient way of doing
              // this. See above.
              prevCell.ch = '\0'
              // Eat the next character by moving forward and marking as a
              // space (which it is).
              prevLine[++x].ch = '\0'
            }
          }
        }
        // Attempt to use ACS for supported characters.
        // This is not ideal, but it's how ncurses works.
        // There are a lot of terminals that support ACS
        // *and UTF8, but do not declare U8. So ACS ends
        // up being used (slower than utf8). Terminals
        // that do not support ACS and do not explicitly
        // support UTF8 get their unicode characters
        // replaced with really ugly ascii characters.
        // It is possible there is a terminal out there
        // somewhere that does not support ACS, but
        // supports UTF8, but I imagine it's unlikely.
        // Maybe remove !this.tput.unicode check, however,
        // this seems to be the way ncurses does it.
        if (this.tput.literals.enter_alt_charset_mode &&
          !this.tput.brokenACS && (this.tput.acscr[ch] || acs)) {
          // Fun fact: even if this.tput.brokenACS wasn't checked here,
          // the linux console would still work fine because the acs
          // table would fail the check of: this.tput.acscr[ch]
          if (this.tput.acscr[ch]) {
            if (acs) { ch = this.tput.acscr[ch] }
            else {
              ch = this.tput.smacs() + this.tput.acscr[ch]
              acs = true
            }
          }
          else if (acs) {
            ch = this.tput.rmacs() + ch
            acs = false
          }
        }
        else {
          // U8 is not consistently correct. Some terminfo's
          // terminals that do not declare it may actually
          // support utf8 (e.g. urxvt), but if the terminal
          // does not declare support for ACS (and U8), chances
          // are it does not support UTF8. This is probably
          // the "safest" way to do this. Should fix things
          // like sun-color.
          // NOTE: It could be the case that the $LANG
          // is all that matters in some cases:
          // if (!this.tput.unicode && ch > '~') {
          if (!this.tput.unicode && this.tput.numerics.U8 !== 1 && ch > '~') ch = this.tput.utoa[ch] || '?'
        }
        out += ch
        currAttr = at
      }
      if (currAttr !== this.dattr) { out += CSI + SGR }
      if (out) { main += this.tput.cup(y, 0) + out }
    }
    if (acs) {
      main += this.tput.rmacs()
      acs = false
    }
    if (main) {
      let pre = '', post = ''
      pre += this.tput.sc(), post += this.tput.rc()
      if (!this.program.cursorHidden) { pre += this.tput.civis(), post += this.tput.cnorm() }
      // this.program.flush();
      // this.program.write(pre + main + post);
      this.program.writeOff(pre + main + post)
    }
    // this.emit('draw');
  }
  // This is how ncurses does it.
  // Scroll down (up cursor-wise).
  blankLine(ch, dirty) {
    const out = []
    const tempCell = Mor.build(this.dattr, ch || ' ')
    for (let x = 0; x < this.cols; x++) {
      out[x] = tempCell.copy() // out[x] = [ this.dattr, ch || ' ' ]
    }
    out.dirty = dirty
    return out
  }
  // boxes with clean sides?
  cleanSides(node) {
    const pos = node.prevPos
    if (!pos) { return false }
    if (pos._cleanSides != null) { return pos._cleanSides }
    if (pos.xLo <= 0 && pos.xHi >= this.width) { return pos._cleanSides = true }
    if (this.options.fastCSR) {
      // Maybe just do this instead of parsing.
      if (pos.yLo < 0) return pos._cleanSides = false
      if (pos.yHi > this.height) return pos._cleanSides = false
      return this.width - pos.dHori < 40 ? (pos._cleanSides = true) : (pos._cleanSides = false)
    }
    if (!this.options.smartCSR) { return false }
    // The scrollbar can't update properly, and there's also a
    // chance that the scrollbar may get moved around senselessly.
    // NOTE: In pratice, this doesn't seem to be the case.
    // if (this.scrollbar) {
    //   return pos._cleanSides = false;
    // }
    // Doesn't matter if we're only a height of 1.
    // if ((pos.yHi - el.intB) - (pos.yLo + el.intT) <= 1) {
    //   return pos._cleanSides = false;
    // }
    const yLo = pos.yLo + node.intT,
          yHi = pos.yHi - node.intB
    if (pos.yLo < 0) return pos._cleanSides = false
    if (pos.yHi > this.height) return pos._cleanSides = false
    if (pos.xLo - 1 < 0) return pos._cleanSides = true
    if (pos.xHi > this.width) return pos._cleanSides = true
    for (let x = pos.xLo - 1, line, cell; x >= 0; x--) {
      if (!(line = this.prevLines[yLo])) break
      const initCell = line[x]
      for (let y = yLo; y < yHi; y++) {
        if (!(line = this.prevLines[y]) || !(cell = line[x])) break
        cell = line[x]
        if (!cell.eq(initCell)) return pos._cleanSides = false
      }
    }
    for (let x = pos.xHi, line, cell; x < this.width; x++) {
      if (!(line = this.prevLines[yLo])) break
      const initCell = line[x]
      for (let y = yLo; y < yHi; y++) {
        if (!(line = this.prevLines[y]) || !(cell = line[x])) break
        if (!cell.eq(initCell)) return pos._cleanSides = false
      }
    }
    return pos._cleanSides = true
  }
  #dockBorders() {
    const lines = this.currLines
    let stops = this._borderStops
    // var keys, stop;
    //
    // keys = Object.keys(this._borderStops)
    //   .map(function(k) { return +k; })
    //   .sort(function(a, b) { return a - b; });
    //
    // for (i = 0; i < keys.length; i++) {
    //   y = keys[i];
    //   if (!lines[y]) continue;
    //   stop = this._borderStops[y];
    //   for (x = stop.xLo; x < stop.xHi; x++) {
    stops = Object
      .keys(stops)
      .map(k => +k)
      .sort((a, b) => a - b)
    for (let i = 0, y, line, cell; i < stops.length; i++) {
      y = stops[i]
      if (!(line = lines[y])) continue
      for (let x = 0; x < this.width; x++) {
        cell = line[x]
        if (ANGLES[cell.ch]) {
          cell.ch = this.#getAngle(lines, x, y)
          line.dirty = true
        }
      }
    }
  }

  setTerminal(terminal) {
    const entered = !!this.program.isAlt
    if (entered) {
      this.#buffer = ''
      this.program.ioBuffer = ''
      this.leave()
    }
    this.program.setTerminal(terminal)
    this.tput = this.program.tput
    if (entered) this.enter()
  }
  enter() {
    if (this.program.isAlt) return
    if (!this.cursor._set) {
      if (this.options.cursor.shape) { this.cursorShape(this.cursor.shape, this.cursor.blink)}
      if (this.options.cursor.color) { this.cursorColor(this.cursor.color)}
    }
    if (process.platform === 'win32')
      try {
        cp.execSync('cls', { stdio: 'ignore', timeout: 1000 })
      } catch (e) {}
    this.program.alternateBuffer()
    this.program.put.keypad_xmit()
    this.program.csr(0, this.height - 1)
    this.program.hideCursor()
    this.program.cup(0, 0)
    // We need this for tmux now:
    if (this.tput.literals.ena_acs) { this.program.writeOff(this.tput.enacs())}
    this.alloc()
  }
  leave() {
    if (!this.program.isAlt) return
    this.program.put.keypad_local()
    if (this.program.scrollTop !== 0 || this.program.scrollBottom !== this.rows - 1) this.program.csr(0, this.height - 1)
    // XXX For some reason if alloc/clear() is before this
    // line, it doesn't work on linux console.
    this.program.showCursor()
    this.alloc()
    if (this._listenedMouse) { this.program.disableMouse()}
    this.program.normalBuffer()
    if (this.cursor._set) this.cursorReset()
    this.program.flush()
    if (process.platform === 'win32')
      try {
        cp.execSync('cls', { stdio: 'ignore', timeout: 1000 })
      } catch (e) {}
  }
  postEnter() {
    const self = this
    if (this.options.debug) {
      this.debugLog = new Log({
        screen: this,
        sup: this,
        hidden: true,
        draggable: true,
        left: 'center',
        top: 'center',
        width: '30%',
        height: '30%',
        border: 'line',
        label: ' {bold}Debug Log{/bold} ',
        tags: true,
        keys: true,
        vi: true,
        mouse: true,
        scrollbar: {
          ch: ' ',
          track: { bg: 'yellow' },
          style: { inverse: true }
        }
      })
      this.debugLog.toggle = function () {
        if (self.debugLog.hidden) {
          self.saveFocus()
          self.debugLog.show()
          self.debugLog.setFront()
          self.debugLog.focus()
        }
        else {
          self.debugLog.hide()
          self.restoreFocus()
        }
        self.render()
      }
      this.debugLog.key([ 'q', 'escape' ], self.debugLog.toggle)
      this.key('f12', self.debugLog.toggle)
    }
    if (this.options.warnings) {
      this.on(WARNING, text => {
        const warning = new Box({
          screen: self,
          sup: self,
          left: 'center',
          top: 'center',
          width: 'shrink',
          padding: 1,
          height: 'shrink',
          align: 'center',
          valign: 'middle',
          border: 'line',
          label: ' {red-fg}{bold}WARNING{/} ',
          content: '{bold}' + text + '{/bold}',
          tags: true
        })
        self.render()
        const timeout = setTimeout(function () { warning.destroy(), self.render() }, 1500)
        if (timeout.unref) { timeout.unref() }
      })
    }
  }
  destroy = this._destroy
  _destroy() {
    this.leave()
    const index = GlobalScreen.instances.indexOf(this)
    Logger.log('screen', 'destroy', index)
    if (~index) {
      GlobalScreen.removeInstanceAt(index)
      // GlobalScreen.instances.splice(index, 1)
      // GlobalScreen.total--
      // GlobalScreen.global = GlobalScreen.instances[0]
      // if (GlobalScreen.total === 0) {
      //   GlobalScreen.global = null
      //   for (const [ signal, handler ] of Object.entries(GlobalScreen.handlers)) {
      //     process.off(signal, GlobalScreen[handler])
      //     delete GlobalScreen[handler]
      //   }
      //   delete GlobalScreen._bound
      // }
      this.destroyed = true
      this.emit(DESTROY)
      this._destroy()
    }
    this.program.destroy()
  }
  log() { return this.program.log.apply(this.program, arguments) }
  debug() {
    if (this.debugLog) { this.debugLog.log.apply(this.debugLog, arguments) }
    return this.program.debug.apply(this.program, arguments)
  }
  _listenMouse(el) {
    const self = this
    if (el && !~this.clickable.indexOf(el)) {
      el.clickable = true
      this.clickable.push(el)
    }
    if (this._listenedMouse) return
    this._listenedMouse = true
    this.program.enableMouse()
    if (this.options.sendFocus) this.program.setMouse({ sendFocus: true }, true)
    this.on(RENDER, function () { self._needsClickableSort = true })
    this.program.on(MOUSE, function (data) {
      if (self.lockKeys) return
      if (self._needsClickableSort) {
        self.clickable = helpers.hsort(self.clickable)
        self._needsClickableSort = false
      }
      let set
      for (let i = 0, node, pos; i < self.clickable.length && (node = self.clickable[i]); i++) {
        if (node.detached || !node.visible) continue
        // if (self.grabMouse && self.focused !== el
        //     && !el.hasAncestor(self.focused)) continue;
        pos = node.prevPos
        if (!pos) continue
        if (pos.xLo <= data.x && data.x < pos.xHi && pos.yLo <= data.y && data.y < pos.yHi) {
          node.emit(MOUSE, data)
          if (data.action === MOUSEDOWN) { self.mouseDown = node }
          else if (data.action === MOUSEUP) {
            (self.mouseDown || node).emit(CLICK, data)
            self.mouseDown = null
          }
          else if (data.action === MOUSEMOVE) {
            if (self.hover && node.index > self.hover.index) { set = false }
            if (self.hover !== node && !set) {
              if (self.hover) { self.hover.emit(MOUSEOUT, data) }
              node.emit(MOUSEOVER, data)
              self.hover = node
            }
            set = true
          }
          node.emit(data.action, data)
          break
        }
      }
      // Just mouseover?
      if ((data.action === MOUSEMOVE || data.action === MOUSEDOWN || data.action === MOUSEUP) && self.hover && !set) {
        self.hover.emit(MOUSEOUT, data)
        self.hover = null
      }
      self.emit(MOUSE, data)
      self.emit(data.action, data)
    })
    // Autofocus highest element.
    // this.on(ELEMENT_CLICK, function(el, data) {
    //   var target;
    //   do {
    //     if (el.clickable === true && el.options.autoFocus !== false) {
    //       target = el;
    //     }
    //   } while ((el = el.sup));
    //   if (target) target.focus();
    // });
    // Autofocus elements with the appropriate option.
    this.on(ELEMENT_CLICK, el => { if (el.clickable === true && el.options.autoFocus !== false) el.focus() })
  }
  enableMouse(el) { this._listenMouse(el) }
  _listenKeys(el) {
    const self = this
    if (el && !~this.keyable.indexOf(el)) {
      el.keyable = true
      this.keyable.push(el)
    }
    if (this._listenedKeys) return
    this._listenedKeys = true
    // NOTE: The event emissions used to be reversed:
    // element + screen
    // They are now:
    // screen + element
    // After the first keypress emitted, the handler
    // checks to make sure grabKeys, lockKeys, and focused
    // weren't changed, and handles those situations appropriately.
    this.program.on(KEYPRESS, function (ch, key) {
      if (self.lockKeys && !~self.ignoreLocked.indexOf(key.full)) { return }
      const focused  = self.focused,
            grabKeys = self.grabKeys
      if (!grabKeys || ~self.ignoreLocked.indexOf(key.full)) {
        self.emit(KEYPRESS, ch, key)
        self.emit('key ' + key.full, ch, key)
      }
      // If something changed from the screen key handler, stop.
      if (self.grabKeys !== grabKeys || self.lockKeys) { return }
      if (focused && focused.keyable) {
        focused.emit(KEYPRESS, ch, key)
        focused.emit('key ' + key.full, ch, key)
      }
    })
  }
  enableKeys(el) { this._listenKeys(el) }
  enableInput(el) {
    this._listenMouse(el)
    this._listenKeys(el)
  }
  _initHover() {
    const self = this
    if (this._hoverText) { return }
    this._hoverText = new Box({
      screen: this,
      left: 0,
      top: 0,
      tags: false,
      height: 'shrink',
      width: 'shrink',
      border: 'line',
      style: { border: { fg: 'default' }, bg: 'default', fg: 'default' }
    })
    this.on(MOUSEMOVE, function (data) {
      if (self._hoverText.detached) return
      self._hoverText.relL = data.x + 1
      self._hoverText.relT = data.y
      self.render()
    })
    this.on(ELEMENT_MOUSEOVER, function (el, data) {
      if (!el._hoverOptions) return
      self._hoverText.parseTags = el.parseTags
      self._hoverText.setContent(el._hoverOptions.text)
      self.append(self._hoverText)
      self._hoverText.relL = data.x + 1
      self._hoverText.relT = data.y
      self.render()
    })
    this.on(ELEMENT_MOUSEOUT, function () {
      if (self._hoverText.detached) return
      self._hoverText.detach()
      self.render()
    })
    // XXX This can cause problems if the
    // terminal does not support allMotion.
    // Workaround: check to see if content is set.
    this.on(ELEMENT_MOUSEUP, function (el) {
      if (!self._hoverText.getContent()) return
      if (!el._hoverOptions) return
      self.append(self._hoverText)
      self.render()
    })
  }

// This is how ncurses does it.
// Scroll up (down cursor-wise).
  insertLine(n, y, top, bottom) {
    // if (y === top) return this.insertLineNC(n, y, top, bottom);
    if (!this.tput.literals.change_scroll_region || !this.tput.literals.delete_line || !this.tput.literals.insert_line) return
    this.#buffer += this.tput.csr(top, bottom)
    this.#buffer += this.tput.cup(y, 0)
    this.#buffer += this.tput.il(n)
    this.#buffer += this.tput.csr(0, this.height - 1)
    const j = bottom + 1
    while (n--) {
      this.currLines.splice(y, 0, this.blankLine())
      this.currLines.splice(j, 1)
      this.prevLines.splice(y, 0, this.blankLine())
      this.prevLines.splice(j, 1)
    }
  }
  deleteLine(n, y, top, bottom) {
    // if (y === top) return this.deleteLineNC(n, y, top, bottom);
    if (!this.tput.literals.change_scroll_region || !this.tput.literals.delete_line || !this.tput.literals.insert_line) return
    this.#buffer += this.tput.csr(top, bottom)
    this.#buffer += this.tput.cup(y, 0)
    this.#buffer += this.tput.dl(n)
    this.#buffer += this.tput.csr(0, this.height - 1)
    const j = bottom + 1
    while (n--) {
      this.currLines.splice(j, 0, this.blankLine())
      this.currLines.splice(y, 1)
      this.prevLines.splice(j, 0, this.blankLine())
      this.prevLines.splice(y, 1)
    }
  }
// This will only work for top line deletion as opposed to arbitrary lines.
  insertLineNC(n, y, top, bottom) {
    if (!this.tput.literals.change_scroll_region || !this.tput.literals.delete_line) return
    this.#buffer += this.tput.csr(top, bottom)
    this.#buffer += this.tput.cup(top, 0)
    this.#buffer += this.tput.dl(n)
    this.#buffer += this.tput.csr(0, this.height - 1)
    const j = bottom + 1
    while (n--) {
      this.currLines.splice(j, 0, this.blankLine())
      this.currLines.splice(y, 1)
      this.prevLines.splice(j, 0, this.blankLine())
      this.prevLines.splice(y, 1)
    }
  }
// This will only work for bottom line deletion as opposed to arbitrary lines.
  deleteLineNC(n, y, top, bottom) {
    if (!this.tput.literals.change_scroll_region || !this.tput.literals.delete_line) return
    this.#buffer += this.tput.csr(top, bottom)
    this.#buffer += this.tput.cup(bottom, 0)
    this.#buffer += Array(n + 1).join(LF)
    this.#buffer += this.tput.csr(0, this.height - 1)
    const j = bottom + 1
    while (n--) {
      this.currLines.splice(j, 0, this.blankLine())
      this.currLines.splice(y, 1)
      this.prevLines.splice(j, 0, this.blankLine())
      this.prevLines.splice(y, 1)
    }
  }
  insertBottom(top, bottom) { return this.deleteLine(1, top, top, bottom) }
  // Parse the sides of an element to determine
  // whether an element has uniform cells on
  // both sides. If it does, we can use CSR to
  // optimize scrolling on a scrollable element.
  // Not exactly sure how worthwile this is.
  // This will cause a performance/cpu-usage hit,
  // but will it be less or greater than the
  // performance hit of slow-rendering scrollable
  insertTop(top, bottom) { return this.insertLine(1, top, top, bottom) }
  deleteBottom(top, bottom) { return this.clearRegion(0, this.width, bottom, bottom) }
  // Same as: return this.insertBottom(top, bottom);
  deleteTop(top, bottom) { return this.deleteLine(1, top, top, bottom) }
  #getAngle(lines, x, y) {
    let angle = 0
    const attr = lines[y][x][0],
          ch   = lines[y][x].ch
    if (lines[y][x - 1] && ANGLES_L[lines[y][x - 1].ch]) {
      if (!this.options.ignoreDockContrast) {
        if (lines[y][x - 1][0] !== attr) return ch
      }
      angle |= 1 << 3
    }
    if (lines[y - 1] && ANGLES_U[lines[y - 1][x].ch]) {
      if (!this.options.ignoreDockContrast) {
        if (lines[y - 1][x][0] !== attr) return ch
      }
      angle |= 1 << 2
    }
    if (lines[y][x + 1] && ANGLES_R[lines[y][x + 1].ch]) {
      if (!this.options.ignoreDockContrast) {
        if (lines[y][x + 1][0] !== attr) return ch
      }
      angle |= 1 << 1
    }
    if (lines[y + 1] && ANGLES_D[lines[y + 1][x].ch]) {
      if (!this.options.ignoreDockContrast) { if (lines[y + 1][x][0] !== attr) return ch }
      angle |= 1 << 0
    }
    // Experimental: fixes this situation:
    // +----------+
    //            | <-- empty space here, should be a T angle
    // +-------+  |
    // |       |  |
    // +-------+  |
    // |          |
    // +----------+
    // if (uangles[lines[y][x].ch]) {
    //   if (lines[y + 1] && cdangles[lines[y + 1][x].ch]) {
    //     if (!this.options.ignoreDockContrast) {
    //       if (lines[y + 1][x][0] !== attr) return ch;
    //     }
    //     angle |= 1 << 0;
    //   }
    // }
    return ANGLE_TABLE[angle] || ch
  }

  focusOffset(offset) {
    const shown = this.keyable.filter(el => !el.detached && el.visible).length
    if (!shown || !offset) { return }
    let i = this.keyable.indexOf(this.focused)
    if (!~i) return
    if (offset > 0) {
      while (offset--) {
        if (++i > this.keyable.length - 1) i = 0
        if (this.keyable[i].detached || !this.keyable[i].visible) offset++
      }
    }
    else {
      offset = -offset
      while (offset--) {
        if (--i < 0) i = this.keyable.length - 1
        if (this.keyable[i].detached || !this.keyable[i].visible) offset++
      }
    }
    return this.keyable[i].focus()
  }
  focusPrev = this.focusPrevious
  focusPrevious() { return this.focusOffset(-1) }
  focusNext() { return this.focusOffset(1) }
  focusPush(el) {
    if (!el) return
    const old = this.history[this.history.length - 1]
    if (this.history.length === 10) this.history.shift()
    this.history.push(el)
    this._focus(el, old)
  }
  focusPop() {
    const old = this.history.pop()
    if (this.history.length) this._focus(this.history[this.history.length - 1], old)
    return old
  }
  saveFocus() { return this._savedFocus = this.focused }
  restoreFocus() {
    if (!this._savedFocus) return
    this._savedFocus.focus()
    delete this._savedFocus
    return this.focused
  }
  rewindFocus() {
    const old = this.history.pop()
    let el
    while (this.history.length) {
      el = this.history.pop()
      if (!el.detached && el.visible) {
        this.history.push(el)
        this._focus(el, old)
        return el
      }
    }
    if (old) { old.emit(BLUR) }
  }
  _focus(self, old) {
    // Find a scrollable ancestor if we have one.
    let el = self
    while ((el = el.sup)) if (el.scrollable) break
    // If we're in a scrollable element,
    // automatically scroll to the focused element.
    if (el && !el.detached) {
      // NOTE: This is different from the other "visible" values - it needs the
      // visible height of the scrolling element itself, not the element within
      // it.
      const visible = self.screen.height - el.absT - el.intT - el.absB - el.intB
      if (self.relT < el.subBase) {
        el.scrollTo(self.relT)
        self.screen.render()
      }
      else if (self.relT + self.height - self.intB > el.subBase + visible) {
        // Explanation for el.intT here: takes into account scrollable elements
        // with borders otherwise the element gets covered by the bottom border:
        el.scrollTo(self.relT - (el.height - self.height) + el.intT, true)
        self.screen.render()
      }
    }
    if (old) { old.emit(BLUR, self) }
    self.emit(FOCUS, old)
  }

  key(...args) { return this.program.key.apply(this, args) }
  onceKey(...args) { return this.program.onceKey.apply(this, args) }
  unkey = this.removeKey
  removeKey(...args) { return this.program.unkey.apply(this, args) }
  spawn(file, args, options) {
    if (!Array.isArray(args)) {
      options = args
      args = []
    }
    const screen  = this,
          program = screen.program,
          mouse   = program.mouseEnabled
    let ps

    options = options || {}
    options.stdio = options.stdio || 'inherit'
    program.lsaveCursor('spawn')
    // program.csr(0, program.rows - 1);
    program.normalBuffer()
    program.showCursor()
    if (mouse) program.disableMouse()
    const write = program.output.write
    program.output.write = function () {}
    program.input.pause()
    if (program.input.setRawMode) { program.input.setRawMode(false) }
    const resume = function () {
      if (resume.done) return
      resume.done = true
      if (program.input.setRawMode) { program.input.setRawMode(true) }
      program.input.resume()
      program.output.write = write
      program.alternateBuffer()
      // program.csr(0, program.rows - 1);
      if (mouse) {
        program.enableMouse()
        if (screen.options.sendFocus) { screen.program.setMouse({ sendFocus: true }, true) }
      }
      screen.alloc()
      screen.render()
      screen.program.lrestoreCursor('spawn', true)
    }
    ps = spawn(file, args, options)
    ps.on(ERROR, resume)
    ps.on(EXIT, resume)
    return ps
  }
  exec(file, args, options, callback) {
    const ps = this.spawn(file, args, options)
    ps.on(ERROR, err => callback ? callback(err, false) : void 0)
    ps.on(EXIT, code => callback ? callback(null, code === 0) : void 0)
    return ps
  }
  readEditor(options, callback) {
    if (typeof options === STR) { options = { editor: options } }
    if (!callback) { (callback = options), (options = null) }
    if (!callback) { callback = function () {} }
    options = options || {}
    const self   = this,
          editor = options.editor || process.env.EDITOR || 'vi',
          name   = options.name || process.title || 'blessed',
          rnd    = Math.random().toString(36).split('.').pop(),
          file   = '/tmp/' + name + '.' + rnd,
          args   = [ file ]
    let opt

    opt = {
      stdio: 'inherit',
      env: process.env,
      cwd: process.env.HOME
    }
    function writeFile(callback) {
      if (!options.value) return callback()
      return fs.writeFile(file, options.value, callback)
    }
    return writeFile(function (err) {
      if (err) return callback(err)
      return self.exec(editor, args, opt, function (err, success) {
        if (err) return callback(err)
        return fs.readFile(file, 'utf8',
          (err, data) => fs.unlink(file, () => {
            if (!success) return callback(new Error('Unsuccessful.'))
            if (err) return callback(err)
            return callback(null, data)
          }))
      })
    })
  }
  displayImage(file, callback) {
    if (!file) {
      if (!callback) return
      return callback(new Error('No image.'))
    }
    file = path.resolve(process.cwd(), file)
    if (!~file.indexOf('://')) file = 'file://' + file
    const args = [ 'w3m', '-T', 'text/html' ]
    const input = '<title>press q to exit</title>' + '<img align="center" src="' + file + '">'
    const opt = {
      stdio: [ 'pipe', 1, 2 ],
      env: process.env,
      cwd: process.env.HOME
    }
    const ps = this.spawn(args[0], args.slice(1), opt)
    ps.on(ERROR, err => callback ? callback(err) : void 0)
    ps.on(EXIT,
      code => callback
        ? code !== 0
          ? callback(new Error('Exit Code: ' + code))
          : callback(null, code === 0)
        : void 0
    )
    ps.stdin.write(input + LF)
    ps.stdin.end()
  }
  setEffects(el, fel, over, out, effects, temp) {
    if (!effects) return
    const tmp = {}
    if (temp) el[temp] = tmp
    if (typeof el !== FUN) {
      const _el = el
      el = function () { return _el }
    }
    fel.on(over, function () {
      const element = el()
      Object.keys(effects).forEach(key => {
        const val = effects[key]
        if (val !== null && typeof val === OBJ) {
          tmp[key] = tmp[key] || {}
          // element.style[key] = element.style[key] || {};
          Object.keys(val).forEach(k => {
            const v = val[k]
            tmp[key][k] = element.style[key][k]
            element.style[key][k] = v
          })
          return
        }
        tmp[key] = element.style[key]
        element.style[key] = val
      })
      element.screen.render()
    })
    fel.on(out, () => {
      const element = el()
      Object.keys(effects).forEach(key => {
        const val = effects[key]
        if (val !== null && typeof val === OBJ) {
          tmp[key] = tmp[key] || {}
          // element.style[key] = element.style[key] || {};
          Object.keys(val).forEach(k => { if (tmp[key].hasOwnProperty(k)) element.style[key][k] = tmp[key][k] })
          return
        }
        if (tmp.hasOwnProperty(key)) element.style[key] = tmp[key]
      })
      element.screen.render()
    })
  }
  sigtstp(callback) {
    const self = this
    this.program.sigtstp(() => {
      self.alloc()
      self.render()
      self.program.lrestoreCursor('pause', true)
      if (callback) callback()
    })
  }
  copyToClipboard(text) { return this.program.copyToClipboard(text) }
  cursorShape(shape, blink) {
    const self = this
    this.cursor.shape = shape || 'block'
    this.cursor.blink = blink || false
    this.cursor._set = true
    if (this.cursor.artificial) {
      if (!this.program.hideCursor_old) {
        const hideCursor = this.program.hideCursor
        this.program.hideCursor_old = this.program.hideCursor
        this.program.hideCursor = function () {
          hideCursor.call(self.program)
          self.cursor._hidden = true
          if (self.renders) self.render()
        }
      }
      if (!this.program.showCursor_old) {
        const showCursor = this.program.showCursor
        this.program.showCursor_old = this.program.showCursor
        this.program.showCursor = function () {
          self.cursor._hidden = false
          if (self.program.exiting) showCursor.call(self.program)
          if (self.renders) self.render()
        }
      }
      if (!this._cursorBlink) {
        this._cursorBlink = setInterval(() => {
          if (!self.cursor.blink) return
          self.cursor._state ^= 1
          if (self.renders) self.render()
        }, 500)
        if (this._cursorBlink.unref) { this._cursorBlink.unref() }
      }
      return true
    }
    return this.program.cursorShape(this.cursor.shape, this.cursor.blink)
  }
  cursorColor(color) {
    this.cursor.color = color != null ? colors.convert(color) : null
    this.cursor._set = true
    if (this.cursor.artificial) { return true }
    return this.program.cursorColor(colors.ncolors[this.cursor.color])
  }
  cursorReset = this.resetCursor
  resetCursor() {
    this.cursor.shape = 'block'
    this.cursor.blink = false
    this.cursor.color = null
    this.cursor._set = false
    if (this.cursor.artificial) {
      this.cursor.artificial = false
      if (this.program.hideCursor_old) {
        this.program.hideCursor = this.program.hideCursor_old
        delete this.program.hideCursor_old
      }
      if (this.program.showCursor_old) {
        this.program.showCursor = this.program.showCursor_old
        delete this.program.showCursor_old
      }
      if (this._cursorBlink) {
        clearInterval(this._cursorBlink)
        delete this._cursorBlink
      }
      return true
    }
    return this.program.cursorReset()
  }
  /**
   * Positioning
   */
  calcPos() { return this }
}
