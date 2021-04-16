/**
 * checkbox.js - checkbox element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
import { Input } from './input'

import { ATTACH, REMOVE_LISTENER, EVENT, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEW_LISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHT_EXCEPTION, WARNING, ACTION, ADD_ITEM, ADOPT, BTNDOWN, BTNUP, CD, CHECK, COMPLETE, CONNECT, CREATE_ITEM, DBLCLICK, DRAG, INSERT_ITEM, _LOG, MOVE, PARSED_CONTENT, PASSTHROUGH, REFRESH, REMOVE, REMOVE_ITEM, REPARENT, RESPONSE, SELECT, SELECT_ITEM, SELECT_TAB, SET_ITEMS, UNCHECK, WHEELDOWN, WHEELUP, } from '@pres/enum-events'

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

    this.on(KEYPRESS, function (ch, key) {
      if (key.name === 'enter' || key.name === 'space') {
        self.toggle()
        self.screen.render()
      }
    })

    if (options.mouse) {
      this.on(CLICK, function () {
        self.toggle()
        self.screen.render()
      })
    }

    this.on(FOCUS, function () {
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
    this.emit(CHECK)
  }
  uncheck() {
    if (!this.checked) return
    this.checked = this.value = false
    this.emit(UNCHECK)
  }
  toggle() {
    return this.checked
      ? this.uncheck()
      : this.check()
  }
}






