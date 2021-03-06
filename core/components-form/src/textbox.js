/**
 * textbox.js - textbox element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { ENTER, }   from '@pres/enum-key-names'
import { Textarea } from './textarea'


export class Textbox extends Textarea {
  __olistener = super._listener
  constructor(options = {}) {
    if (!options.sku) options.sku = 'textbox'
    options.scrollable = false
    super(options)
    // if (!(this instanceof Node)) { return new Textbox(options) }
    this.secret = options.secret
    this.censor = options.censor
    this.type = 'textbox'
    // console.log(`>>> constructed ${this.type}`)
  }
  static build(options) { return new Textbox(options) }
  _listener(ch, key) {
    // console.log('>>> calling _listener in Textbox')
    return key.name === ENTER
      ? void this._done(null, this.value)
      : this.__olistener(ch, key)
  }
  setValue(value) {
    let visible, val
    if (value == null) value = this.value
    if (this._value !== value) {
      value = value.replace(/\n/g, '')
      this.value = value
      this._value = value
      if (this.secret) { this.setContent('') }
      else if (this.censor) {
        this.setContent(Array(this.value.length + 1).join('*'))
      }
      else {
        visible = -(this.width - this.intW - 1)
        val = this.value.replace(/\t/g, this.screen.tabc)
        this.setContent(val.slice(visible))
      }
      this._updateCursor()
    }
  }
  submit() { return this.__listener ? this.__listener('\r', { name: ENTER }) : void 0 }
}