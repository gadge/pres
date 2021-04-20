/**
 * radiobutton.js - radio button element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { CHECK, }   from '@pres/enum-events'
import { Checkbox } from './checkbox'


export class RadioButton extends Checkbox {
  toggle = this.check
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
  }
  render() {
    this.clearPos(true)
    this.setContent('(' + (this.checked ? '*' : ' ') + ') ' + this.text, true)
    return this._render()
  }
}





