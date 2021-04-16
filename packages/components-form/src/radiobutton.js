/**
 * radiobutton.js - radio button element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
import { Checkbox } from './checkbox'

import { ATTACH, REMOVE_LISTENER, EVENT, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEW_LISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHT_EXCEPTION, WARNING, ACTION, ADD_ITEM, ADOPT, BTNDOWN, BTNUP, CD, CHECK, COMPLETE, CONNECT, CREATE_ITEM, DBLCLICK, DRAG, INSERT_ITEM, _LOG, MOVE, PARSED_CONTENT, PASSTHROUGH, REFRESH, REMOVE, REMOVE_ITEM, REPARENT, RESPONSE, SELECT, SELECT_ITEM, SELECT_TAB, SET_ITEMS, UNCHECK, WHEELDOWN, WHEELUP, } from '@pres/enum-events'

export class  RadioButton extends Checkbox {
  /**
   * RadioButton
   */
  constructor(options = {}) {
    super(options)
    const self = this
    // if (!(this instanceof Node)) return new RadioButton(options)
    this.on(CHECK, function () {
      let el = self
      while ((el = el.parent)) {
        if (el.type === 'radio-set'
          || el.type === 'form') break
      }
      el = el || self.parent
      el.forDescendants(function (el) {
        if (el.type !== 'radio-button' || el === self) {
          return
        }
        el.uncheck()
      })
    })
    this.type = 'radio-button'
    this.toggle = RadioButton.prototype.check
  }
  render() {
    this.clearPos(true)
    this.setContent('(' + (this.checked ? '*' : ' ') + ') ' + this.text, true)
    return this._render()
  }
}






