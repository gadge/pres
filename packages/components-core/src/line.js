/**
 * line.js - line element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Box } from '../core/box'

import { ATTACH, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEWLISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHTEXCEPTION, WARNING, } from '@pres/enum-events'

export class  Line extends Box {
  /**
   * Line
   */
  constructor(options = {}) {
    if ((options.orientation || 'vertical') === 'vertical') {
      options.width = 1
    } else {
      options.height = 1
    }
    super(options)
    // if (!(this instanceof Node)) return new Line(options)
    const orientation = options.orientation || 'vertical'
    delete options.orientation
    this.ch = !options.type || options.type === 'line'
      ? orientation === 'horizontal' ? '─' : '│'
      : options.ch || ' '
    this.border = {
      type: 'bg',
      __proto__: this
    }
    this.style.border = this.style
    this.type = 'line'
  }
}


