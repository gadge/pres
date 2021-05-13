/**
 * button.js - button element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { CLICK, KEYPRESS, PRESS, } from '@pres/enum-events'
import { ENTER, SPACE, }           from '@pres/enum-key-names'
import { Input }                   from './input'

export class Button extends Input {
  /**
   * Button
   */
  constructor(options = {}) {
    if (!options.sku) options.sku = 'button'
    if (options.autoFocus == null) options.autoFocus = false
    super(options)
    const self = this
    // if (!(this instanceof Node)) return new Button(options)
    this.on(KEYPRESS, (ch, key) => { if (key.name === ENTER || key.name === SPACE) return self.press() })
    if (this.options.mouse) { this.on(CLICK, () => self.press()) }
    this.type = 'button'
  }
  static build(options) { return new Button(options) }
  press() {
    this.focus()
    this.value = true
    const result = this.emit(PRESS)
    delete this.value
    return result
  }
}





