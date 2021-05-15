/**
 * alias.js - event emitter for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { ERROR, EVENT, NEW_LISTENER, REMOVE_LISTENER, } from '@pres/enum-events'
import { SP }                                           from '@texting/enum-chars'
import { FUN }                                          from '@typen/enum-data-types'

const slice = Array.prototype.slice

export class EventEmitter {
  #events = {}
  #max = Infinity
  addListener = this.on
  removeListener = this.off
  constructor() { }
  static build() { return new EventEmitter() }
  setMaxListeners(n) { this.#max = n }
  get events() { return this.#events }
  on(type, listener) {
    if (!this.#events[type]) { this.#events[type] = listener }
    else if (typeof this.#events[type] === FUN) { this.#events[type] = [ this.#events[type], listener ] }
    else { this.#events[type].push(listener) }
    this.#emit(NEW_LISTENER, [ type, listener ])
  }
  off(type, listener) {
    const handler = this.#events[type]
    if (!handler) return void 0
    if (typeof handler === FUN || handler.length === 1) {
      delete this.#events[type]
      this.#emit(REMOVE_LISTENER, [ type, listener ])
      return void 0
    }
    for (let i = 0, hi = handler.length; i < hi; i++) {
      if (handler[i] === listener || handler[i].listener === listener) {
        handler.splice(i, 1)
        this.#emit(REMOVE_LISTENER, [ type, listener ])
        return void 0
      }
    }
  }
  removeAllListeners(type) { type ? (delete this.#events[type]) : (this.#events = {}) }
  once(type, listener) {
    const self = this
    function on() { return self.removeListener(type, on), listener.apply(self, arguments) }
    on.listener = listener
    return this.on(type, on)
  }
  listeners(type) { return typeof this.#events[type] === FUN ? [ this.#events[type] ] : this.#events[type] ?? [] }
  _emit = this.#emit
  #emit(type, args) {
    const handler = this.#events[type]
    let result
    if (!handler) return type === ERROR ? throw new args[0] : void 0
    if (typeof handler === FUN) return handler.apply(this, args)
    for (let i = 0; i < handler.length; i++) if (handler[i].apply(this, args) === false) result = false
    return result !== false
  }
  emit(type, ...args) {
    let node = this
    this.#emit(EVENT, slice.call(arguments))
    if (this.type === 'screen') return this.#emit(type, args)
    if (this.#emit(type, args) === false) return false
    type = 'element' + SP + type
    args.unshift(this) // const elementArgs = [ node ].concat(args)
    do {
      if (!node.events[type]) continue
      if (node._emit(type, args) === false) return false
    } while ((node = node.sup))
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