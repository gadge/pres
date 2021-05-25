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
  BLUR, CLICK, DESTROY, ELEMENT_CLICK, ELEMENT_MOUSEOUT, ELEMENT_MOUSEOVER, ELEMENT_MOUSEUP, ERROR, EXIT, FOCUS, KEY,
  KEYPRESS, MOUSE, MOUSEDOWN, MOUSEMOVE, MOUSEOUT, MOUSEOVER, MOUSEUP, MOUSEWHEEL, NEW_LISTENER, PRERENDER, RENDER,
  RESIZE, WARNING, WHEELDOWN, WHEELUP,
}                                                                      from '@pres/enum-events'
import { Program }                                                     from '@pres/program'
import { Presa, presaToSgra }                                          from '@pres/util-cezanne'
import { COLORS_4_BITS }                                               from '@pres/util-cezanne/src/cezanne'
import * as colors                                                     from '@pres/util-colors'
import * as helpers                                                    from '@pres/util-helpers'
import { morisotToSgra }                                               from '@pres/util-morisot'
import * as unicode                                                    from '@pres/util-unicode'
import { SP }                                                          from '@texting/enum-chars'
import { FUN, OBJ, STR }                                               from '@typen/enum-data-types'
import { size }                                                        from '@vect/matrix'
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
    this.tabc = Array((options.tabSize || 4) + 1).join(' ')
    this.dockBorders = options.dockBorders
    this.ignoreLocked = options.ignoreLocked || []
    this._unicode = this.tput.unicode || this.tput.numbers.U8 === 1
    this.fullUnicode = this.options.fullUnicode && this._unicode
    // this.normAttr = ((0 << 18) | (0x1ff << 9)) | 0x1ff // TODO: pr - changed this.dattr to this.normAttr
    this.normAttr = [ 0, null, null ]

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
    this.padding = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    }
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
    options.cursor = options.cursor || {
      artificial: options.artificialCursor,
      shape: options.cursorShape,
      blink: options.cursorBlink,
      color: options.cursorColor
    }
    this.cursor = {
      artificial: options.cursor.artificial || false,
      shape: options.cursor.shape || 'block',
      blink: options.cursor.blink || false,
      color: options.cursor.color || null,
      _set: false,
      _state: 1,
      _hidden: true
    }

    this.program.on(RESIZE, () => {
      self.alloc()
      self.render();
      (function emit(el) {
        el.emit(RESIZE)
        el.sub.forEach(emit)
      })(self)
    })
    this.program.on(FOCUS, () => self.emit(FOCUS))
    this.program.on(BLUR, () => self.emit(BLUR))
    this.program.on(WARNING, text => self.emit(WARNING, text))
    this.on(NEW_LISTENER, type => {
      if (type === KEYPRESS || type.indexOf(KEY + SP) === 0 || type === MOUSE) {
        if (type === KEYPRESS || type.indexOf(KEY + SP) === 0) self._listenKeys()
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
    console.log('>> [screen.config]', this.normAttr)
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
    this.on(RENDER, () => { self._needsClickableSort = true })
    this.program.on(MOUSE, data => {
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
            (self.mouseDown || el).emit(CLICK, data)
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
    if (el && !~this.keyable.indexOf(el)) { el.keyable = true, this.keyable.push(el) }
    if (this._listenedKeys) return
    this._listenedKeys = true
    // NOTE: The event emissions used to be reversed:
    // element + screen
    // They are now:
    // screen + element
    // After the first keypress emitted, the handler
    // checks to make sure grabKeys, lockKeys, and focused
    // weren't changed, and handles those situations appropriately.
    this.program.on(KEYPRESS, (ch, key) => {
      if (self.lockKeys && !~self.ignoreLocked.indexOf(key.full)) { return }
      const { focused, grabKeys } = self
      if (!grabKeys || ~self.ignoreLocked.indexOf(key.full)) {
        self.emit(KEYPRESS, ch, key)
        self.emit(KEY + SP + key.full, ch, key)
      }
      // If something changed from the screen key handler, stop.
      if (self.grabKeys !== grabKeys || self.lockKeys) { return }
      if (focused?.keyable) {
        focused.emit(KEYPRESS, ch, key)
        focused.emit(KEY + SP + key.full, ch, key)
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
    this.on(MOUSEMOVE, data => {
      if (self._hoverText.detached) return
      self._hoverText.rleft = data.x + 1
      self._hoverText.rtop = data.y
      self.render()
    })
    this.on(ELEMENT_MOUSEOVER, (el, data) => {
      if (!el._hoverOptions) return
      self._hoverText.parseTags = el.parseTags
      self._hoverText.setContent(el._hoverOptions.text)
      self.append(self._hoverText)
      self._hoverText.rleft = data.x + 1
      self._hoverText.rtop = data.y
      self.render()
    })
    this.on(ELEMENT_MOUSEOUT, () => {
      if (self._hoverText.detached) return
      self._hoverText.detach()
      self.render()
    })
    // XXX This can cause problems if the
    // terminal does not support allMotion.
    // Workaround: check to see if content is set.
    this.on(ELEMENT_MOUSEUP, el => {
      if (!self._hoverText.getContent()) return
      if (!el._hoverOptions) return
      self.append(self._hoverText)
      self.render()
    })
  }
  alloc(dirty) {
    this.lines = []
    const h = this.rows, w = this.cols
    for (let y = 0, line, cell; y < h; y++) {
      line = this.lines[y] = []
      for (let x = 0; x < w; x++) {
        cell = line[x] = [ this.normAttr ]
        cell.ch = SP
      }
      line.dirty = !!dirty
    }
    this.olines = []
    for (let y = 0, line, cell; y < h; y++) {
      line = this.olines[y] = []
      for (let x = 0; x < w; x++) {
        cell = line[x] = [ this.normAttr ]
        cell.ch = SP
      }
    }
    this.program.clear()
  }
  realloc() { return this.alloc(true) }
  render() {
    // const [ h, w ] = size(this.lines)
    console.log('>> [screen.render]', size(this.lines), 'this.lines[0][0]', this.lines[0][0])
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
    this.sub.forEach(el => { (el.index = self._ci++), el.render() })
    this._ci = -1
    if (this.screen.dockBorders) { this._dockBorders() }
    this.draw(0, this.lines.length - 1)
    // XXX Workaround to deal with cursor pos before the screen has rendered and
    // lpos is not reliable (stale).
    if (this.focused && this.focused._updateCursor) { this.focused._updateCursor(true) }
    this.renders++
    this.emit(RENDER)
  }
// This is how ncurses does it.
// Scroll down (up cursor-wise).
  blankLine(ch, dirty) {
    const out = []
    for (let x = 0; x < this.cols; x++) { out[x] = [ this.normAttr, ch || ' ' ] }
    out.dirty = dirty
    return out
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
      this.lines.splice(y, 0, this.blankLine())
      this.lines.splice(j, 1)
      this.olines.splice(y, 0, this.blankLine())
      this.olines.splice(j, 1)
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
      this.lines.splice(j, 0, this.blankLine())
      this.lines.splice(y, 1)
      this.olines.splice(j, 0, this.blankLine())
      this.olines.splice(y, 1)
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
      this.lines.splice(j, 0, this.blankLine())
      this.lines.splice(y, 1)
      this.olines.splice(j, 0, this.blankLine())
      this.olines.splice(y, 1)
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
      this.lines.splice(j, 0, this.blankLine())
      this.lines.splice(y, 1)
      this.olines.splice(j, 0, this.blankLine())
      this.olines.splice(y, 1)
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
      return this.width - (pos.xl - pos.xi) < 40 ? (pos._cleanSides = true) : (pos._cleanSides = false)
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
      if (!(line = this.olines[yi])) break
      const alpha = line[x]
      for (let y = yi; y < yl; y++) {
        if (!(line = this.olines[y]) || !(cell = line[x])) break
        if (!Presa.prototype.eq.call(cell, alpha) || cell.ch !== alpha.ch) return pos._cleanSides = false // cell[0] !== alpha[0]
      }
    }
    for (let x = pos.xl, line, cell; x < this.width; x++) {
      if (!(line = this.olines[yi])) break
      const alpha = line[x]
      for (let y = yi; y < yl; y++) {
        if (!(line = this.olines[y]) || !(cell = line[x])) break
        if (!Presa.prototype.eq.call(cell, alpha) || cell.ch !== alpha.ch) return pos._cleanSides = false // cell[0] !== alpha[0]
      }
    }
    return pos._cleanSides = true
  }
  _dockBorders() {
    const lines = this.lines
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
    //   for (x = stop.xi; x < stop.xl; x++) {
    stops = Object
      .keys(stops)
      .map(k => +k)
      .sort((a, b) => a - b)
    for (let i = 0, y, line, cell, ch; i < stops.length; i++) {
      y = stops[i]
      if (!(line = lines[y])) continue
      for (let x = 0; x < this.width; x++) {
        cell = line[x]
        ch = cell.ch
        if (ANGLES[ch]) {
          cell.ch = this.#getAngle(lines, x, y)
          line.dirty = true
        }
      }
    }
  }
  #getAngle(lines, x, y) {
    let angle = 0,
        line,
        cell,
        row,
        tar
    if (!(line = lines[y]) || !(cell = line[x])) return ANGLE_TABLE[angle]
    const attr               = cell,
          ch                 = cell.ch,
          ignoreDockContrast = this.options.ignoreDockContrast
    if ((tar = line[x - 1]) && ANGLES_L[tar.ch]) {
      if (!ignoreDockContrast && !Presa.prototype.eq.call(tar, attr)) return ch // tar[0] !== attr
      angle |= 1 << 3
    }
    if ((row = lines[y - 1]) && (tar = row[x]) && ANGLES_U[tar.ch]) {
      if (!ignoreDockContrast && !Presa.prototype.eq.call(tar, attr)) return ch // tar[0] !== attr
      angle |= 1 << 2
    }
    if ((tar = line[x + 1]) && ANGLES_R[tar.ch]) {
      if (!ignoreDockContrast && !Presa.prototype.eq.call(tar, attr)) return ch // tar[0] !== attr
      angle |= 1 << 1
    }
    if ((row = lines[y + 1]) && (tar = row[x]) && ANGLES_D[tar.ch]) {
      if (!ignoreDockContrast && !Presa.prototype.eq.call(tar, attr)) return ch // tar[0] !== attr
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
    // if (ANGLES_U[lines[y][x].ch]) {
    //   if (lines[y + 1] && cdANGLES[lines[y + 1][x].ch]) {
    //     if (!this.options.ignoreDockContrast) {
    //       if (lines[y + 1][x][0] !== attr) return ch;
    //     }
    //     angle |= 1 << 0;
    //   }
    // }
    return ANGLE_TABLE[angle] || ch
  }
  draw(start, end) {
    // console.log('>> [screen.draw]', start, end)
    let main = ''
    let lx = -1, ly = -1
    let acs
    if (this._buf) { main += this._buf, this._buf = '' }
    const { cursor, program, tput, options } = this,
          cursorArti                         = cursor.artificial,
          cursorArtiRender                   = cursorArti && !cursor._hidden && cursor._state,
          _x                                 = program.x,
          _y                                 = program.y,
          tBackErase                         = tput.bools.back_color_erase,
          tParmRCur                          = tput.strings.parm_right_cursor,
          tEnterAltCharsetMode               = tput.strings.enter_alt_charset_mode,
          tBrokenACS                         = tput.brokenACS,
          tColors                            = tput.colors
    for (let y = start; y <= end; y++) {
      let ln = this.lines[y], ol = this.olines[y]
      if (!ln.dirty && !(cursorArti && y === _y)) continue
      ln.dirty = false

      let out = ''
      let normAttr = Presa.build().assign(this.normAttr)
      let attr = Presa.build().assign(this.normAttr)

      for (let x = 0, ce, oc; (x < ln.length) && (ce = ln[x]); x++) {
        let data = Presa.build().assign(ce), ch = ce.ch//let [ data ] = ce, { ch } = ce
        // Render the artificial cursor.
        if (cursorArtiRender && x === _x && y === _y) {
          const cursorAttr = this.#cursorAttr(this.cursor, data)
          if (cursorAttr.ch) ch = cursorAttr.ch
          data = cursorAttr.attr
        }
        // Take advantage of xterm's back_color_erase feature by using a lookahead.
        // Stop spitting out so many damn spaces.
        // NOTE: Is checking the bg for non BCE terminals worth the overhead?
        if (options.useBCE && ch === SP &&
          (tBackErase || (data[2]) === (normAttr[2])) && // (tBackErase || (data & 0x1ff) === (normAttr & 0x1ff)) &&
          ((data[0]) & 8) === ((normAttr[0]) & 8) //  ((data >> 18) & 8) === ((normAttr >> 18) & 8)
        ) {
          let clr = true, neq = false
          for (let i = x, _ce, _oc; (i < ln.length) && (_ce = ln[i]); i++) {
            if (!Presa.prototype.eq.call(_ce, data) || _ce.ch !== SP) { //  if (_ce[0] !== data || _ce.ch !== SP) {
              clr = false
              break
            }
            if ((_oc = ol[i]) && !Presa.prototype.eq.call(_ce, _oc) || _ce.ch !== _oc.ch) { neq = true } // _ce[0] !== _oc[0]
          }
          if (clr && neq) {
            lx = -1, ly = -1
            if (data !== attr) { out += morisotToSgra(data, tColors), attr = data }
            out += tput.cup(y, x), out += tput.el()
            for (let i = x, _oc; (i < ln.length) && (_oc = ol[i]); i++) {
              Presa.prototype.assign.call(_oc, data, SP) // _oc[0] = data, _oc.ch = SP
            }
            break
          }
        }
        // Optimize by comparing the real output buffer to the pending output buffer.
        oc = ol[x]
        if (Presa.prototype.eq.call(data, oc) && ch === oc.ch) { // data === oc[0]
          if (lx === -1) { lx = x, ly = y }
          continue
        }
        else if (lx !== -1) {
          if (tParmRCur) { out += y === ly ? this.tput.cuf(x - lx) : this.tput.cup(y, x) }
          else { out += this.tput.cup(y, x) }
          lx = -1, ly = -1
        }
        Presa.prototype.assign(oc, data, ch) // oc[0] = data, oc.ch = ch
        if (data !== attr) { // data !== attr
          if (attr !== normAttr) { out += CSI + SGR } // attr !== normAttr
          if (data !== normAttr) { out += morisotToSgra(data, this.tput.colors) } // data !== normAttr
        }
        // If we find a double-width char, eat the next character which should be
        // a space due to parseContent's behavior.
        if (this.fullUnicode) {
          // If this is a surrogate pair double-width char, we can ignore it
          // because parseContent already counted it as length=2.
          if (unicode.charWidth(ln[x].ch) === 2) {
            // NOTE: At cols=44, the bug that is avoided
            // by the ANGLES check occurs in widget-unicode:
            // Might also need: `line[x + 1][0] !== line[x][0]`
            // for borderless boxes?
            if (x === ln.length - 1 || ANGLES[ln[x + 1].ch]) {
              // If we're at the end, we don't have enough space for a
              // double-width. Overwrite it with a space and ignore.
              ch = ' '
              oc.ch = '\0'
            }
            else {
              // ALWAYS refresh double-width chars because this special cursor
              // behavior is needed. There may be a more efficient way of doing
              // this. See above.
              oc.ch = '\0'
              // Eat the next character by moving forward and marking as a
              // space (which it is).
              ol[++x].ch = '\0'
            }
          }
        }
        // Attempt to use ACS for supported characters.
        // This is not ideal, but it's how ncurses works.
        // There are a lot of terminals that support ACS *and UTF8, but do not declare U8. So ACS ends up being used (slower than utf8).
        // Terminals that do not support ACS and do not explicitly support UTF8 get their unicode characters replaced with really ugly ascii characters.
        // It is possible there is a terminal out there somewhere that does not support ACS,
        // but supports UTF8, but I imagine it's unlikely.
        // Maybe remove !this.tput.unicode check, however, this seems to be the way ncurses does it.
        if (tEnterAltCharsetMode &&
          !tBrokenACS && (this.tput.acscr[ch] || acs)) {
          // Fun fact: even if this.tput.brokenACS wasn't checked here, the linux console would still work fine
          // because the acs table would fail the check of: this.tput.acscr[ch]
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
          // U8 is not consistently correct. Some terminfo's terminals that do not declare it may actually support utf8 (e.g. urxvt),
          // but if the terminal does not declare support for ACS (and U8), chances are it does not support UTF8.
          // This is probably the "safest" way to do this.
          // Should fix things like sun-color.
          // NOTE: It could be the case that the $LANG is all that matters in some cases:
          // if (!this.tput.unicode && ch > '~') {
          if (!this.tput.unicode && this.tput.numbers.U8 !== 1 && ch > '~') ch = this.tput.utoa[ch] || '?'
        }
        out += ch
        attr = data
      }
      if (attr !== normAttr) { out += CSI + SGR }
      if (out) { main += this.tput.cup(y, 0) + out }
    }
    if (acs) { main += this.tput.rmacs(), acs = false }
    if (main) {
      let l = '', r = ''
      l += this.tput.sc(), r += this.tput.rc()
      if (!this.program.cursorHidden) { l += this.tput.civis(), r += this.tput.cnorm() }
      this.program._write(l + main + r) // this.program.flush(); this.program.write(pre + main + post);
    }
    // this.emit('draw');
  }
  _reduceColor(color) { return colors.reduce(color, this.tput.colors) }
  // Convert an SGR string to our own attribute format. -> sgraToPresa
  attrCode(target, source, normal) {
    let effect = (source >> 18) & 0x1ff,
        fore   = (source >> 9) & 0x1ff,
        back   = (source) & 0x1ff
    const code = target.slice(2, -1).split(';')
    if (!code[0]) code[0] = '0'
    for (let i = 0, c; i < code.length; i++) {
      c = +code[i] || 0
      switch (c) {
        case 0: // normal
          back = normal & 0x1ff
          fore = (normal >> 9) & 0x1ff
          effect = (normal >> 18) & 0x1ff
          break
        case 1: // bold
          effect |= 1
          break
        case 22:
          effect = (normal >> 18) & 0x1ff
          break
        case 4: // underline
          effect |= 2
          break
        case 24:
          effect = (normal >> 18) & 0x1ff
          break
        case 5: // blink
          effect |= 4
          break
        case 25:
          effect = (normal >> 18) & 0x1ff
          break
        case 7: // inverse
          effect |= 8
          break
        case 27:
          effect = (normal >> 18) & 0x1ff
          break
        case 8: // invisible
          effect |= 16
          break
        case 28:
          effect = (normal >> 18) & 0x1ff
          break
        case 39: // default fg
          fore = (normal >> 9) & 0x1ff
          break
        case 49: // default bg
          back = normal & 0x1ff
          break
        case 100: // default fg/bg
          fore = (normal >> 9) & 0x1ff
          back = normal & 0x1ff
          break
        default: // color
          if (c === 48 && +code[i + 1] === 5) {
            i += 2
            back = +code[i]
            break
          }
          else if (c === 48 && +code[i + 1] === 2) {
            i += 2
            back = colors.match(+code[i], +code[i + 1], +code[i + 2])
            if (back === -1) back = normal & 0x1ff
            i += 2
            break
          }
          else if (c === 38 && +code[i + 1] === 5) {
            i += 2
            fore = +code[i]
            break
          }
          else if (c === 38 && +code[i + 1] === 2) {
            i += 2
            fore = colors.match(+code[i], +code[i + 1], +code[i + 2])
            if (fore === -1) fore = (normal >> 9) & 0x1ff
            i += 2
            break
          }
          if (c >= 40 && c <= 47) {
            back = c - 40
          }
          else if (c >= 100 && c <= 107) {
            back = c - 100
            back += 8
          }
          else if (c === 49) {
            back = normal & 0x1ff
          }
          else if (c >= 30 && c <= 37) {
            fore = c - 30
          }
          else if (c >= 90 && c <= 97) {
            fore = c - 90
            fore += 8
          }
          else if (c === 39) {
            fore = (normal >> 9) & 0x1ff
          }
          else if (c === 100) {
            fore = (normal >> 9) & 0x1ff
            back = normal & 0x1ff
          }
          break
      }
    }
    return (effect << 18) | (fore << 9) | back
  }
  // Convert our own attribute format to an SGR string. -> presaToSgra
  codeAttr(code) {
    let effect = (code >> 18) & 0x1ff,
        fore   = (code >> 9) & 0x1ff,
        back   = code & 0x1ff,
        out    = ''
    if (effect & 1) { out += '1;' } // bold
    if (effect & 2) { out += '4;' } // underline
    if (effect & 4) { out += '5;' } // blink
    if (effect & 8) { out += '7;' } // inverse
    if (effect & 16) { out += '8;' } // invisible
    if (back !== 0x1ff) {
      back = this._reduceColor(back)
      if (back < 16) {
        if (back < 8) { back += 40 }
        else if (back < 16) { back -= 8, back += 100 }
        out += back + ';'
      }
      else { out += '48;5;' + back + ';' }
    }
    if (fore !== 0x1ff) {
      fore = this._reduceColor(fore)
      if (fore < 16) {
        if (fore < 8) { fore += 30 }
        else if (fore < 16) { fore -= 8, fore += 90 }
        out += fore + ';'
      }
      else { out += '38;5;' + fore + ';' }
    }
    if (out[out.length - 1] === ';') out = out.slice(0, -1)
    return CSI + out + SGR
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
      const visible = self.screen.height - el.atop - el.itop - el.abottom - el.ibottom
      if (self.rtop < el.childBase) {
        el.scrollTo(self.rtop)
        self.screen.render()
      }
      else if (self.rtop + self.height - self.ibottom > el.childBase + visible) {
        // Explanation for el.itop here: takes into account scrollable elements
        // with borders otherwise the element gets covered by the bottom border:
        el.scrollTo(self.rtop - (el.height - self.height) + el.itop, true)
        self.screen.render()
      }
    }
    if (old) { old.emit(BLUR, self) }
    self.emit(FOCUS, old)
  }
  clearRegion(xi, xl, yi, yl, override) { return this.fillRegion(this.normAttr, ' ', xi, xl, yi, yl, override) }
  fillRegion(attr, ch, xi, xl, yi, yl, override) {
    console.log('>> [screen.fillRegion]', attr, ch, xi, xl, yi, yl, override)
    const { lines } = this
    if (xi < 0) xi = 0
    if (yi < 0) yi = 0
    for (let line; yi < yl; yi++) {
      if (!(line = lines[yi])) break
      for (let i = xi, cell; i < xl; i++) {
        if (!(cell = line[i])) break
        if (override || !Presa.prototype.eq.call(attr, cell) || ch !== cell.ch) { // if (override || attr !== cell[0] || ch !== cell.ch) {
          Presa.prototype.assign.call(cell, attr, ch), line.dirty = true // cell[0] = attr, cell.ch = ch, line.dirty = true
        }
      }
    }
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
    program.output.write = () => {}
    program.input.pause()
    if (program.input.setRawMode) { program.input.setRawMode(false) }
    const resume = () => {
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
    if (!callback) { callback = () => {} }
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
    return writeFile(err => {
      if (err) return callback(err)
      return self.exec(editor, args, opt, (err, success) => {
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
      el = () => _el
    }
    fel.on(over, () => {
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
        this.program.hideCursor = () => {
          hideCursor.call(self.program)
          self.cursor._hidden = true
          if (self.renders) self.render()
        }
      }
      if (!this.program.showCursor_old) {
        const showCursor = this.program.showCursor
        this.program.showCursor_old = this.program.showCursor
        this.program.showCursor = () => {
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
  #cursorAttr(cursor, normAttr) {
    console.log('>> [screen.#cursorAttr]')
    const { shape } = cursor
    let attr = Presa.build().assign(normAttr || this.normAttr), // attr = normAttr || this.normAttr
        cursorAttr,
        ch
    if (shape === 'line') {
      // attr &= ~(0x1ff << 9) // clear foreColor to 0
      // attr |= 7 << 9 // set foreColor to 7
      attr[1] = COLORS_4_BITS[7]
      ch = '\u2502'
    }
    else if (shape === 'underline') {
      // attr &= ~(0x1ff << 9) // clear foreColor to 0
      // attr |= 7 << 9 // set foreColor to 7
      // attr |= 2 << 18 // set effect to 2
      attr[1] = COLORS_4_BITS[7]
      attr[0] |= 2
    }
    else if (shape === 'block') {
      // attr &= ~(0x1ff << 9) // clear foreColor to 0
      // attr |= 7 << 9 // set foreColor to 7
      // attr |= 8 << 18 // set effect to 8
      attr[1] = COLORS_4_BITS[7]
      attr[0] |= 8
    }
    else if (typeof shape === OBJ && shape) {
      cursorAttr = Element.prototype.sattr.call(cursor, shape)
      if (shape.bold || shape.underline || shape.blink || shape.inverse || shape.invisible) {
        // attr &= ~(0x1ff << 18) // clear effect to 0
        // attr |= ((cursorAttr >> 18) & 0x1ff) << 18 // clean cursorAttr effect and paste the effect to attr
        attr[0] |= cursorAttr[0]
      }
      if (shape.fg) {
        // attr &= ~(0x1ff << 9) // clear foreColor to 0
        // attr |= ((cursorAttr >> 9) & 0x1ff) << 9  // clean cursorAttr foreColor and paste the foreColor to attr
        attr[1] = cursorAttr[1]
      }
      if (shape.bg) {
        // attr &= ~(0x1ff << 0) // clear backColor to 0
        // attr |= cursorAttr & 0x1ff // clean cursorAttr backColor and paste the backColor to attr
        attr[2] = cursorAttr[2]
      }
      if (shape.ch) { ch = shape.ch }
    }
    if (cursor.color != null) {
      // attr &= ~(0x1ff << 9) // clear foreColor to 0
      // attr |= cursor.color << 9 // shift cursor.color to foreColor bit-position and paste it to attr
      attr[1] = cursor.color
    }
    return { ch, attr }
  }
  screenshot(xi, xl, yi, yl, term) {
    console.log('>> [screen.screenShot]')
    if (xi == null) xi = 0
    if (xl == null) xl = this.cols
    if (yi == null) yi = 0
    if (yl == null) yl = this.rows
    if (xi < 0) xi = 0
    if (yi < 0) yi = 0
    const screenAttr = Presa.build().assign(this.normAttr) // screenAttr = this.normAttr
    if (term) { Presa.prototype.assign.call(this.normAttr, term.defAttr) } // this.normAttr = term.defAttr
    let main = ''
    for (let y = yi, line, out, attr = Presa.build(); y < yl; y++) {
      line = term ? term.lines[y] : this.lines[y]
      if (!line) break

      out = ''
      Presa.prototype.assign.call(attr, this.normAttr) // attr = this.normAttr

      for (let x = xi, cell, at, ch; x < xl; x++) {
        if (!(cell = line[x])) break
        at = cell, ch = cell.ch // at = cell[0], ch = cell.ch
        if (!Presa.prototype.eq.call(at, attr)) { // at !== attr
          if (!Presa.prototype.eq.call(attr, this.normAttr)) out += CSI + SGR // at !== this.normAttr
          if (!Presa.prototype.eq.call(at, this.normAttr)) { // at !== this.normAttr
            let _at = at.slice() // let _at = at
            if (term) {
              // if (((_at >> 9) & 0x1ff) === 257) _at |= 0x1ff << 9 // if foreColor is 257, foreColor set to NAC
              // if ((_at & 0x1ff) === 256) _at |= 0x1ff // if backColor is 256, backColor set to NAC
              //
              // if (_at[1] === NAC) {}
              // if (_at[0] === NAC) {}
            }
            out += presaToSgra(_at, this.tput.colors) // morisotToSgra(_at, this.tput.colors)
          }
        }
        if (this.fullUnicode) {
          if (unicode.charWidth(cell.ch) === 2) {
            if (x === xl - 1) { ch = SP }
            else { x++ }
          }
        }
        out += ch
        Presa.prototype.assign.call(attr, at) // attr = at
      }
      if (!Presa.prototype.eq.call(attr, this.normAttr)) { out += CSI + SGR } // attr !== this.normAttr
      if (out) { main += (y > 0 ? LF : '') + out }
    }
    main = main.replace(/(?:\s*\x1b\[40m\s*\x1b\[m\s*)*$/, '') + LF
    if (term) { Presa.prototype.assign.call(this.normAttr, screenAttr) } // this.normAttr = screenAttr
    return main
  }
  /**
   * Positioning
   */
  _getPos() { return this }
}

