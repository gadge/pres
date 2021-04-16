/**
 * question.js - question element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
import { Box }    from '@pres/components-core'
import { Button } from './button'

import { ATTACH, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEWLISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHTEXCEPTION, WARNING, } from '@pres/enum-events'

export class  Question extends Box {

  /**
   * Question
   */
  constructor(options = {}) {
    options.hidden = true
    super(options)
    // if (!(this instanceof Node)) return new Question(options)
    this._.okay = new Button({
      screen: this.screen,
      parent: this,
      top: 2,
      height: 1,
      left: 2,
      width: 6,
      content: 'Okay',
      align: 'center',
      bg: 'black',
      hoverBg: 'blue',
      autoFocus: false,
      mouse: true
    })
    this._.cancel = new Button({
      screen: this.screen,
      parent: this,
      top: 2,
      height: 1,
      shrink: true,
      left: 10,
      width: 8,
      content: 'Cancel',
      align: 'center',
      bg: 'black',
      hoverBg: 'blue',
      autoFocus: false,
      mouse: true
    })
    this.type = 'question'
  }
  ask(text, callback) {
    const self = this
    let press, okay, cancel

    // Keep above:
    // var parent = this.parent;
    // this.detach();
    // parent.append(this);

    this.show()
    this.setContent(' ' + text)

    this.onScreenEvent(KEYPRESS, press = function (ch, key) {
      if (key.name === MOUSE) return
      if (key.name !== 'enter'
        && key.name !== 'escape'
        && key.name !== 'q'
        && key.name !== 'y'
        && key.name !== 'n') {
        return
      }
      done(null, key.name === 'enter' || key.name === 'y')
    })

    this._.okay.on(PRESS, okay = function () {
      done(null, true)
    })

    this._.cancel.on(PRESS, cancel = function () {
      done(null, false)
    })

    this.screen.saveFocus()
    this.focus()

    function done(err, data) {
      self.hide()
      self.screen.restoreFocus()
      self.removeScreenEvent(KEYPRESS, press)
      self._.okay.removeListener(PRESS, okay)
      self._.cancel.removeListener(PRESS, cancel)
      return callback(err, data)
    }

    this.screen.render()
  }
}






