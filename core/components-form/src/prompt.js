/**
 * prompt.js - prompt element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Box }     from '@pres/components-core'
import { PRESS }   from '@pres/enum-events'
import { Button }  from './button'
import { Textbox } from './textbox'

export class Prompt extends Box {
  input = this.readInput
  setInput = this.readInput
  /**
   * Prompt
   */
  constructor(options = {}) {
    options.hidden = true
    super(options)
    // if (!(this instanceof Node)) return new Prompt(options)
    this._.input = new Textbox({
      sup: this,
      top: 3,
      height: 1,
      left: 2,
      right: 2,
      bg: 'black'
    })
    this._.okay = new Button({
      sup: this,
      top: 5,
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
      sup: this,
      top: 5,
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
    this.type = 'prompt'
  }
  static build(options) { return new Prompt(options) }
  readInput(text, value, callback) {
    const self = this
    let okay, cancel
    if (!callback) {
      callback = value
      value = ''
    }
    // Keep above:
    // var sup = this.sup;
    // this.detach();
    // sup.append(this);
    this.show()
    this.setContent(' ' + text)
    this._.input.value = value
    this.screen.saveFocus()
    this._.okay.on(PRESS, okay = function () {
      self._.input.submit()
    })
    this._.cancel.on(PRESS, cancel = function () {
      self._.input.cancel()
    })
    this._.input.readInput(function (err, data) {
      self.hide()
      self.screen.restoreFocus()
      self._.okay.removeListener(PRESS, okay)
      self._.cancel.removeListener(PRESS, cancel)
      return callback(err, data)
    })
    this.screen.render()
  }
}





