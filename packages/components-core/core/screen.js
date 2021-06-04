/**
 * screen.js - screen node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Node, ScreenCollection }                                      from '@pres/components-node'
import { ANGLE_TABLE, ANGLES, ANGLES_D, ANGLES_L, ANGLES_R, ANGLES_U } from '@pres/enum-angle-table'
import { CSI, LF }                                                     from '@pres/enum-control-chars'
import { SGR }                                                         from '@pres/enum-csi-codes'
import {
  BLUR, CLICK, DESTROY, ELEMENT_CLICK, ELEMENT_MOUSEOUT, ELEMENT_MOUSEOVER, ELEMENT_MOUSEUP, ERROR, EXIT, FOCUS,
  KEYPRESS, MOUSE, MOUSEDOWN, MOUSEMOVE, MOUSEOUT, MOUSEOVER, MOUSEUP, MOUSEWHEEL, NEW_LISTENER, PRERENDER, RENDER,
  RESIZE, WARNING, WHEELDOWN, WHEELUP,
}                                                                      from '@pres/enum-events'
import { Program }                                                     from '@pres/program'
import { attrToSgra, sgraToAttr }                                      from '@pres/util-colors'
import * as colors                                                     from '@pres/util-colors'
import * as helpers                                                    from '@pres/util-helpers'
import { Mor }                                                         from '@pres/util-morisot'
import * as unicode                                                    from '@pres/util-unicode'
import { SP }                                                          from '@texting/enum-chars'
import { FUN, OBJ, STR }                                               from '@typen/enum-data-types'
import { last }                                                        from '@vect/vector'
import cp, { spawn }                                                   from 'child_process'
import { Log }                                                         from '../src/log'
import { Box }                                                         from './box'

export class Screen extends Node {
  type = 'screen'
  constructor(options = {}) {
    options.sku = options.sku ?? 'screen'
    super(options, true)
    ScreenCollection.initialize(this)
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
    this.tabc = Array(( options.tabSize || 4 ) + 1).join(' ')
    this.dockBorders = options.dockBorders
    this.ignoreLocked = options.ignoreLocked || []
    this._unicode = this.tput.unicode || this.tput.numbers.U8 === 1
    this.fullUnicode = this.options.fullUnicode && this._unicode
    this.dattr = ( ( 0 << 18 ) | ( 0x1ff << 9 ) ) | 0x1ff
    this.renders = 0
    this.position = {
      left: this.left = this.aleft = this.rleft = 0,
      right: this.right = this.aright = this.rright = 0,
      top: this.top = this.atop = this.rtop = 0,
      bottom: this.bottom = this.abottom = this.rbottom = 0,
      get height() { return self.height },
      get width() { return self.width }
    }
    this.ileft = 0
    this.itop = 0
    this.iright = 0
    this.ibottom = 0
    this.iheight = 0
    this.iwidth = 0
    this.padding = { left: 0, top: 0, right: 0, bottom: 0 }
    this.hover = null
    this.history = []
    this.clickable = []
    this.keyable = []
    this.grabKeys = false
    this.lockKeys = false
    this.focused
    this._buf = ''
    this._ci = -1
    if (options.title) this.title = options.title
    const cursor = options.cursor ?? ( options.cursor = {
      artificial: options.artificialCursor,
      shape: options.cursorShape,
      blink: options.cursorBlink,
      color: options.cursorColor
    } )
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
      self.render();
      ( function emit(el) {
        el.emit(RESIZE)
        el.sub.forEach(emit)
      } )(self)
    })
    this.program.on(FOCUS, () => self.emit(FOCUS))
    this.program.on(BLUR, () => self.emit(BLUR))
    this.program.on(WARNING, text => self.emit(WARNING, text))
    this.on(NEW_LISTENER, type => {
      if (type === KEYPRESS || type.indexOf('key ') === 0 || type === MOUSE) {
        if (type === KEYPRESS || type.indexOf('key ') === 0) self._listenKeys()
        if (type === MOUSE) self._listenMouse()
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
    this.on('adjourn', () => ScreenCollection.journal = false)
  }
  setupProgram(options) {
    if (options.rsety && options.listen) options = { program: options }
    this.program = options.program
    if (!this.program) {
      this.program = Program.build({
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
    }
    else {
      this.program.setupTput()
      this.program.useBuffer = true
      this.program.zero = true
      this.program.options.resizeTimeout = options.resizeTimeout
      if (options.forceUnicode != null) {
        this.program.tput.features.unicode = options.forceUnicode
        this.program.tput.unicode = options.forceUnicode
      }
    }
    this.tput = this.program.tput
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
  clearRegion(xi, xl, yi, yl, override) { return this.fillRegion(this.dattr, ' ', xi, xl, yi, yl, override) }
  fillRegion(at, ch, xi, xl, yi, yl, override) {
    const lines = this.currLines
    if (xi < 0) xi = 0
    if (yi < 0) yi = 0
    for (let line, temp = Mor.build(at, ch); yi < yl; yi++) {
      if (!( line = lines[yi] )) break
      for (let i = xi, cell; i < xl; i++) {
        if (!( cell = line[i] )) break
        if (override || !cell.eq(temp)) {
          cell.assign(temp), line.dirty = true
        }
      }
    }
  }
  #reduceColor(color) { return colors.reduce(color, this.tput.colors) }
  #cursorAttr(cursor, normAttr) {
    const { shape } = cursor
    let at = normAttr || this.dattr,
        cursorAttr,
        ch
    if (shape === 'line') {
      at &= ~( 0x1ff << 9 )
      at |= 7 << 9
      ch = '\u2502'
    }
    else if (shape === 'underline') {
      at &= ~( 0x1ff << 9 )
      at |= 7 << 9
      at |= 2 << 18
    }
    else if (shape === 'block') {
      at &= ~( 0x1ff << 9 )
      at |= 7 << 9
      at |= 8 << 18
    }
    else if (typeof shape === OBJ && shape) {
      cursorAttr = Element.prototype.sattr.call(cursor, shape)
      if (shape.bold || shape.underline || shape.blink || shape.inverse || shape.invisible) {
        at &= ~( 0x1ff << 18 )
        at |= ( ( cursorAttr >> 18 ) & 0x1ff ) << 18
      }
      if (shape.fg) {
        at &= ~( 0x1ff << 9 )
        at |= ( ( cursorAttr >> 9 ) & 0x1ff ) << 9 // paste cursorAttr's
      }
      if (shape.bg) {
        at &= ~( 0x1ff << 0 )
        at |= cursorAttr & 0x1ff
      }
      if (shape.ch) { ch = shape.ch }
    }
    if (cursor.color != null) {
      at &= ~( 0x1ff << 9 )
      at |= cursor.color << 9
    }
    return Mor.build(at, ch)
  }
  screenshot(xi, xl, yi, yl, term) {
    if (xi == null) xi = 0
    if (xl == null) xl = this.cols
    if (yi == null) yi = 0
    if (yl == null) yl = this.rows
    if (xi < 0) xi = 0
    if (yi < 0) yi = 0
    const tempAttr = this.dattr
    if (term) { this.dattr = term.defAttr }
    let main = ''
    const normAttr = this.dattr
    for (let y = yi, line; y < yl; y++) {
      if (!( line = term?.lines[y] ?? this.currLines[y] )) break
      let out      = '',
          currAttr = this.dattr
      for (let x = xi, cell; x < xl; x++) {
        if (!( cell = line[x] )) break
        let at = cell[0], ch = cell.ch
        if (at !== currAttr) {
          if (currAttr !== normAttr) { out += CSI + SGR }
          if (at !== normAttr) {
            let nextAttr = at
            if (term) {
              if (( ( nextAttr >> 9 ) & 0x1ff ) === 257) nextAttr |= 0x1ff << 9
              if (( ( nextAttr ) & 0x1ff ) === 256) nextAttr |= 0x1ff
            }
            out += attrToSgra(nextAttr, this.tput.colors)
          }
        }
        if (this.fullUnicode && unicode.charWidth(cell.ch) === 2) { x === xl - 1 ? ( ch = ' ' ) : x++ }
        out += ch
        currAttr = at
      }
      if (currAttr !== normAttr) { out += CSI + SGR }
      if (out) { main += ( y > 0 ? LF : '' ) + out }
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
    if (this.destroyed) return
    this.emit(PRERENDER)
    this._borderStops = {}
    // TODO: Possibly get rid of .dirty altogether.
    // TODO: Could possibly drop .dirty and just clear the `lines` buffer every
    // time before a screen.render. This way clearRegion doesn't have to be
    // called in arbitrary places for the sake of clearing a spot where an
    // element used to be (e.g. when an element moves or is hidden). There could
    // be some overhead though.
    // this.screen.clearRegion(0, this.cols, 0, this.rows);
    this._ci = 0
    this.sub.forEach(el => { ( el.index = self._ci++ ), el.render() })
    this._ci = -1
    if (this.screen.dockBorders) { this._dockBorders() }
    this.draw(0, this.currLines.length - 1)
    // XXX Workaround to deal with cursor pos before the screen has rendered and
    // lpos is not reliable (stale).
    if (this.focused && this.focused._updateCursor) { this.focused._updateCursor(true) }
    this.renders++
    this.emit(RENDER)
  }
  draw(start, end) {
    let fore,
        back,
        mode
    let main = ''
    let clr,
        neq
    let lx = -1,
        ly = -1
    let acs
    if (this._buf) { main += this._buf, this._buf = '' }
    const { cursor, program, tput, options } = this
    for (let y = start; y <= end; y++) {
      let currLine = this.currLines[y],
          prevLine = this.prevLines[y]
      if (!currLine.dirty && !( cursor.artificial && y === program.y )) continue
      currLine.dirty = false
      let out = ''
      let currAttr = this.dattr

      for (let x = 0, currCell, prevCell; ( x < currLine.length ) && ( currCell = currLine[x] ); x++) {
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
          ( tput.bools.back_color_erase || ( at & 0x1ff ) === ( this.dattr & 0x1ff ) ) &&
          ( ( at >> 18 ) & 8 ) === ( ( this.dattr >> 18 ) & 8 )
        ) {
          clr = true
          neq = false
          for (let i = x, currCell, prevCell; ( i < currLine.length ) && ( currCell = currLine[i] ); i++) {
            if (currCell[0] !== at || currCell.ch !== ' ') {
              clr = false
              break
            }
            if (( prevCell = prevLine[i] ) && currCell[0] !== prevCell[0] || currCell.ch !== prevCell.ch) { neq = true }
          }
          if (clr && neq) {
            lx = -1, ly = -1
            if (at !== currAttr) { out += attrToSgra(at, this.tput.colors), currAttr = at }
            out += this.tput.cup(y, x), out += this.tput.el()
            for (let i = x, prevCell; ( i < currLine.length ) && ( prevCell = prevLine[i] ); i++) { prevCell[0] = at, prevCell.ch = ' ' }
            break
          }
        }
        // Optimize by comparing the real output
        // buffer to the pending output buffer.
        prevCell = prevLine[x]
        if (at === prevCell[0] && ch === prevCell.ch) {
          if (lx === -1) { lx = x, ly = y }
          continue
        }
        else if (lx !== -1) {
          if (this.tput.strings.parm_right_cursor) { out += y === ly ? this.tput.cuf(x - lx) : this.tput.cup(y, x) }
          else { out += this.tput.cup(y, x) }
          lx = -1, ly = -1
        }
        prevCell[0] = at
        prevCell.ch = ch
        if (at !== currAttr) {
          if (currAttr !== this.dattr) { out += CSI + SGR }
          if (at !== this.dattr) {
            out += CSI + ''
            back = at & 0x1ff
            fore = ( at >> 9 ) & 0x1ff
            mode = at >> 18
            if (mode & 1) { out += '1;' } // bold
            if (mode & 2) { out += '4;' } // underline
            if (mode & 4) { out += '5;' } // blink
            if (mode & 8) { out += '7;' } // inverse
            if (mode & 16) { out += '8;' } // invisible
            if (back !== 0x1ff) {
              back = this.#reduceColor(back)
              if (back < 16) {
                if (back < 8) { back += 40 }
                else if (back < 16) { back -= 8, back += 100 }
                out += back + ';'
              }
              else { out += '48;5;' + back + ';' }
            }
            if (fore !== 0x1ff) {
              fore = this.#reduceColor(fore)
              if (fore < 16) {
                if (fore < 8) { fore += 30 }
                else if (fore < 16) { fore -= 8, fore += 90 }
                out += fore + ';'
              }
              else { out += '38;5;' + fore + ';' }
            }
            if (last(out) === ';') out = out.slice(0, -1)
            out += SGR
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
        if (this.tput.strings.enter_alt_charset_mode &&
          !this.tput.brokenACS && ( this.tput.acscr[ch] || acs )) {
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
          if (!this.tput.unicode && this.tput.numbers.U8 !== 1 && ch > '~') ch = this.tput.utoa[ch] || '?'
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
      this.program._write(pre + main + post)
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
  cleanSides(el) {
    const pos = el.lpos
    if (!pos) { return false }
    if (pos._cleanSides != null) { return pos._cleanSides }
    if (pos.xi <= 0 && pos.xl >= this.width) { return pos._cleanSides = true }
    if (this.options.fastCSR) {
      // Maybe just do this instead of parsing.
      if (pos.yi < 0) return pos._cleanSides = false
      if (pos.yl > this.height) return pos._cleanSides = false
      return this.width - ( pos.xl - pos.xi ) < 40 ? ( pos._cleanSides = true ) : ( pos._cleanSides = false )
    }
    if (!this.options.smartCSR) { return false }
    // The scrollbar can't update properly, and there's also a
    // chance that the scrollbar may get moved around senselessly.
    // NOTE: In pratice, this doesn't seem to be the case.
    // if (this.scrollbar) {
    //   return pos._cleanSides = false;
    // }
    // Doesn't matter if we're only a height of 1.
    // if ((pos.yl - el.ibottom) - (pos.yi + el.itop) <= 1) {
    //   return pos._cleanSides = false;
    // }
    const yi = pos.yi + el.itop,
          yl = pos.yl - el.ibottom
    if (pos.yi < 0) return pos._cleanSides = false
    if (pos.yl > this.height) return pos._cleanSides = false
    if (pos.xi - 1 < 0) return pos._cleanSides = true
    if (pos.xl > this.width) return pos._cleanSides = true
    for (let x = pos.xi - 1, line, cell; x >= 0; x--) {
      if (!( line = this.prevLines[yi] )) break
      const initCell = line[x]
      for (let y = yi; y < yl; y++) {
        if (!( line = this.prevLines[y] ) || !( cell = line[x] )) break
        cell = line[x]
        if (!cell.eq(initCell)) return pos._cleanSides = false
      }
    }
    for (let x = pos.xl, line, cell; x < this.width; x++) {
      if (!( line = this.prevLines[yi] )) break
      const initCell = line[x]
      for (let y = yi; y < yl; y++) {
        if (!( line = this.prevLines[y] ) || !( cell = line[x] )) break
        if (!cell.eq(initCell)) return pos._cleanSides = false
      }
    }
    return pos._cleanSides = true
  }
  _dockBorders() {
    const lines = this.currLines
    let stops = this._borderStops,
        y,
        ch
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
    //   for (x = stop.xi; x < stop.xl; x++) {
    stops = Object
      .keys(stops)
      .map(k => +k)
      .sort((a, b) => a - b)
    for (let i = 0, line, cell; i < stops.length; i++) {
      y = stops[i]
      if (!( line = lines[y] )) continue
      for (let x = 0; x < this.width; x++) {
        cell = line[x]
        ch = cell.ch
        if (ANGLES[ch]) {
          cell.ch = this._getAngle(lines, x, y)
          line.dirty = true
        }
      }
    }
  }

  setTerminal(terminal) {
    const entered = !!this.program.isAlt
    if (entered) {
      this._buf = ''
      this.program._buf = ''
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
    if (this.tput.strings.ena_acs) { this.program._write(this.tput.enacs())}
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
    const index = ScreenCollection.instances.indexOf(this)
    if (~index) {
      ScreenCollection.instances.splice(index, 1)
      ScreenCollection.total--
      ScreenCollection.global = ScreenCollection.instances[0]
      if (ScreenCollection.total === 0) {
        ScreenCollection.global = null
        for (const [ signal, handler ] of Object.entries(ScreenCollection.handlers)) {
          process.off(signal, ScreenCollection[handler])
          delete ScreenCollection[handler]
        }
        delete ScreenCollection._bound
      }
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
      let i = 0,
          el,
          set,
          pos
      for (; i < self.clickable.length; i++) {
        el = self.clickable[i]
        if (el.detached || !el.visible) continue
        // if (self.grabMouse && self.focused !== el
        //     && !el.hasAncestor(self.focused)) continue;
        pos = el.lpos
        if (!pos) continue
        if (data.x >= pos.xi && data.x < pos.xl &&
          data.y >= pos.yi && data.y < pos.yl) {
          el.emit(MOUSE, data)
          if (data.action === MOUSEDOWN) { self.mouseDown = el }
          else if (data.action === MOUSEUP) {
            ( self.mouseDown || el ).emit(CLICK, data)
            self.mouseDown = null
          }
          else if (data.action === MOUSEMOVE) {
            if (self.hover && el.index > self.hover.index) { set = false }
            if (self.hover !== el && !set) {
              if (self.hover) { self.hover.emit(MOUSEOUT, data) }
              el.emit(MOUSEOVER, data)
              self.hover = el
            }
            set = true
          }
          el.emit(data.action, data)
          break
        }
      }
      // Just mouseover?
      if (( data.action === MOUSEMOVE || data.action === MOUSEDOWN || data.action === MOUSEUP ) && self.hover && !set) {
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
      style: {
        border: {
          fg: 'default'
        },
        bg: 'default',
        fg: 'default'
      }
    })
    this.on(MOUSEMOVE, function (data) {
      if (self._hoverText.detached) return
      self._hoverText.rleft = data.x + 1
      self._hoverText.rtop = data.y
      self.render()
    })
    this.on(ELEMENT_MOUSEOVER, function (el, data) {
      if (!el._hoverOptions) return
      self._hoverText.parseTags = el.parseTags
      self._hoverText.setContent(el._hoverOptions.text)
      self.append(self._hoverText)
      self._hoverText.rleft = data.x + 1
      self._hoverText.rtop = data.y
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
    if (!this.tput.strings.change_scroll_region || !this.tput.strings.delete_line || !this.tput.strings.insert_line) return
    this._buf += this.tput.csr(top, bottom)
    this._buf += this.tput.cup(y, 0)
    this._buf += this.tput.il(n)
    this._buf += this.tput.csr(0, this.height - 1)
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
    if (!this.tput.strings.change_scroll_region || !this.tput.strings.delete_line || !this.tput.strings.insert_line) return
    this._buf += this.tput.csr(top, bottom)
    this._buf += this.tput.cup(y, 0)
    this._buf += this.tput.dl(n)
    this._buf += this.tput.csr(0, this.height - 1)
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
    if (!this.tput.strings.change_scroll_region || !this.tput.strings.delete_line) return
    this._buf += this.tput.csr(top, bottom)
    this._buf += this.tput.cup(top, 0)
    this._buf += this.tput.dl(n)
    this._buf += this.tput.csr(0, this.height - 1)
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
    if (!this.tput.strings.change_scroll_region || !this.tput.strings.delete_line) return
    this._buf += this.tput.csr(top, bottom)
    this._buf += this.tput.cup(bottom, 0)
    this._buf += Array(n + 1).join(LF)
    this._buf += this.tput.csr(0, this.height - 1)
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
  _getAngle(lines, x, y) {
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
    while (( el = el.sup )) if (el.scrollable) break
    // If we're in a scrollable element,
    // automatically scroll to the focused element.
    if (el && !el.detached) {
      // NOTE: This is different from the other "visible" values - it needs the
      // visible height of the scrolling element itself, not the element within
      // it.
      const visible = self.screen.height - el.atop - el.itop - el.abottom - el.ibottom
      if (self.rtop < el.childBase) {
        el.scrollTo(self.rtop)
        self.screen.render()
      }
      else if (self.rtop + self.height - self.ibottom > el.childBase + visible) {
        // Explanation for el.itop here: takes into account scrollable elements
        // with borders otherwise the element gets covered by the bottom border:
        el.scrollTo(self.rtop - ( el.height - self.height ) + el.itop, true)
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
    if (!callback) { ( callback = options ), ( options = null ) }
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
          if (self.program._exiting) showCursor.call(self.program)
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
  _getPos() { return this }
}
