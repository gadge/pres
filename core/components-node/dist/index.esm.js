import { REPARENT, ADOPT, REMOVE, DESTROY, ATTACH, DETACH } from '@pres/enum-events';
import { EventEmitter } from '@pres/events';
import { GlobalNode } from '@pres/global-node';
import { GlobalScreen } from '@pres/global-screen';
import { AEU } from '@texting/enum-chars';
import { FUN } from '@typen/enum-data-types';
import { last } from '@vect/vector-index';

/**
 * node.js - base abstract node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Node extends EventEmitter {
  /**
   * Node
   */
  constructor(options = {}, lazy) {
    super(options);
    this.type = 'node';
    this.sup = null;
    this.sub = [];
    if (lazy) return this;
    this.setup(options);
  }

  static build(options) {
    return new Node(options);
  }

  setup(options) {
    var _this$sup, _this$screen;

    // console.log(`>>> called setup on Node by ${this.type}`)
    this.options = options;
    this.name = options.name;
    this.sku = options.sku;
    this.configScreen(options);
    this.$ = this._ = this.data = {};
    this.uid = GlobalNode.uid++;
    this.index = this.index ?? -1;
    if (this.type !== 'screen') this.detached = true;
    let sup, sub;

    if (sup = options.sup ?? options.parent) {
      this.sup = sup;
      this.sup.append(this);
    }

    if (sub = options.sub ?? options.children) {
      sub.forEach(node => this.append(node));
    }

    if (GlobalScreen.journal) console.log('>> [new node]', this.codename, '∈', ((_this$sup = this.sup) == null ? void 0 : _this$sup.codename) ?? ((_this$screen = this.screen) == null ? void 0 : _this$screen.codename) ?? AEU);
  }

  configScreen(options) {
    let screen = this.screen || options.screen;

    if (!screen) {
      const self = this;
      let sup; // console.log(`>>> this.type = ${this.type}`)

      if (this.type === 'screen') {
        screen = this;
      } else if (GlobalScreen.total === 1) {
        screen = GlobalScreen.global;
      } else if (sup = options.sup ?? options.parent) {
        screen = sup;

        while (((_screen = screen) == null ? void 0 : _screen.type) !== 'screen') {
          var _screen;

          screen = screen.sup;
        }
      } else if (GlobalScreen.total) {
        // This _should_ work in most cases as long as the element is appended synchronously after the screen's creation. Throw error if not.
        screen = last(GlobalScreen.instances);
        process.nextTick(() => {
          if (!self.sup) throw new Error('Element (' + self.type + ') was not appended synchronously after the screen\'s creation. ' + 'Please set a \'parent\' or \'screen\' option in the element\'s constructor ' + 'if you are going to use multiple screens and append the element later.');
        });
      } else {
        throw new Error('No active screen.');
      }
    }

    return this.screen = screen;
  }

  get codename() {
    const des = `${this.sku ?? this.type ?? ''}.${this.uid ?? 'NA'}`;
    return this.name ? `${this.name}(${des})` : des;
  }

  get parent() {
    return this.sup;
  }

  set parent(value) {
    this.sup = value;
  }

  get children() {
    return this.sub;
  }

  set children(value) {
    this.sub = value;
  }

  get(key, defaultValue) {
    return key in this.data ? this.data[key] : defaultValue;
  }

  set(key, value) {
    return this.data[key] = value;
  }

  insert(element, pos) {
    const self = this;
    if ((element == null ? void 0 : element.screen) !== this.screen) throw new Error('Cannot switch a node\'s screen.');
    element.detach();
    element.sup = this;
    element.screen = this.screen;
    pos <= 0 ? this.sub.unshift(element) : pos < this.sub.length ? this.sub.splice(pos, 0, element) : this.sub.push(element);
    element.emit(REPARENT, this);
    this.emit(ADOPT, element);

    function attachEmitter(element) {
      const detachDiff = element.detached !== self.detached;
      element.detached = self.detached;
      if (detachDiff) element.emit(ATTACH);
      element.sub.forEach(attachEmitter);
    }

    attachEmitter(element);
    if (!this.screen.focused) this.screen.focused = element;
  }

  prepend(element) {
    this.insert(element, 0);
  }

  append(element) {
    this.insert(element, this.sub.length);
  }

  insertBefore(element, other) {
    const i = this.sub.indexOf(other);
    if (~i) this.insert(element, i);
  }

  insertAfter(element, other) {
    const i = this.sub.indexOf(other);
    if (~i) this.insert(element, i + 1);
  }

  remove(element) {
    if (element.sup !== this) return void 0;
    let index = this.sub.indexOf(element);
    if (!~index) return void 0;
    element.clearPos();
    element.sup = null;
    this.sub.splice(index, 1);
    let indexClick = this.screen.clickable.indexOf(element);
    if (~indexClick) this.screen.clickable.splice(indexClick, 1);
    let indexKeyed = this.screen.keyable.indexOf(element);
    if (~indexKeyed) this.screen.keyable.splice(indexKeyed, 1);
    element.emit(REPARENT, null);
    this.emit(REMOVE, element);

    function detachEmitter(el) {
      const attached = el.detached !== true;
      el.detached = true;
      if (attached) el.emit(DETACH);
      el.sub.forEach(detachEmitter);
    }

    detachEmitter(element);
    if (this.screen.focused === element) this.screen.rewindFocus();
  }

  detach() {
    var _this$sup2;

    return (_this$sup2 = this.sup) == null ? void 0 : _this$sup2.remove(this);
  }

  free() {}

  destroy() {
    this.detach();
    this.forDescendants(function (node) {
      node.free();
      node.destroyed = true;
      node.emit(DESTROY);
    }, this);
  }

  forDescendants(iter, s) {
    if (s) iter(this);
    this.sub.forEach(function emit(node) {
      iter(node);
      node.sub.forEach(emit);
    });
  }

  forAncestors(iter, s) {
    let node = this;
    if (s) iter(this);

    while (node = node.sup) {
      iter(node);
    }
  }

  collectDescendants(s) {
    const out = [];
    this.forDescendants(node => out.push(node), s);
    return out;
  }

  collectAncestors(s) {
    const out = [];
    this.forAncestors(node => out.push(node), s);
    return out;
  }

  emitDescendants(...args) {
    let iter;
    if (typeof last(args) === FUN) iter = args.pop();
    return this.forDescendants(node => {
      if (iter) iter(node);
      node.emit.apply(node, args);
    }, true);
  }

  emitAncestors(...args) {
    let iter;
    if (typeof last(args) === FUN) iter = args.pop();
    return this.forAncestors(node => {
      if (iter) iter(node);
      node.emit.apply(node, args);
    }, true);
  }

  hasDescendant(target) {
    function find(sup) {
      const nodes = sup == null ? void 0 : sup.sub;
      if (!nodes) return false;

      for (const node of nodes) if (node === target || find(node)) return true;

      return false;
    }

    return find(this);
  }

  hasAncestor(target) {
    let node = this;

    while (node = (_node = node) == null ? void 0 : _node.sup) {
      var _node;

      if (node === target) return true;
    }

    return false;
  }

}

const node = options => new Node(options);

export { Node, node };