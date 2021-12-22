/**
 * scrollabletext.js - scrollable text element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

const
  Node          = require('./node.js'),
  ScrollableBox = require('./scrollablebox.js')

/**
 * ScrollableText
 */

function ScrollableText(options) {
  if (!(this instanceof Node)) { return new ScrollableText(options) }
  options = options || {}
  options.alwaysScroll = true
  ScrollableBox.call(this, options)
}

ScrollableText.prototype.__proto__ = ScrollableBox.prototype

ScrollableText.prototype.type = 'scrollable-text'

/**
 * Expose
 */

module.exports = ScrollableText
