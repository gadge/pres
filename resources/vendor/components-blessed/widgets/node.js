/**
 * node.js - base abstract node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

const EventEmitter = require('../events').EventEmitter

/**
 * Node
 */

function Node(options) {
  const self = this
  const Screen = require('./screen.js')
  if (!(this instanceof Node)) return new Node(options)

  EventEmitter.call(this)
  options = options || {}
  this.options = options
  this.screen = this.screen || options.screen
  if (!this.screen) {
    if (this.type === 'screen') {
      this.screen = this
    }
    else if (Screen.total === 1) {
      this.screen = Screen.global
    }
    else if (options.sup) {
      this.screen = options.sup
      while (this.screen && this.screen.type !== 'screen') {
        this.screen = this.screen.sup
      }
    }
    else if (Screen.total) {
      // This _should_ work in most cases as long as the element is appended
      // synchronously after the screen's creation. Throw error if not.
      this.screen = Screen.instances[Screen.instances.length - 1]
      process.nextTick(function () {
        if (!self.sup) {
          throw new Error('Element (' + self.type + ')'
            + ' was not appended synchronously after the'
            + ' screen\'s creation. Please set a `sup`'
            + ' or `screen` option in the element\'s constructor'
            + ' if you are going to use multiple screens and'
            + ' append the element later.')
        }
      })
    }
    else {
      throw new Error('No active screen.')
    }
  }
  this.sup = options.sup || null
  this.sub = []
  this.$ = this._ = this.data = {}
  this.uid = Node.uid++
  this.index = this.index != null ? this.index : -1
  if (this.type !== 'screen') this.detached = true
  if (this.sup) this.sup.append(this);

  (options.sub || []).forEach(this.append.bind(this))
}

Node.uid = 0

Node.prototype.__proto__ = EventEmitter.prototype

Node.prototype.type = 'node'

Node.prototype.insert = function (element, i) {
  const self = this
  if (element.screen && element.screen !== this.screen) {
    throw new Error('Cannot switch a node\'s screen.')
  }

  element.detach()
  element.sup = this
  element.screen = this.screen
  if (i === 0) {
    this.sub.unshift(element)
  }
  else if (i === this.sub.length) {
    this.sub.push(element)
  }
  else {
    this.sub.splice(i, 0, element)
  }

  element.emit('reparent', this)
  this.emit('adopt', element);

  (function emit(el) {
    const n = el.detached !== self.detached
    el.detached = self.detached
    if (n) el.emit('attach')
    el.sub.forEach(emit)
  })(element)
  if (!this.screen.focused) {
    this.screen.focused = element
  }
}

Node.prototype.prepend = function (element) {
  this.insert(element, 0)
}

Node.prototype.append = function (element) {
  this.insert(element, this.sub.length)
}

Node.prototype.insertBefore = function (element, other) {
  const i = this.sub.indexOf(other)
  if (~i) this.insert(element, i)
}

Node.prototype.insertAfter = function (element, other) {
  const i = this.sub.indexOf(other)
  if (~i) this.insert(element, i + 1)
}

Node.prototype.remove = function (element) {
  if (element.sup !== this) return
  let i = this.sub.indexOf(element)
  if (!~i) return

  element.clearPos()

  element.sup = null
  this.sub.splice(i, 1)

  i = this.screen.clickable.indexOf(element)
  if (~i) this.screen.clickable.splice(i, 1)
  i = this.screen.keyable.indexOf(element)
  if (~i) this.screen.keyable.splice(i, 1)

  element.emit('reparent', null)
  this.emit('remove', element);

  (function emit(el) {
    const n = el.detached !== true
    el.detached = true
    if (n) el.emit('detach')
    el.sub.forEach(emit)
  })(element)
  if (this.screen.focused === element) {
    this.screen.rewindFocus()
  }
}

Node.prototype.detach = function () {
  if (this.sup) this.sup.remove(this)
}

Node.prototype.free = function () {
  return
}

Node.prototype.destroy = function () {
  this.detach()
  this.forDescendants(function (el) {
    el.free()
    el.destroyed = true
    el.emit('destroy')
  }, this)
}

Node.prototype.forDescendants = function (iter, s) {
  if (s) iter(this)
  this.sub.forEach(function emit(el) {
    iter(el)
    el.sub.forEach(emit)
  })
}

Node.prototype.forAncestors = function (iter, s) {
  let el = this
  if (s) iter(this)
  while (el = el.sup) {
    iter(el)
  }
}

Node.prototype.collectDescendants = function (s) {
  const out = []
  this.forDescendants(function (el) {
    out.push(el)
  }, s)
  return out
}

Node.prototype.collectAncestors = function (s) {
  const out = []
  this.forAncestors(function (el) {
    out.push(el)
  }, s)
  return out
}

Node.prototype.emitDescendants = function () {
  const args = Array.prototype.slice(arguments)
  let iter
  if (typeof args[args.length - 1] === 'function') {
    iter = args.pop()
  }

  return this.forDescendants(function (el) {
    if (iter) iter(el)
    el.emit.apply(el, args)
  }, true)
}

Node.prototype.emitAncestors = function () {
  const args = Array.prototype.slice(arguments)
  let iter
  if (typeof args[args.length - 1] === 'function') {
    iter = args.pop()
  }

  return this.forAncestors(function (el) {
    if (iter) iter(el)
    el.emit.apply(el, args)
  }, true)
}

Node.prototype.hasDescendant = function (target) {
  return (function find(el) {
    for (let i = 0; i < el.sub.length; i++) {
      if (el.sub[i] === target) {
        return true
      }
      if (find(el.sub[i]) === true) {
        return true
      }
    }
    return false
  })(this)
}

Node.prototype.hasAncestor = function (target) {
  let el = this
  while (el = el.sup) {
    if (el === target) return true
  }
  return false
}

Node.prototype.get = function (name, value) {
  if (this.data.hasOwnProperty(name)) {
    return this.data[name]
  }
  return value
}

Node.prototype.set = function (name, value) {
  return this.data[name] = value
}

/**
 * Expose
 */

module.exports = Node
