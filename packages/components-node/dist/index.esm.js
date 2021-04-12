import { EventEmitter } from '@pres/events';

/**
 * screen.js - screen node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
const nextTick = global.setImmediate || process.nextTick.bind(process);
class _Screen {
  static configSingleton(screen) {
    if (!Screen.global) Screen.global = screen;

    if (!~Screen.instances.indexOf(screen)) {
      Screen.instances.push(screen);
      screen.index = Screen.total;
      Screen.total++;
    }

    if (Screen._bound) return;
    Screen._bound = true;
    process.on('uncaughtException', Screen._exceptionHandler = err => {
      if (process.listeners('uncaughtException').length > 1) {
        return;
      }

      Screen.instances.slice().forEach(screen => screen.destroy());
      err = err || new Error('Uncaught Exception.');
      console.error(err.stack ? err.stack + '' : err + '');
      nextTick(() => process.exit(1));
    });
    ['SIGTERM', 'SIGINT', 'SIGQUIT'].forEach(signal => {
      const name = '_' + signal.toLowerCase() + 'Handler';
      process.on(signal, Screen[name] = () => {
        if (process.listeners(signal).length > 1) {
          return;
        }

        nextTick(() => process.exit(0));
      });
    });
    process.on('exit', Screen._exitHandler = () => {
      Screen.instances.slice().forEach(screen => screen.destroy());
    });
  }

}
_Screen.global = null;
_Screen.total = 0;
_Screen.instances = [];

/**
 * node.js - base abstract node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Node extends EventEmitter {
  /**
   * Node
   */
  constructor(options = {}) {
    var _options$children;

    super(options);
    this.type = 'node';
    const self = this;
    if (!(this instanceof Node)) return new Node(options);
    this.options = options;
    this.screen = this.screen || options.screen;

    if (!this.screen) {
      if (this.type === 'screen') {
        this.screen = this;
      } else if (_Screen.total === 1) {
        this.screen = _Screen.global;
      } else if (options.parent) {
        this.screen = options.parent;

        while (this.screen && this.screen.type !== 'screen') {
          this.screen = this.screen.parent;
        }
      } else if (_Screen.total) {
        // This _should_ work in most cases as long as the element is appended
        // synchronously after the screen's creation. Throw error if not.
        this.screen = _Screen.instances[_Screen.instances.length - 1];
        process.nextTick(function () {
          if (!self.parent) {
            throw new Error('Element (' + self.type + ')' + ' was not appended synchronously after the' + ' screen\'s creation. Please set a `parent`' + ' or `screen` option in the element\'s constructor' + ' if you are going to use multiple screens and' + ' append the element later.');
          }
        });
      } else {
        throw new Error('No active screen.');
      }
    }

    this.parent = options.parent || null;
    this.children = [];
    this.$ = this._ = this.data = {};
    this.uid = Node.uid++;
    this.index = this.index != null ? this.index : -1;

    if (this.type !== 'screen') {
      this.detached = true;
    }

    if (this.parent) {
      this.parent.append(this);
    }

    ((_options$children = options.children) !== null && _options$children !== void 0 ? _options$children : []).forEach(this.append.bind(this));
  }

  insert(element, i) {
    const self = this;

    if (element.screen && element.screen !== this.screen) {
      throw new Error('Cannot switch a node\'s screen.');
    }

    element.detach();
    element.parent = this;
    element.screen = this.screen;

    if (i === 0) {
      this.children.unshift(element);
    } else if (i === this.children.length) {
      this.children.push(element);
    } else {
      this.children.splice(i, 0, element);
    }

    element.emit('reparent', this);
    this.emit('adopt', element);

    (function emit(el) {
      const n = el.detached !== self.detached;
      el.detached = self.detached;
      if (n) el.emit('attach');
      el.children.forEach(emit);
    })(element);

    if (!this.screen.focused) {
      this.screen.focused = element;
    }
  }

  prepend(element) {
    this.insert(element, 0);
  }

  append(element) {
    this.insert(element, this.children.length);
  }

  insertBefore(element, other) {
    const i = this.children.indexOf(other);
    if (~i) this.insert(element, i);
  }

  insertAfter(element, other) {
    const i = this.children.indexOf(other);
    if (~i) this.insert(element, i + 1);
  }

  remove(element) {
    if (element.parent !== this) return;
    let i = this.children.indexOf(element);
    if (!~i) return;
    element.clearPos();
    element.parent = null;
    this.children.splice(i, 1);
    i = this.screen.clickable.indexOf(element);
    if (~i) this.screen.clickable.splice(i, 1);
    i = this.screen.keyable.indexOf(element);
    if (~i) this.screen.keyable.splice(i, 1);
    element.emit('reparent', null);
    this.emit('remove', element);

    (function emit(el) {
      const n = el.detached !== true;
      el.detached = true;
      if (n) el.emit('detach');
      el.children.forEach(emit);
    })(element);

    if (this.screen.focused === element) {
      this.screen.rewindFocus();
    }
  }

  detach() {
    if (this.parent) this.parent.remove(this);
  }

  free() {}

  destroy() {
    this.detach();
    this.forDescendants(function (el) {
      el.free();
      el.destroyed = true;
      el.emit('destroy');
    }, this);
  }

  forDescendants(iter, s) {
    if (s) iter(this);
    this.children.forEach(function emit(el) {
      iter(el);
      el.children.forEach(emit);
    });
  }

  forAncestors(iter, s) {
    let el = this;
    if (s) iter(this);

    while (el = el.parent) {
      iter(el);
    }
  }

  collectDescendants(s) {
    const out = [];
    this.forDescendants(function (el) {
      out.push(el);
    }, s);
    return out;
  }

  collectAncestors(s) {
    const out = [];
    this.forAncestors(function (el) {
      out.push(el);
    }, s);
    return out;
  }

  emitDescendants() {
    const args = Array.prototype.slice(arguments);
    let iter;

    if (typeof args[args.length - 1] === 'function') {
      iter = args.pop();
    }

    return this.forDescendants(function (el) {
      if (iter) iter(el);
      el.emit.apply(el, args);
    }, true);
  }

  emitAncestors() {
    const args = Array.prototype.slice(arguments);
    let iter;

    if (typeof args[args.length - 1] === 'function') {
      iter = args.pop();
    }

    return this.forAncestors(function (el) {
      if (iter) iter(el);
      el.emit.apply(el, args);
    }, true);
  }

  hasDescendant(target) {
    return function find(el) {
      for (let i = 0; i < el.children.length; i++) {
        if (el.children[i] === target) {
          return true;
        }

        if (find(el.children[i]) === true) {
          return true;
        }
      }

      return false;
    }(this);
  }

  hasAncestor(target) {
    let el = this;

    while (el = el.parent) {
      if (el === target) return true;
    }

    return false;
  }

  get(name, value) {
    if (this.data.hasOwnProperty(name)) {
      return this.data[name];
    }

    return value;
  }

  set(name, value) {
    return this.data[name] = value;
  }

} // Node.prototype.__proto__ = EventEmitter.prototype

Node.uid = 0;

export { Node, _Screen };
