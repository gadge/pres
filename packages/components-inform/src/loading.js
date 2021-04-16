/**
 * loading.js - loading element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
import { Box }  from '@pres/components-core'
import { Text } from '@pres/components-text'

import { ATTACH, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEWLISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHTEXCEPTION, WARNING, } from '@pres/enum-events'

export class  Loading extends Box {
  /**
   * Loading
   */
  constructor(options = {}) {
    super(options)
    // if (!(this instanceof Node)) return new Loading(options)
    this._.icon = new Text({
      parent: this,
      align: 'center',
      top: 2,
      left: 1,
      right: 1,
      height: 1,
      content: '|'
    })
    this.type = 'loading';
  }
  load(text) {
    const self = this

    // XXX Keep above:
    // var parent = this.parent;
    // this.detach();
    // parent.append(this);

    this.show()
    this.setContent(text)

    if (this._.timer) {
      this.stop()
    }

    this.screen.lockKeys = true

    this._.timer = setInterval(function () {
      if (self._.icon.content === '|') {
        self._.icon.setContent('/')
      } else if (self._.icon.content === '/') {
        self._.icon.setContent('-')
      } else if (self._.icon.content === '-') {
        self._.icon.setContent('\\')
      } else if (self._.icon.content === '\\') {
        self._.icon.setContent('|')
      }
      self.screen.render()
    }, 200)
  }
  stop() {
    this.screen.lockKeys = false
    this.hide()
    if (this._.timer) {
      clearInterval(this._.timer)
      delete this._.timer
    }
    this.screen.render()
  }
}


/**
 * Expose
 */


