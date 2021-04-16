/**
 * checkbox.js - checkbox element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
import { Input } from './input'

import { ATTACH, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEWLISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHTEXCEPTION, WARNING, } from '@pres/enum-events'

export class  Checkbox extends Input {
  /**
   * Checkbox
   */
  constructor(options = {}) {
    super(options)
    const self = this
    // if (!(this instanceof Node)) return new Checkbox(options)

    this.text = options.content || options.text || ''
    this.checked = this.value = options.checked || false

    this.on('keypress', function (ch, key) {
      if (key.name === 'enter' || key.name === 'space') {
        self.toggle()
        self.screen.render()
      }
    })

    if (options.mouse) {
      this.on('click', function () {
        self.toggle()
        self.screen.render()
      })
    }

    this.on('focus', function () {
      const lpos = self.lpos
      if (!lpos) return
      self.screen.program.lsaveCursor('checkbox')
      self.screen.program.cup(lpos.yi, lpos.xi + 1)
      self.screen.program.showCursor()
    })

    this.on(BLUR, function () {
      self.screen.program.lrestoreCursor('checkbox', true)
    })
    this.type = 'checkbox'
  }
  render() {
    this.clearPos(true)
    this.setContent('[' + (this.checked ? 'x' : ' ') + '] ' + this.text, true)
    return this._render()
  }
  check() {
    if (this.checked) return
    this.checked = this.value = true
    this.emit('check')
  }
  uncheck() {
    if (!this.checked) return
    this.checked = this.value = false
    this.emit('uncheck')
  }
  toggle() {
    return this.checked
      ? this.uncheck()
      : this.check()
  }
}






