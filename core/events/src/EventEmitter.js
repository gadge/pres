/**
 * alias.js - event emitter for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { ERROR, EVENT, NEW_LISTENER, REMOVE_LISTENER, } from '@pres/enum-events'
import { slice }                                        from '@pres/util-helpers'
import { SP }                                           from '@texting/enum-chars'
import { FUN }                                          from '@typen/enum-data-types'

export class EventEmitter {
  #events = {}
  #max = Infinity

  constructor() { }
  static build() { return new EventEmitter() }
  setMaxListeners(n) { this.#max = n }
  get events() { return this.#events }
  addListener = this.on
  on(type, listener) {
    let curr = this.#events[type]
    if (!curr) { this.#events[type] = listener }
    else if (typeof curr === FUN) { this.#events[type] = [ curr, listener ] }
    else { this.#events[type].push(listener) }
    this.#emit(NEW_LISTENER, [ type, listener ])
  }
  removeListener = this.off
  off(type, listener) {
    const curr = this.#events[type]
    if (!curr) return void 0
    if (typeof curr === FUN || curr.length === 1) {
      delete this.#events[type]
      this.#emit(REMOVE_LISTENER, [ type, listener ])
      return void 0
    }
    for (let i = 0, hi = curr.length; i < hi; i++) {
      if (curr[i] === listener || curr[i].listener === listener) {
        curr.splice(i, 1)
        return void this.#emit(REMOVE_LISTENER, [ type, listener ])
      }
    }
  }
  removeAllListeners(type) { type ? ( delete this.#events[type] ) : ( this.#events = {} ) }
  once(type, listener) {
    const self = this
    function onceHandler() { return self.off(type, onceHandler), listener.apply(self, arguments) }
    onceHandler.listener = listener
    return this.on(type, onceHandler)
  }
  listeners(type) { return typeof this.#events[type] === FUN ? [ this.#events[type] ] : this.#events[type] ?? [] }
  _emit = this.#emit
  #emit(type, args) {
    const handler = this.#events[type]
    let result
    if (!handler) if (type === ERROR) {
      throw new args[0]
    }
    else {
      return void 0
    }
    if (typeof handler === FUN) return handler.apply(this, args)
    for (const item of handler)
      if (item.apply(this, args) === false) result = false
    return result !== false
  }
  emit(type, ...args) {
    let node = this
    this.#emit(EVENT, slice(arguments))
    if (this.type === 'screen') return this.#emit(type, args)
    if (this.#emit(type, args) === false) return false
    type = 'element' + SP + type
    args.unshift(this) // const elementArgs = [ node ].concat(args)
    do {
      if (!node.events[type]) continue
      if (node._emit(type, args) === false) return false
    } while (( node = node.sup ))
    return true
  }
}

// For hooking into the main EventEmitter if we want to.
// Might be better to do things this way being that it
// will always be compatible with node, not to mention
// it gives us domain support as well.
// Node.prototype.#emit = Node.prototype.emit;
// Node.prototype.emit = function(type) {
//   var args, el;
//
//   if (this.type === 'screen') {
//     return this.#emit.apply(this, arguments);
//   }
//
//   this.#emit.apply(this, arguments);
//   if (this._bubbleStopped) return false;
//
//   args = slice.call(arguments, 1);
//   el = this;
//
//   args.unshift('element ' + type, this);
//   this._bubbleStopped = false;
//   //args.push(stopBubble);
//
//   do {
//     if (!el.#events || !el.#events[type]) continue;
//     el.#emit.apply(el, args);
//     if (this._bubbleStopped) return false;
//   } while ((el = el.sup));
//
//   return true;
// };
//
// Node.prototype._addListener = Node.prototype.addListener;
// Node.prototype.on =
// Node.prototype.addListener = function(type, listener) {
//   function on() {
//     if (listener.apply(this, arguments) === false) {
//       this._bubbleStopped = true;
//     }
//   }
//   on.listener = listener;
//   return this._addListener(type, on);
// };