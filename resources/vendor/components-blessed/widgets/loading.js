/**
 * loading.js - loading element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
const
  Node = require('./node.js'),
  Box  = require('./box.js'),
  Text = require('./text.js')

/**
 * Loading
 */

function Loading(options) {
  if (!(this instanceof Node)) { return new Loading(options) }
  options = options || {}

  Box.call(this, options)
  this._.icon = new Text({
    sup: this,
    align: 'center',
    top: 2,
    left: 1,
    right: 1,
    height: 1,
    content: '|'
  })
}

Loading.prototype.__proto__ = Box.prototype

Loading.prototype.type = 'loading'

Loading.prototype.load = function (text) {
  const self = this

  // XXX Keep above:
  // var sup = this.sup;
  // this.detach();
  // sup.append(this);
  this.show()
  this.setContent(text)
  if (this._.timer) { this.stop() }
  this.screen.lockKeys = true
  this._.timer = setInterval(function () {
    if (self._.icon.content === '|') { self._.icon.setContent('/') }
    else if (self._.icon.content === '/') { self._.icon.setContent('-') }
    else if (self._.icon.content === '-') {
      self._.icon.setContent('\\')
    }
    else if (self._.icon.content === '\\') {
      self._.icon.setContent('|')
    }
    self.screen.render()
  }, 200)
}

Loading.prototype.stop = function () {
  this.screen.lockKeys = false
  this.hide()
  if (this._.timer) {
    clearInterval(this._.timer)
    delete this._.timer
  }
  this.screen.render()
}

/**
 * Expose
 */

module.exports = Loading
