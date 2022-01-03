/**
 * textarea.js - textarea element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { ACTION, BLUR, CANCEL, CLICK, ERROR, FOCUS, KEYPRESS, MOVE, RESIZE, SUBMIT, } from '@pres/enum-events'
import { BACKSPACE, DOWN, ENTER, ESCAPE, LEFT, RETURN, RIGHT, UP, }                   from '@pres/enum-key-names'
import * as unicode                                                                   from '@pres/util-unicode'
import { Input }                                                                      from './input'


const nextTick = global.setImmediate || process.nextTick.bind(process)
export class Textarea extends Input {
  input = this.readInput
  setInput = this.readInput
  clearInput = this.clearValue
  editor = this.readEditor
  setEditor = this.readEditor
  /**
   * Textarea
   */
  constructor(options = {}) {
    if (!options.sku) options.sku = 'textarea'
    options.scrollable = options.scrollable !== false
    super(options)
    const self = this
    // if (!(this instanceof Node)) { return new Textarea(options) }
    this.screen._listenKeys(this)
    this.value = options.value || ''
    this.__updateCursor = this._updateCursor.bind(this)
    this.on(RESIZE, this.__updateCursor)
    this.on(MOVE, this.__updateCursor)
    if (options.inputOnFocus)
      this.on(FOCUS, this.readInput.bind(this, null))
    if (!options.inputOnFocus && options.keys)
      this.on(KEYPRESS, (ch, key) => {
        if (self._reading) return
        if (key.name === ENTER || (options.vi && key.name === 'i')) return self.readInput()
        if (key.name === 'e') return self.readEditor()
      })
    if (options.mouse)
      this.on(CLICK, (data) => {
        if (self._reading) return
        if (data.button !== RIGHT) return
        self.readEditor()
      })
    this.type = 'textarea'
    // console.log(`>>> constructed ${this.type}`)
  }
  static build(options) { return new Textarea(options) }
  _updateCursor(get) {
    if (this.screen.focused !== this) return
    const prevPos = get ? this.prevPos : this.calcCoord()
    if (!prevPos) return
    let last = this._clines[this._clines.length - 1]
    const program = this.screen.program
    let line,
        cx,
        cy
    // Stop a situation where the textarea begins scrolling
    // and the last cline appears to always be empty from the
    // _typeScroll `+ '\n'` thing.
    // Maybe not necessary anymore?
    if (last === '' && this.value[this.value.length - 1] !== '\n') {
      last = this._clines[this._clines.length - 2] || ''
    }
    line = Math.min(
      this._clines.length - 1 - (this.subBase || 0),
      (prevPos.yHi - prevPos.yLo) - this.intH - 1)
    // When calling clearValue() on a full textarea with a border, the first
    // argument in the above Math.min call ends up being -2. Make sure we stay
    // positive.
    line = Math.max(0, line)
    cy = prevPos.yLo + this.intT + line
    cx = prevPos.xLo + this.intL + this.strWidth(last)
    // XXX Not sure, but this may still sometimes
    // cause problems when leaving editor.
    if (cy === program.y && cx === program.x) return
    if (cy === program.y) {
      if (cx > program.x) { program.cuf(cx - program.x) }
      else if (cx < program.x) { program.cub(program.x - cx) }
    }
    else if (cx === program.x) {
      if (cy > program.y) { program.cud(cy - program.y) }
      else if (cy < program.y) { program.cuu(program.y - cy) }
    }
    else { program.cup(cy, cx) }
  }
  readInput(callback) {
    // console.log('>>> calling textarea.readInput')
    const self    = this,
          focused = this.screen.focused === this
    if (this._reading) return
    this._reading = true
    this._callback = callback
    if (!focused) {
      this.screen.saveFocus()
      this.focus()
    }
    this.screen.grabKeys = true
    this._updateCursor()
    this.screen.program.showCursor()
    //this.screen.program.sgr('normal');
    this._done = function fn(err, value) {
      if (!self._reading) return void 0
      if (fn.done) return void 0
      fn.done = true
      self._reading = false
      delete self._callback
      delete self._done
      self.removeListener(KEYPRESS, self.__listener)
      delete self.__listener
      self.removeListener(BLUR, self.__done)
      delete self.__done
      self.screen.program.hideCursor()
      self.screen.grabKeys = false
      if (!focused) self.screen.restoreFocus()
      if (self.options.inputOnFocus) self.screen.rewindFocus()
      // Ugly
      if (err === 'stop') return void 0
      if (err) { self.emit(ERROR, err) }
      else if (value != null) { self.emit(SUBMIT, value) }
      else { self.emit(CANCEL, value) }
      self.emit(ACTION, value)
      if (!callback) return void 0
      return err
        ? callback(err)
        : callback(null, value)
    }
    // Put this in a nextTick so the current
    // key event doesn't trigger any keys input.
    nextTick(() => {
      // console.log('>>> calling nextTick in TextArea')
      self.__listener = self._listener.bind(self)
      self.on(KEYPRESS, self.__listener)
    })
    this.__done = this._done.bind(this, null, null)
    this.on(BLUR, this.__done)
  }
  _listener(ch, key) {
    // console.log('>>> calling _listener in TextArea')
    const done  = this._done,
          value = this.value
    if (key.name === RETURN) return
    if (key.name === ENTER) ch = '\n'
    // TODO: Handle directional keys.
    if (key.name === LEFT || key.name === RIGHT || key.name === UP || key.name === DOWN) {}
    if (this.options.keys && key.ctrl && key.name === 'e') return this.readEditor()
    // TODO: Optimize typing by writing directly
    // to the screen and screen buffer here.
    if (key.name === ESCAPE) { done(null, null) }
    else if (key.name === BACKSPACE) {
      if (this.value.length) {
        if (this.screen.fullUnicode) {
          // || unicode.isCombining(this.value, this.value.length - 1)) {
          if (unicode.isSurrogate(this.value, this.value.length - 2)) { this.value = this.value.slice(0, -2) }
          else { this.value = this.value.slice(0, -1) }
        }
        else { this.value = this.value.slice(0, -1) }
      }
    }
    else if (ch) { if (!/^[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]$/.test(ch)) { this.value += ch } }
    if (this.value !== value) { this.screen.render() }
  }
  _typeScroll() {
    // XXX Workaround
    const height = this.height - this.intH
    if (this._clines.length - this.subBase > height) { this.scroll(this._clines.length) }
  }
  getValue() { return this.value }
  setValue(value) {
    if (value == null) value = this.value
    if (this._value !== value) {
      this.value = value
      this._value = value
      this.setContent(this.value)
      this._typeScroll()
      this._updateCursor()
    }
  }
  clearValue() { return this.setValue('') }
  submit() { return !this.__listener ? void 0 : this.__listener('\x1b', { name: ESCAPE }) }
  cancel() { return !this.__listener ? void 0 : this.__listener('\x1b', { name: ESCAPE }) }
  render() { return this.setValue(), this.renderElement() }
  readEditor(callback) {
    // console.log('>>> readEditor in textarea')
    const self = this
    if (this._reading) {
      const _cb = this._callback,
            cb  = callback
      this._done('stop')
      callback = (err, value) => {
        if (_cb) _cb(err, value)
        if (cb) cb(err, value)
      }
    }
    if (!callback) callback = function () {}
    return this.screen.readEditor({ value: this.value }, function (err, value) {
      if (err) {
        if (err.message === 'Unsuccessful.') {
          self.screen.render()
          return self.readInput(callback)
        }
        self.screen.render()
        self.readInput(callback)
        return callback(err)
      }
      self.setValue(value)
      self.screen.render()
      return self.readInput(callback)
    })
  }
}



