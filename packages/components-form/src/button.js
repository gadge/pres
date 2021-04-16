/**
 * button.js - button element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
import { Input } from './input'

import { ATTACH, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEWLISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHTEXCEPTION, WARNING, } from '@pres/enum-events'

export class  Button extends Input {
  /**
   * Button
   */
  constructor(options = {}){
    if (options.autoFocus == null) options.autoFocus = false
    super(options)
    const self = this

    // if (!(this instanceof Node)) return new Button(options)

    this.on('keypress', function (ch, key) {
      if (key.name === 'enter' || key.name === 'space') {
        return self.press()
      }
    })

    if (this.options.mouse) {
      this.on('click', function () {
        return self.press()
      })
    }
    this.type = 'button'
  }
  press() {
    this.focus()
    this.value = true
    const result = this.emit('press')
    delete this.value
    return result
  }
}






