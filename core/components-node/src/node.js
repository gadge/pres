/**
 * node.js - base abstract node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { ADOPT, ATTACH, DESTROY, DETACH, REMOVE, REPARENT, } from '@pres/enum-events'
import { EventEmitter }                                      from '@pres/events'
import { GlobalNode }                                        from '@pres/global-node'
import { GlobalScreen }                                      from '@pres/global-screen'
import { AEU }                                               from '@texting/enum-chars'
import { FUN }                                               from '@typen/enum-data-types'
import { last }                                              from '@vect/vector-index'

export class Node extends EventEmitter {
  type = 'node'
  sup = null
  sub = []
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
    this.options = options
    this.name = options.name
    this.sku = options.sku
    this.configScreen(options)
    this.$ = this._ = this.data = {}
    this.uid = GlobalNode.uid++
    this.gid = ( this.sku ?? this.type ) + '.' + GlobalNode.typedId(this.sku ?? this.type)
    this.index = this.index ?? -1
    if (this.type !== 'screen') this.detached = true
    let sup, sub
    if (( sup = options.sup ?? options.parent )) {
      this.sup = sup
      this.sup.append(this)
    }
    if (( sub = options.sub ?? options.children )) {
      for (const node of sub) { this.append(node) }
    }
    if (GlobalScreen.journal) console.log('>> [new node]', this.codename, '∈',
      this.sup?.codename ?? this.screen?.codename ?? AEU)
  }
  configScreen(options) {
    let screen = this.screen ?? options.screen
    if (!screen) {
      const self = this
      let sup
      // console.log(`>>> this.type = ${this.type}`)
      if (this.type === 'screen') { screen = this }
      else if (GlobalScreen.total === 1) { screen = GlobalScreen.global }
      else if (( sup = options.sup ?? options.parent )) {
        screen = sup
        while (screen?.type !== 'screen') screen = screen.sup
      }
      else if (GlobalScreen.total) { // This _should_ work in most cases as long as the element is appended synchronously after the screen's creation. Throw error if not.
        screen = last(GlobalScreen.instances)
        process.nextTick(() => {
          if (!self.sup) throw new Error(
            'Element (' + self.type + ') was not appended synchronously after the screen\'s creation. ' +
            'Please set a \'parent\' or \'screen\' option in the element\'s constructor ' +
            'if you are going to use multiple screens and append the element later.'
          )
        })
      }
      else { throw new Error('No active screen.') }
    }
    return this.screen = screen
  }
  get codename() { return this.name ? `${ this.name }( ${ this.gid } )` : this.gid }

  get parent() { return this.sup }
  set parent(value) { this.sup = value }
  get children() { return this.sub }
  set children(value) { this.sub = value }

  get(key, defaultValue) { return key in this.data ? this.data[key] : defaultValue }
  set(key, value) { return this.data[key] = value }

  insert(node, index) {
    const self = this
    if (node?.screen !== this.screen) throw new Error('Cannot switch a node\'s screen.')
    node.detach()
    node.sup = this
    node.screen = this.screen
    index <= 0 ? this.sub.unshift(node) : index < this.sub.length ? this.sub.splice(index, 0, node) : this.sub.push(node)
    node.emit(REPARENT, this)
    this.emit(ADOPT, node)
    function attachEmitter(el) {
      const detachDiff = el.detached !== self.detached
      el.detached = self.detached
      if (detachDiff) el.emit(ATTACH)
      el.sub.forEach(attachEmitter)
    }
    attachEmitter(node)
    if (!this.screen.focused) this.screen.focused = node
  }
  prepend(node) { this.insert(node, 0) }
  append(node) { this.insert(node, this.sub.length) }
  insertBefore(node, another) {
    const i = this.sub.indexOf(another)
    if (~i) this.insert(node, i)
  }
  insertAfter(node, another) {
    const i = this.sub.indexOf(another)
    if (~i) this.insert(node, i + 1)
  }
  remove(node) {
    if (node.sup !== this) return void 0
    let index = this.sub.indexOf(node)
    if (!~index) return void 0

    node.clearPos()
    node.sup = null
    this.sub.splice(index, 1)

    let indexClick = this.screen.clickable.indexOf(node)
    if (~indexClick) this.screen.clickable.splice(indexClick, 1)

    let indexKeyed = this.screen.keyable.indexOf(node)
    if (~indexKeyed) this.screen.keyable.splice(indexKeyed, 1)

    node.emit(REPARENT, null)
    this.emit(REMOVE, node)
    function detachEmitter(el) {
      const attached = el.detached !== true
      el.detached = true
      if (attached) el.emit(DETACH)
      el.sub.forEach(detachEmitter)
    }
    detachEmitter(node)
    if (this.screen.focused === node) this.screen.rewindFocus()
  }
  detach() { return this.sup?.remove(this) }
  free() { }
  destroy() {
    this.detach()
    this.forDescendants(function (node) {
      node.free()
      node.destroyed = true
      node.emit(DESTROY)
    }, this)
  }
  forDescendants(iter, s) {
    if (s) iter(this)
    this.sub.forEach(function emit(node) {
      iter(node)
      node.sub.forEach(emit)
    })
  }
  forAncestors(iter, s) {
    let node = this
    if (s) iter(this)
    while (( node = node.sup )) { iter(node) }
  }
  collectDescendants(s) {
    const out = []
    this.forDescendants(node => out.push(node), s)
    return out
  }
  collectAncestors(s) {
    const out = []
    this.forAncestors(node => out.push(node), s)
    return out
  }
  emitDescendants(...args) {
    let iter
    if (typeof last(args) === FUN) iter = args.pop()
    return this.forDescendants(node => {
      if (iter) iter(node)
      node.emit.apply(node, args)
    }, true)
  }
  emitAncestors(...args) {
    let iter
    if (typeof last(args) === FUN) iter = args.pop()
    return this.forAncestors(node => {
      if (iter) iter(node)
      node.emit.apply(node, args)
    }, true)
  }
  hasDescendant(target) {
    function find(sup) {
      const nodes = sup?.sub
      if (!nodes) return false
      for (const node of nodes)
        if (node === target || find(node)) return true
      return false
    }
    return find(this)
  }
  hasAncestor(target) {
    let node = this
    while (( node = node?.sup )) if (node === target) return true
    return false
  }
}
