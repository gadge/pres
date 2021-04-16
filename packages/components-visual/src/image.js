/**
 * image.js - image element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
import { Box } from '@pres/components-core'

import { ATTACH, REMOVE_LISTENER, EVENT, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEW_LISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHT_EXCEPTION, WARNING, ACTION, ADD_ITEM, ADOPT, BTNDOWN, BTNUP, CD, CHECK, COMPLETE, CONNECT, CREATE_ITEM, DBLCLICK, DRAG, INSERT_ITEM, _LOG, MOVE, PARSED_CONTENT, PASSTHROUGH, REFRESH, REMOVE, REMOVE_ITEM, REPARENT, RESPONSE, SELECT, SELECT_ITEM, SELECT_TAB, SET_ITEMS, UNCHECK, WHEELDOWN, WHEELUP, } from '@pres/enum-events'

export class  Image extends Box {
  /**
   * Image
   */
  constructor(options = {}) {
    options.type = options.itype || options.type || 'ansi'
    super(options)
    // if (!(this instanceof Node)) { return new Image(options) }
    if (options.type === 'ansi' && this.type !== 'ansiimage') {
      const ANSIImage = require('./ansiimage')
      Object.getOwnPropertyNames(ANSIImage.prototype).forEach(function (key) {
        if (key === 'type') return
        Object.defineProperty(this, key,
          Object.getOwnPropertyDescriptor(ANSIImage.prototype, key))
      }, this)
      ANSIImage.call(this, options)
      return this
    }

    if (options.type === 'overlay' && this.type !== 'overlayimage') {
      const OverlayImage = require('./overlayimage')
      Object.getOwnPropertyNames(OverlayImage.prototype).forEach(function (key) {
        if (key === 'type') return
        Object.defineProperty(this, key,
          Object.getOwnPropertyDescriptor(OverlayImage.prototype, key))
      }, this)
      OverlayImage.call(this, options)
      return this
    }

    throw new Error('`type` must either be `ansi` or `overlay`.')
    this.type = 'image';
  }
}


/**
 * Expose
 */


