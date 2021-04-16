/**
 * textbox.js - textbox element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import Node         from '@pres/components-core'
import { Textarea } from './textarea'

import { ATTACH, REMOVE_LISTENER, EVENT, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEW_LISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHT_EXCEPTION, WARNING, ACTION, ADD_ITEM, ADOPT, BTNDOWN, BTNUP, CD, CHECK, COMPLETE, CONNECT, CREATE_ITEM, DBLCLICK, DRAG, INSERT_ITEM, _LOG, MOVE, PARSED_CONTENT, PASSTHROUGH, REFRESH, REMOVE, REMOVE_ITEM, REPARENT, RESPONSE, SELECT, SELECT_ITEM, SELECT_TAB, SET_ITEMS, UNCHECK, WHEELDOWN, WHEELUP, } from '@pres/enum-events'

export class  Textbox extends Textarea {
  /**
   * Textbox
   */
  constructor(options = {}) {
    options.scrollable = false
    super(options)
    if (!(this instanceof Node)) { return new Textbox(options) }
    this.secret = options.secret
    this.censor = options.censor
    this.type = 'textbox'
    this.__olistener = Textbox.prototype._listener
  }
  _listener(ch, key) {
    if (key.name === 'enter') {
      this._done(null, this.value)
      return
    }
    return this.__olistener(ch, key)
  }
  setValue(value) {
    let visible, val
    if (value == null) {
      value = this.value
    }
    if (this._value !== value) {
      value = value.replace(/\n/g, '')
      this.value = value
      this._value = value
      if (this.secret) {
        this.setContent('')
      } else if (this.censor) {
        this.setContent(Array(this.value.length + 1).join('*'))
      } else {
        visible = -(this.width - this.iwidth - 1)
        val = this.value.replace(/\t/g, this.screen.tabc)
        this.setContent(val.slice(visible))
      }
      this._updateCursor()
    }
  }
  submit() {
    if (!this.__listener) return
    return this.__listener('\r', { name: 'enter' })
  }
}


/**
 * Expose
 */


