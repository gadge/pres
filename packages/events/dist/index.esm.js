const EVENT = 'event',
      NEW_LISTENER = 'newListener',
      REMOVE_LISTENER = 'removeListener';

/**
 * alias.js - event emitter for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class EventEmitter {
  /**
   * EventEmitter
   */
  constructor() {
    if (!this._events) this._events = {}; // console.log('>>> [EventEmitter is constructed]')
  } // static listenerCount


  build() {
    return new EventEmitter();
  }

  setMaxListeners(n) {
    this._maxListeners = n;
  }

  on(type, listener) {
    this.addListener(type, listener);
  }

  off(type, listener) {
    this.removeListener(type, listener);
  }

  addListener(type, listener) {
    if (!this._events[type]) {
      this._events[type] = listener;
    } else if (typeof this._events[type] === 'function') {
      this._events[type] = [this._events[type], listener];
    } else {
      this._events[type].push(listener);
    }

    this._emit(NEW_LISTENER, [type, listener]);
  }

  removeListener(type, listener) {
    const handler = this._events[type];
    if (!handler) return;

    if (typeof handler === 'function' || handler.length === 1) {
      delete this._events[type];

      this._emit(REMOVE_LISTENER, [type, listener]);

      return;
    }

    for (let i = 0; i < handler.length; i++) {
      if (handler[i] === listener || handler[i].listener === listener) {
        handler.splice(i, 1);

        this._emit(REMOVE_LISTENER, [type, listener]);

        return;
      }
    }
  }

  removeAllListeners(type) {
    if (type) {
      delete this._events[type];
    } else {
      this._events = {};
    }
  }

  once(type, listener) {
    const self = this;

    function on() {
      self.removeListener(type, on);
      return listener.apply(self, arguments);
    }

    on.listener = listener;
    return this.on(type, on);
  }

  listeners(type) {
    return typeof this._events[type] === 'function' ? [this._events[type]] : this._events[type] || [];
  }

  _emit(type, args) {
    const handler = this._events[type];
    let ret; // if (type !== 'event') {
    //   this._emit(EVENT, [type.replace(/^element /, '')].concat(args));
    // }

    if (!handler) {
      if (type === 'error') throw new args[0]();
      return;
    }

    if (typeof handler === 'function') return handler.apply(this, args);

    for (let i = 0; i < handler.length; i++) {
      if (handler[i].apply(this, args) === false) {
        ret = false;
      }
    }

    return ret !== false;
  }

  emit(type) {
    const args = slice.call(arguments, 1),
          params = slice.call(arguments);
    let el = this;

    this._emit(EVENT, params);

    if (this.type === 'screen') return this._emit(type, args);
    if (this._emit(type, args) === false) return false;
    type = 'element ' + type;
    args.unshift(this); // `element` prefix
    // params = [type].concat(args);
    // no `element` prefix
    // params.splice(1, 0, this);

    do {
      // el._emit(EVENT, params);
      if (!el._events[type]) continue;
      if (el._emit(type, args) === false) return false;
    } while (el = el.parent);

    return true;
  }

}
const slice = Array.prototype.slice; // For hooking into the main EventEmitter if we want to.
// Might be better to do things this way being that it
// will always be compatible with node, not to mention
// it gives us domain support as well.
// Node.prototype._emit = Node.prototype.emit;
// Node.prototype.emit = function(type) {
//   var args, el;
//
//   if (this.type === 'screen') {
//     return this._emit.apply(this, arguments);
//   }
//
//   this._emit.apply(this, arguments);
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
//     if (!el._events || !el._events[type]) continue;
//     el._emit.apply(el, args);
//     if (this._bubbleStopped) return false;
//   } while (el = el.parent);
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

/**
 * Expose
 */

export { EventEmitter };
