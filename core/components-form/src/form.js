/**
 * form.js - form element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Box }                                                from '@pres/components-core'
import { CANCEL, ELEMENT_KEYPRESS, KEYPRESS, RESET, SUBMIT, } from '@pres/enum-events'
import { BACKSPACE, DOWN, ENTER, ESCAPE, TAB, UP, }           from '@pres/enum-key-names'

export class Form extends Box {
  constructor(options = {}) {
    if (!options.sku) options.sku = 'form'
    options.ignoreKeys = true
    super(options)
    const self = this
    // if (!(this instanceof Node)) return new Form(options)
    if (options.keys) {
      this.screen._listenKeys(this)
      this.on(ELEMENT_KEYPRESS, function (el, ch, key) {
        if (
          ( key.name === TAB && !key.shift ) ||
          ( el.type === 'textbox' && options.autoNext && key.name === ENTER ) ||
          ( key.name === DOWN ) ||
          ( options.vi && key.name === 'j' )
        ) {
          if (el.type === 'textbox' || el.type === 'textarea') {
            if (key.name === 'j') return
            if (key.name === TAB) el.emit(KEYPRESS, null, { name: BACKSPACE }) // Workaround, since we can't stop the tab from being added.
            el.emit(KEYPRESS, '\x1b', { name: ESCAPE })
          }
          self.focusNext()
          return
        }
        if (
          ( key.name === TAB && key.shift ) ||
          ( key.name === UP ) ||
          ( options.vi && key.name === 'k' )
        ) {
          if (el.type === 'textbox' || el.type === 'textarea') {
            if (key.name === 'k') return
            el.emit(KEYPRESS, '\x1b', { name: ESCAPE })
          }
          self.focusPrevious()
          return
        }
        if (key.name === ESCAPE) self.focus()
      })
    }
    this.type = 'form'
  }
  static build(options) { return new Form(options) }
  _refresh() {
    // XXX Possibly remove this if statement and refresh on every focus.
    // Also potentially only include *visible* focusable elements.
    // This would remove the need to check for _selected.visible in previous()
    // and next().
    if (!this._sub) {
      const out = []
      this.sub.forEach(function refreshSub(el) {
        if (el.keyable) out.push(el)
        el.sub.forEach(refreshSub)
      })
      this._sub = out
    }
  }
  _visible() { return !!this._sub.filter(el => el.visible).length }
  next() {
    this._refresh()
    if (!this._visible()) return
    if (!this._selected) {
      this._selected = this._sub[0]
      if (!this._selected.visible) return this.next()
      if (this.screen.focused !== this._selected) return this._selected
    }
    const i = this._sub.indexOf(this._selected)
    if (!~i || !this._sub[i + 1]) {
      this._selected = this._sub[0]
      if (!this._selected.visible) return this.next()
      return this._selected
    }
    this._selected = this._sub[i + 1]
    if (!this._selected.visible) return this.next()
    return this._selected
  }
  previous() {
    this._refresh()
    if (!this._visible()) return
    if (!this._selected) {
      this._selected = this._sub[this._sub.length - 1]
      if (!this._selected.visible) return this.previous()
      if (this.screen.focused !== this._selected) return this._selected
    }
    const i = this._sub.indexOf(this._selected)
    if (!~i || !this._sub[i - 1]) {
      this._selected = this._sub[this._sub.length - 1]
      if (!this._selected.visible) return this.previous()
      return this._selected
    }
    this._selected = this._sub[i - 1]
    if (!this._selected.visible) return this.previous()
    return this._selected
  }
  focusNext() {
    const next = this.next()
    if (next) next.focus()
  }
  focusPrevious() {
    const previous = this.previous()
    if (previous) previous.focus()
  }
  resetSelected() { this._selected = null }
  focusFirst() {
    this.resetSelected()
    this.focusNext()
  }
  focusLast() {
    this.resetSelected()
    this.focusPrevious()
  }
  submit() {
    const out = {}
    this.sub.forEach(function submitSub(el) {
      if (el.value != null) {
        const name = el.name || el.type
        if (Array.isArray(out[name])) { out[name].push(el.value) }
        else if (out[name]) { out[name] = [ out[name], el.value ] }
        else { out[name] = el.value }
      }
      el.sub.forEach(submitSub)
    })
    this.emit(SUBMIT, out)
    return this.submission = out
  }
  cancel() { this.emit(CANCEL) }
  reset() {
    this.sub.forEach(function resetSub(el) {
      switch (el.type) {
        case 'screen':
          break
        case 'box':
          break
        case 'text':
          break
        case 'line':
          break
        case 'scrollable-box':
          break
        case 'list':
          el.select(0)
          return
        case 'form':
          break
        case 'input':
          break
        case 'textbox':
          el.clearInput()
          return
        case 'textarea':
          el.clearInput()
          return
        case 'button':
          delete el.value
          break
        case 'progress-bar':
          el.setProgress(0)
          break
        case 'file-manager':
          el.refresh(el.options.cwd)
          return
        case 'checkbox':
          el.uncheck()
          return
        case 'radio-set':
          break
        case 'radio-button':
          el.uncheck()
          return
        case 'prompt':
          break
        case 'question':
          break
        case 'message':
          break
        case 'info':
          break
        case 'loading':
          break
        case 'list-bar':
          //el.select(0);
          break
        case 'dir-manager':
          el.refresh(el.options.cwd)
          return
        case 'terminal':
          el.write('')
          return
        case 'image':
          //el.clearImage();
          return
      }
      el.sub.forEach(resetSub)
    })
    this.emit(RESET)
  }
}





