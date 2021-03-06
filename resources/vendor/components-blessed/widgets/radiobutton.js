/**
 * radiobutton.js - radio button element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
const
  Node     = require('./node.js'),
  Checkbox = require('./checkbox.js')

/**
 * RadioButton
 */

function RadioButton(options) {
  const self = this
  if (!(this instanceof Node)) {
    return new RadioButton(options)
  }
  options = options || {}

  Checkbox.call(this, options)
  this.on('check', function () {
    let el = self
    while (el = el.sup) {
      if (el.type === 'radio-set'
        || el.type === 'form') break
    }
    el = el || self.sup
    el.forDescendants(function (el) {
      if (el.type !== 'radio-button' || el === self) {
        return
      }
      el.uncheck()
    })
  })
}

RadioButton.prototype.__proto__ = Checkbox.prototype

RadioButton.prototype.type = 'radio-button'

RadioButton.prototype.render = function () {
  this.clearPos(true)
  this.setContent('(' + (this.checked ? '*' : ' ') + ') ' + this.text, true)
  return this._render()
}

RadioButton.prototype.toggle = RadioButton.prototype.check

/**
 * Expose
 */

module.exports = RadioButton
