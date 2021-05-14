/**
 * node.js - base abstract node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { ADOPT, ATTACH, DESTROY, DETACH, REMOVE, REPARENT, } from '@pres/enum-events'
import { EventEmitter }                                      from '@pres/events'
import { AEU }                                               from '@texting/enum-chars'
import { FUN }                                               from '@typen/enum-data-types'
import { last }                                              from '@vect/vector-index'
import { NodeCollection }                                    from './nodeCollection'
import { ScreenCollection }                                  from './screenCollection'

export class Node extends EventEmitter {
  type = 'node'
  /**
   * Node
   */
  constructor(options = {}, lazy) {
    super(options)
    if (lazy) return this
    this.setup(options)
  }
  static build(options) { return new Node(options) }
  setup(options) {
    // console.log(`>>> called setup on Node by ${this.type}`)
    const self = this
    // this.type = this.type ?? 'node'
    this.options = options
    this.name = options.name
    this.sku = options.sku
    this.screen = this.screen || options.screen
    if (!this.screen) {
      // console.log(`>>> this.type = ${this.type}`)
      if (this.type === 'screen') { this.screen = this }
      else if (ScreenCollection.total === 1) { this.screen = ScreenCollection.global }
      else if (options.sup) {
        this.screen = options.sup
        while (this.screen && this.screen.type !== 'screen') this.screen = this.screen.sup
      }
      else if (ScreenCollection.total) {
        // This _should_ work in most cases as long as the element is appended
        // synchronously after the screen's creation. Throw error if not.
        this.screen = ScreenCollection.instances |> last
        process.nextTick(() => {
          if (!self.sup) throw new Error('Element (' + self.type + ')'
            + ' was not appended synchronously after the'
            + ' screen\'s creation. Please set a `sup`'
            + ' or `screen` option in the element\'s constructor'
            + ' if you are going to use multiple screens and'
            + ' append the element later.')
        })
      }
      else { throw new Error('No active screen.') }
    }
    this.sup = options.sup ?? null
    this.sub = []
    this.$ = this._ = this.data = {}
    this.uid = NodeCollection.uid++
    this.index = this.index ?? -1
    if (this.type !== 'screen') this.detached = true
    if (this.sup) this.sup.append(this)
    options.sub?.forEach(this.append.bind(this))
    if (ScreenCollection.journal) console.log('>> [new node]', this.codename, '∈', this.parent?.codename ?? AEU)
  }
  get codename() {
    const _name = `${this.sku ?? this.type ?? ''}.${this.uid ?? 'NA'}`
    return this.name ? `${this.name}(${_name})` : _name
  }
  insert(element, i) {
    const self = this
    if (element.screen && element.screen !== this.screen) throw new Error('Cannot switch a node\'s screen.')
    element.detach()
    element.sup = this
    element.screen = this.screen
    if (i === 0) { this.sub.unshift(element) }
    else if (i === this.sub.length) { this.sub.push(element) }
    else { this.sub.splice(i, 0, element) }
    element.emit(REPARENT, this)
    this.emit(ADOPT, element);
    (function emit(el) {
      const n = el.detached !== self.detached
      el.detached = self.detached
      if (n) el.emit(ATTACH)
      el.sub.forEach(emit)
    })(element)
    if (!this.screen.focused) this.screen.focused = element
  }
  prepend(element) { this.insert(element, 0) }
  append(element) { this.insert(element, this.sub.length) }
  insertBefore(element, other) {
    const i = this.sub.indexOf(other)
    if (~i) this.insert(element, i)
  }
  insertAfter(element, other) {
    const i = this.sub.indexOf(other)
    if (~i) this.insert(element, i + 1)
  }
  remove(element) {
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
    element.emit(REPARENT, null)
    this.emit(REMOVE, element);
    (function emit(el) {
      const n = el.detached !== true
      el.detached = true
      if (n) el.emit(DETACH)
      el.sub.forEach(emit)
    })(element)
    if (this.screen.focused === element) this.screen.rewindFocus()
  }
  detach() { if (this.sup) this.sup.remove(this) }
  free() { }
  destroy() {
    this.detach()
    this.forDescendants(function (el) {
      el.free()
      el.destroyed = true
      el.emit(DESTROY)
    }, this)
  }
  forDescendants(iter, s) {
    if (s) iter(this)
    this.sub.forEach(function emit(el) {
      iter(el)
      el.sub.forEach(emit)
    })
  }
  forAncestors(iter, s) {
    let el = this
    if (s) iter(this)
    while ((el = el.sup)) { iter(el) }
  }
  collectDescendants(s) {
    const out = []
    this.forDescendants(el => out.push(el), s)
    return out
  }
  collectAncestors(s) {
    const out = []
    this.forAncestors(el => out.push(el), s)
    return out
  }
  emitDescendants() {
    const args = Array.prototype.slice(arguments)
    let iter
    if (typeof args[args.length - 1] === FUN) iter = args.pop()
    return this.forDescendants(el => {
      if (iter) iter(el)
      el.emit.apply(el, args)
    }, true)
  }
  emitAncestors() {
    const args = Array.prototype.slice(arguments)
    let iter
    if (typeof args[args.length - 1] === FUN) iter = args.pop()
    return this.forAncestors(el => {
      if (iter) iter(el)
      el.emit.apply(el, args)
    }, true)
  }
  hasDescendant(target) {
    function find(el) {
      const sub = el.sub
      for (const child of sub)
        if (child === target || find(child)) return true
      return false
    }
    return find(this)
  }
  hasAncestor(target) {
    let el = this
    while ((el = el.sup)) if (el === target) return true
    return false
  }
  get(name, value) { return this.data.hasOwnProperty(name) ? this.data[name] : value }
  set(name, value) { return this.data[name] = value }
}
