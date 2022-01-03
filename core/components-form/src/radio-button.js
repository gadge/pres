/**
 * radiobutton.js - radio button element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { CHECK, }   from '@pres/enum-events'
import { Checkbox } from './checkbox'

/**
 * RadioButton
 */

export class RadioButton extends Checkbox {
  toggle = this.check
  constructor(options = {}) {
    super(options)
    const self = this
    // if (!(this instanceof Node)) return new RadioButton(options)
    this.on(CHECK, () => {
      let node = self, type
      while (( node = node.sup ) && ( { type } = node )) {
        if (type === 'radio-set' || type === 'form') break
      }
      node = node ?? self.sup
      node.forDescendants(node => {
        if (node.type !== 'radio-button' || node === self) return void 0
        node.uncheck()
      })
    })
    this.type = 'radio-button'
  }
  static build(options) { return new RadioButton(options) }
  render() {
    this.clearPos(true)
    this.setContent('(' + ( this.checked ? '*' : ' ' ) + ') ' + this.text, true)
    return this.renderElement()
  }
}





