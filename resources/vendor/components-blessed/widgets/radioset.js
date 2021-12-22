/**
 * radioset.js - radio set element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

const
  Node = require('./node.js'),
  Box  = require('./box.js')

/**
 * RadioSet
 */

function RadioSet(options) {
  if (!(this instanceof Node)) {
    return new RadioSet(options)
  }
  options = options || {}
  // Possibly inherit sup's style.
  // options.style = this.sup.style;
  Box.call(this, options)
}

RadioSet.prototype.__proto__ = Box.prototype

RadioSet.prototype.type = 'radio-set'

/**
 * Expose
 */

module.exports = RadioSet
