/**
 * form.js - form element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
import { Box } from '@pres/components-core'

/**
 * Form
 */

import { ATTACH, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEWLISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHTEXCEPTION, WARNING, } from '@pres/enum-events'

export class  Form extends Box {
  constructor(options = {}) {
    options.ignoreKeys = true
    super(options)
    const self = this
    // if (!(this instanceof Node)) return new Form(options)
    if (options.keys) {
      this.screen._listenKeys(this)
      this.on(ELEMENT_KEYPRESS, function (el, ch, key) {
        if ((key.name === 'tab' && !key.shift)
          || (el.type === 'textbox' && options.autoNext && key.name === 'enter')
          || key.name === 'down'
          || (options.vi && key.name === 'j')) {
          if (el.type === 'textbox' || el.type === 'textarea') {
            if (key.name === 'j') return
            if (key.name === 'tab') {
              // Workaround, since we can't stop the tab from  being added.
              el.emit(KEYPRESS, null, { name: 'backspace' })
            }
            el.emit(KEYPRESS, '\x1b', { name: 'escape' })
          }
          self.focusNext()
          return
        }

        if ((key.name === 'tab' && key.shift)
          || key.name === 'up'
          || (options.vi && key.name === 'k')) {
          if (el.type === 'textbox' || el.type === 'textarea') {
            if (key.name === 'k') return
            el.emit(KEYPRESS, '\x1b', { name: 'escape' })
          }
          self.focusPrevious()
          return
        }

        if (key.name === 'escape') {
          self.focus()
        }
      })
    }
    this.type = 'form'
  }
  _refresh() {
    // XXX Possibly remove this if statement and refresh on every focus.
    // Also potentially only include *visible* focusable elements.
    // This would remove the need to check for _selected.visible in previous()
    // and next().
    if (!this._children) {
      const out = []

      this.children.forEach(function fn(el) {
        if (el.keyable) out.push(el)
        el.children.forEach(fn)
      })

      this._children = out
    }
  }
  _visible() {
    return !!this._children.filter(function (el) {
      return el.visible
    }).length
  }
  next() {
    this._refresh()

    if (!this._visible()) return

    if (!this._selected) {
      this._selected = this._children[0]
      if (!this._selected.visible) return this.next()
      if (this.screen.focused !== this._selected) return this._selected
    }

    const i = this._children.indexOf(this._selected)
    if (!~i || !this._children[i + 1]) {
      this._selected = this._children[0]
      if (!this._selected.visible) return this.next()
      return this._selected
    }

    this._selected = this._children[i + 1]
    if (!this._selected.visible) return this.next()
    return this._selected
  }
  previous() {
    this._refresh()

    if (!this._visible()) return

    if (!this._selected) {
      this._selected = this._children[this._children.length - 1]
      if (!this._selected.visible) return this.previous()
      if (this.screen.focused !== this._selected) return this._selected
    }

    const i = this._children.indexOf(this._selected)
    if (!~i || !this._children[i - 1]) {
      this._selected = this._children[this._children.length - 1]
      if (!this._selected.visible) return this.previous()
      return this._selected
    }

    this._selected = this._children[i - 1]
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
  resetSelected() {
    this._selected = null
  }
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

    this.children.forEach(function fn(el) {
      if (el.value != null) {
        const name = el.name || el.type
        if (Array.isArray(out[name])) {
          out[name].push(el.value)
        } else if (out[name]) {
          out[name] = [ out[name], el.value ]
        } else {
          out[name] = el.value
        }
      }
      el.children.forEach(fn)
    })

    this.emit('submit', out)

    return this.submission = out
  }
  cancel() {
    this.emit(CANCEL)
  }
  reset() {
    this.children.forEach(function fn(el) {
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
      el.children.forEach(fn)
    })

    this.emit('reset')
  }
}






