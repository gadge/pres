/**
 * list.js - list element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Box }                           from '@pres/components-core'
import {
  ACTION, ADD_ITEM, ADOPT, CANCEL, CLICK, CREATE_ITEM, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, INSERT_ITEM, KEYPRESS,
  REMOVE, REMOVE_ITEM, RESIZE, SELECT, SELECT_ITEM, SET_ITEMS,
}                                        from '@pres/enum-events'
import { DOWN, ENTER, ESCAPE, LEFT, UP } from '@pres/enum-key-names'
import * as helpers                      from '@pres/util-helpers'
import { FUN, NUM, OBJ, STR }            from '@typen/enum-data-types'
import { EFFECT_COLLECTION }             from '../assets'

export class List extends Box {
  /**
   * List
   */
  constructor(options = {}) {
    options.ignoreKeys = true
    // Possibly put this here: this.items = [];
    options.scrollable = true
    if (!options.sku) options.sku = 'list'
    super(options)
    const self = this
    // if (!(this instanceof Node)) return new List(options)
    options.ignoreKeys = true
    // Possibly put this here: this.items = [];
    options.scrollable = true
    this.value = ''
    this.items = []
    this.ritems = []
    this.selected = 0
    this._isList = true
    if (!this.style.selected) {
      this.style.selected = {}
      this.style.selected.bg = options.selectedBg
      this.style.selected.fg = options.selectedFg
      this.style.selected.bold = options.selectedBold
      this.style.selected.underline = options.selectedUnderline
      this.style.selected.blink = options.selectedBlink
      this.style.selected.inverse = options.selectedInverse
      this.style.selected.invisible = options.selectedInvisible
    }
    if (!this.style.item) {
      this.style.item = {}
      this.style.item.bg = options.itemBg
      this.style.item.fg = options.itemFg
      this.style.item.bold = options.itemBold
      this.style.item.underline = options.itemUnderline
      this.style.item.blink = options.itemBlink
      this.style.item.inverse = options.itemInverse
      this.style.item.invisible = options.itemInvisible
    }

    // Legacy: for apps written before the addition of item attributes.
    EFFECT_COLLECTION
      .forEach(name => {
        if (self.style[name] != null && self.style.item[name] == null) {
          self.style.item[name] = self.style[name]
        }
      })
    if (this.options.itemHoverBg) this.options.itemHoverEffects = { bg: this.options.itemHoverBg }
    if (this.options.itemHoverEffects) this.style.item.hover = this.options.itemHoverEffects
    if (this.options.itemFocusEffects) this.style.item.focus = this.options.itemFocusEffects
    this.interactive = options.interactive !== false
    this.mouse = options.mouse || false
    if (options.items) {
      this.ritems = options.items
      options.items.forEach(this.add.bind(this))
    }
    this.select(0)
    if (options.mouse) {
      this.screen._listenMouse(this)
      this.on(ELEMENT_WHEELDOWN, () => {
        self.select(self.selected + 2)
        self.screen.render()
      })
      this.on(ELEMENT_WHEELUP, () => {
        self.select(self.selected - 2)
        self.screen.render()
      })
    }
    if (options.keys) {
      this.on(KEYPRESS, (ch, key) => {
        if (key.name === UP || ( options.vi && key.name === 'k' )) {
          self.up()
          self.screen.render()
          return
        }
        if (key.name === DOWN || ( options.vi && key.name === 'j' )) {
          self.down()
          self.screen.render()
          return
        }
        if (key.name === ENTER || ( options.vi && key.name === 'l' && !key.shift )) {
          self.enterSelected()
          return
        }
        if (key.name === ESCAPE || ( options.vi && key.name === 'q' )) {
          self.cancelSelected()
          return
        }
        if (options.vi && key.name === 'u' && key.ctrl) {
          self.move(-( ( self.height - self.intH ) / 2 ) | 0)
          self.screen.render()
          return
        }
        if (options.vi && key.name === 'd' && key.ctrl) {
          self.move(( self.height - self.intH ) / 2 | 0)
          self.screen.render()
          return
        }
        if (options.vi && key.name === 'b' && key.ctrl) {
          self.move(-( self.height - self.intH ))
          self.screen.render()
          return
        }
        if (options.vi && key.name === 'f' && key.ctrl) {
          self.move(self.height - self.intH)
          self.screen.render()
          return
        }
        if (options.vi && key.name === 'h' && key.shift) {
          self.move(self.subBase - self.selected)
          self.screen.render()
          return
        }
        if (options.vi && key.name === 'm' && key.shift) {
          // TODO: Maybe use Math.min(this.items.length,
          // ... for calculating visible items elsewhere.
          const visible = Math.min(
            self.height - self.intH,
            self.items.length) / 2 | 0
          self.move(self.subBase + visible - self.selected)
          self.screen.render()
          return
        }
        if (options.vi && key.name === 'l' && key.shift) {
          // XXX This goes one too far on lists with an odd number of items.
          self.down(self.subBase
            + Math.min(self.height - self.intH, self.items.length)
            - self.selected)
          self.screen.render()
          return
        }
        if (options.vi && key.name === 'g' && !key.shift) {
          self.select(0)
          self.screen.render()
          return
        }
        if (options.vi && key.name === 'g' && key.shift) {
          self.select(self.items.length - 1)
          self.screen.render()
          return
        }
        if (options.vi && ( key.ch === '/' || key.ch === '?' )) {
          if (typeof self.options.search !== FUN) return
          return self.options.search((err, value) => {
            if (typeof err === STR || typeof err === FUN || typeof err === NUM || ( err?.test )) {
              value = err
              err = null
            }
            if (err || !value) return self.screen.render()
            self.select(self.fuzzyFind(value, key.ch === '?'))
            self.screen.render()
          })
        }
      })
    }
    this.on(RESIZE, () => {
      const visible = self.height - self.intH
      // if (self.selected < visible - 1) {
      if (visible >= self.selected + 1) {
        self.subBase = 0
        self.subOffset = self.selected
      }
      else {
        // Is this supposed to be: self.subBase = visible - self.selected + 1; ?
        self.subBase = self.selected - visible + 1
        self.subOffset = visible - 1
      }
    })
    this.on(ADOPT, el => { if (!~self.items.indexOf(el)) el.fixed = true })
    // Ensure sub are removed from the
    // item list if they are items.
    this.on(REMOVE, el => self.removeItem(el))
    this.type = 'list'
  }
  static build(options) { return new List(options) }
  createItem(content) {
    const self = this
    // Note: Could potentially use Button here.
    const options = {
      screen: this.screen,
      content: content,
      align: this.align || LEFT,
      top: 0,
      left: 0,
      right: ( this.scrollbar ? 1 : 0 ),
      tags: this.parseTags,
      height: 1,
      hoverEffects: this.mouse ? this.style.item.hover : null,
      focusEffects: this.mouse ? this.style.item.focus : null,
      autoFocus: false,
      // sup: self
    }
    if (!this.screen.autoPadding) {
      options.top = 1
      options.left = this.intL
      options.right = this.intR + ( this.scrollbar ? 1 : 0 )
    }
    // if (this.shrink) {
    // XXX NOTE: Maybe just do this on all shrinkage once autoPadding is default?
    if (this.shrink && this.options.normalShrink) {
      delete options.right
      options.width = 'shrink'
    }
    EFFECT_COLLECTION.forEach(name => {
      options[name] = () => {
        let attr = self.items[self.selected] === item && self.interactive
          ? self.style.selected[name]
          : self.style.item[name]
        if (typeof attr === FUN) attr = attr(item)
        return attr
      }
    })
    if (this.style.transparent) options.transparent = true
    const item = new Box(options)
    if (this.mouse) {
      item.on(CLICK, () => {
        self.focus()
        if (self.items[self.selected] === item) {
          self.emit(ACTION, item, self.selected)
          self.emit(SELECT, item, self.selected)
          return
        }
        self.select(item)
        self.screen.render()
      })
    }
    this.emit(CREATE_ITEM)
    return item
  }
  add = this.appendItem
  addItem = this.appendItem
  appendItem(content) {
    content = typeof content === STR ? content : content.getContent()
    const item = this.createItem(content)
    item.pos.top = this.items.length
    if (!this.screen.autoPadding) item.pos.top = this.intT + this.items.length
    this.ritems.push(content)
    this.items.push(item)
    this.append(item)
    if (this.items.length === 1) this.select(0)
    this.emit(ADD_ITEM)
    return item
  }
  removeItem(child) {
    const i = this.getItemIndex(child)
    if (~i && this.items[i]) {
      child = this.items.splice(i, 1)[0]
      this.ritems.splice(i, 1)
      this.remove(child)
      for (let j = i; j < this.items.length; j++)
        this.items[j].pos.top--
      if (i === this.selected) this.select(i - 1)
    }
    this.emit(REMOVE_ITEM)
    return child
  }
  insertItem(child, content) {
    content = typeof content === STR ? content : content.getContent()
    const i = this.getItemIndex(child)
    if (!~i) return
    if (i >= this.items.length) return this.appendItem(content)
    const item = this.createItem(content)
    for (let j = i; j < this.items.length; j++)
      this.items[j].pos.top++
    item.pos.top = i + ( !this.screen.autoPadding ? 1 : 0 )
    this.ritems.splice(i, 0, content)
    this.items.splice(i, 0, item)
    this.append(item)
    if (i === this.selected)
      this.select(i + 1)
    this.emit(INSERT_ITEM)
  }
  getItem(child) { return this.items[this.getItemIndex(child)] }
  setItem(child, content) {
    content = typeof content === STR ? content : content.getContent()
    const i = this.getItemIndex(child)
    if (!~i) return
    this.items[i].setContent(content)
    this.ritems[i] = content
  }
  clearItems() { return this.setItems([]) }
  setItems(items) {
    const original = this.items.slice(),
          selected = this.selected
    let sel = this.ritems[this.selected],
        i   = 0
    items = items.slice()
    this.select(0)
    for (; i < items.length; i++) { this.items[i] ? this.items[i].setContent(items[i]) : this.add(items[i]) }
    for (; i < original.length; i++) { this.remove(original[i]) }
    this.ritems = items
    // Try to find our old item if it still exists.
    sel = items.indexOf(sel)
    ~sel ? this.select(sel) : items.length === original.length ? this.select(selected) : this.select(Math.min(selected, items.length - 1))
    this.emit(SET_ITEMS)
  }
  pushItem(content) { return this.appendItem(content), this.items.length }
  popItem() { return this.removeItem(this.items.length - 1) }
  unshiftItem(content) { return this.insertItem(0, content), this.items.length }
  shiftItem() { return this.removeItem(0) }
  spliceItem(child, n) {
    const self = this
    let i = this.getItemIndex(child)
    if (!~i) return
    const items = Array.prototype.slice.call(arguments, 2)
    const removed = []
    while (n--) {
      removed.push(this.removeItem(i))
    }
    items.forEach(item => self.insertItem(i++, item))
    return removed
  }
  find = this.fuzzyFind
  fuzzyFind(search, back) {
    const start = this.selected + ( back ? -1 : 1 )
    let i
    if (typeof search === NUM) search += ''
    if (search && search[0] === '/' && search[search.length - 1] === '/')
      try { search = new RegExp(search.slice(1, -1)) } catch (e) { }
    const test = typeof search === STR
      ? item => !!~item.indexOf(search)
      : ( search.test ? search.test.bind(search) : search )
    if (typeof test !== FUN) {
      if (this.screen.options.debug) { throw new Error('fuzzyFind(): `test` is not a function.') }
      return this.selected
    }
    if (!back) {
      for (i = start; i < this.ritems.length; i++) if (test(helpers.cleanTags(this.ritems[i]))) return i
      for (i = 0; i < start; i++) if (test(helpers.cleanTags(this.ritems[i]))) return i
    }
    else {
      for (i = start; i >= 0; i--) if (test(helpers.cleanTags(this.ritems[i]))) return i
      for (i = this.ritems.length - 1; i > start; i--) if (test(helpers.cleanTags(this.ritems[i]))) return i
    }
    return this.selected
  }
  getItemIndex(child) {
    if (typeof child === NUM) {
      return child
    }
    else if (typeof child === STR) {
      let i = this.ritems.indexOf(child)
      if (~i) return i
      for (i = 0; i < this.ritems.length; i++) if (helpers.cleanTags(this.ritems[i]) === child) return i
      return -1
    }
    else {
      return this.items.indexOf(child)
    }
  }
  select(index) {
    if (!this.interactive) return
    if (!this.items.length) {
      this.selected = 0
      this.value = ''
      this.scrollTo(0)
      return
    }
    if (typeof index === OBJ) {
      index = this.items.indexOf(index)
    }
    if (index < 0) {
      index = 0
    }
    else if (index >= this.items.length) {
      index = this.items.length - 1
    }
    if (this.selected === index && this._listInitialized) return
    this._listInitialized = true
    this.selected = index
    this.value = helpers.cleanTags(this.ritems[this.selected])
    if (!this.sup) return
    this.scrollTo(this.selected)
    // XXX Move `action` and `select` events here.
    this.emit(SELECT_ITEM, this.items[this.selected], this.selected)
  }
  move(offset) { this.select(this.selected + offset) }
  up(offset) { this.move(-( offset || 1 )) }
  down(offset) { this.move(offset || 1) }
  pick(label, callback) {
    if (!callback) {
      callback = label
      label = null
    }
    if (!this.interactive) { return callback() }
    const self = this
    const focused = this.screen.focused
    if (focused && focused._done) focused._done('stop')
    this.screen.saveFocus()
    // XXX Keep above:
    // var sup = this.sup;
    // this.detach();
    // sup.append(this);
    this.focus()
    this.show()
    this.select(0)
    if (label) this.setLabel(label)
    this.screen.render()
    this.once(ACTION, (el, selected) => {
      if (label) self.removeLabel()
      self.screen.restoreFocus()
      self.hide()
      self.screen.render()
      if (!el) return callback()
      return callback(null, helpers.cleanTags(self.ritems[selected]))
    })
  }
  enterSelected(i) {
    if (i != null) this.select(i)
    this.emit(ACTION, this.items[this.selected], this.selected)
    this.emit(SELECT, this.items[this.selected], this.selected)
  }
  cancelSelected(i) {
    if (i != null) this.select(i)
    this.emit(ACTION)
    this.emit(CANCEL)
  }
}


