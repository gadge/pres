/**
 * listbar.js - listbar element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
import { Box }                                     from '@pres/components-core'
import {
  ACTION, ADD_ITEM, CANCEL, CLICK, FOCUS, KEYPRESS, REMOVE_ITEM, SELECT, SELECT_ITEM, SELECT_TAB, SET_ITEMS,
}                                                  from '@pres/enum-events'
import { ENTER, ESCAPE, LEFT, RETURN, RIGHT, TAB } from '@pres/enum-key-names'
import * as helpers                                from '@pres/util-helpers'
import { FUN, NUM, OBJ, STR }                      from '@typen/enum-data-types'
import { nullish }                                 from '@typen/nullish'
import { last }                                    from '@vect/vector'
import { mapper }                                  from '@vect/vector-mapper'
import { EFFECT_COLLECTION }                       from '../assets'

export class ListBar extends Box {

  /**
   * Listbar / HorizontalList
   */
  constructor(options = {}) {
    if (!options.sku) options.sku = 'list-bar'
    super(options)
    const self = this
    this.items = []
    this.ritems = []
    this.commands = []
    this.leftBase = 0
    this.leftOffset = 0
    this.mouse = options.mouse || false
    // super(options)
    if (!this.style.selected) this.style.selected = {}
    if (!this.style.item) this.style.item = {}
    if (options.commands || options.items) this.setItems(options.commands || options.items)
    if (options.keys) {
      this.on(KEYPRESS, (ch, key) => {
        if (key.name === LEFT || ( options.vi && key.name === 'h' ) || ( key.shift && key.name === TAB )) {
          self.moveLeft()
          self.screen.render()
          // Stop propagation if we're in a form.
          if (key.name === TAB) return false
          return void 0
        }
        if (key.name === RIGHT || ( options.vi && key.name === 'l' ) || key.name === TAB) {
          self.moveRight()
          self.screen.render()
          // Stop propagation if we're in a form.
          if (key.name === TAB) return false
          return void 0
        }
        if (key.name === ENTER || key.name === RETURN || ( options.vi && key.name === 'k' && !key.shift )) {
          self.emit(ACTION, self.items[self.selected], self.selected)
          self.emit(SELECT, self.items[self.selected], self.selected)
          const item = self.items[self.selected]
          if (item.data.callback) item.data.callback()
          self.screen.render()
          return void 0
        }
        if (key.name === ESCAPE || ( options.vi && key.name === 'q' )) {
          self.emit(ACTION)
          self.emit(CANCEL)
          return void 0
        }
      })
    }
    if (options.autoCommandKeys) {
      this.onScreenEvent(KEYPRESS, ch => {
        if (/^[0-9]$/.test(ch)) {
          let i = +ch - 1
          if (!~i) i = 9
          return self.selectTab(i)
        }
      })
    }
    this.on(FOCUS, () => self.select(self.selected))
    this.type = 'list-bar'
  }
  static build(options) { return new ListBar(options) }
  get selected() { return this.leftBase + this.leftOffset }
  setItems(commands) {
    const self = this
    if (!Array.isArray(commands)) commands = mapper(Object.entries(commands),
      ([ key, conf ], i) => {
        if (typeof conf === FUN) conf = { callback: conf }
        if (nullish(conf.text)) conf.text = key
        if (nullish(conf.prefix)) conf.prefix = ++i + ''
        if (nullish(conf.text) && conf.callback) conf.text = conf.callback.name
        return conf
      })
    for (const item of this.items) { item.detach() }
    this.items = []
    this.ritems = []
    this.commands = []
    for (const cmd of commands) { self.add(cmd) }
    this.emit(SET_ITEMS)
  }
  parseItemConfig(item, callback) {
    const items = this.items
    const conf =
            typeof item === OBJ ? ( item.prefix = item.prefix ?? String(items.length + 1), item )
              : typeof item === STR ? { prefix: String(items.length + 1), text: item, callback: callback }
              : typeof item === FUN ? { prefix: String(items.length + 1), text: item.name, callback: item } : {}
    if (conf.keys && conf.keys[0]) { conf.prefix = conf.keys[0] }
    return conf
  }
  add = this.appendItem
  addItem = this.appendItem
  appendItem(item, callback) {
    const self = this
    const conf = this.parseItemConfig(item, callback)
    const prev = last(this.items)
    const drawn = this.sup ? ( prev ? prev.absL + prev.width : 0 ) + ( !this.screen.autoPadding ? this.intL : 0 ) : 0
    const tags = helpers.generateTags(this.style.prefix ?? { fg: 'light-black' })
    const pseudoTitle = ( nullish(conf.prefix) ? '' : `${ conf.prefix }:` ) + conf.text
    const formatTitle = ( nullish(conf.prefix) ? '' : `${ tags.open }${ conf.prefix }${ tags.close }:` ) + conf.text
    const opts = {
      sup: this,
      top: 'center',
      left: drawn + 1,
      height: 1,//'50%',
      content: formatTitle,
      width: pseudoTitle.length + 2,
      align: 'center',
      valign: 'middle',
      autoFocus: false,
      tags: true,
      mouse: true,
      style: Object.assign({}, this.style.item),
      noOverflow: true
    }
    if (!this.screen.autoPadding) {
      // console.log('list-bar config', 'not autoPadding', !this.screen.autoPadding, this.intT, this.intL)
      if (typeof opts.top === NUM) opts.top += this.intT
      if (typeof opts.left === NUM) opts.left += this.intL
    }
    const box = this.data[conf.text] = conf.element = new Box(opts)
    for (const effect of EFFECT_COLLECTION) {
      opts.style[effect] = () => {
        const attr = box === self.items[self.selected] ? self.style.selected[effect] : self.style.item[effect]
        return typeof attr === FUN ? attr(box) : attr
      }
    }
    Object.assign(box.data, conf)
    this.ritems.push(conf.text)
    this.items.push(box)
    this.commands.push(conf)
    // this.append(box)
    if (conf.callback && conf.keys) {
      this.screen.key(conf.keys, () => {
        self.emit(ACTION, box, self.selected)
        self.emit(SELECT, box, self.selected)
        if (box.data.callback) box.data.callback()
        self.select(box)
        self.screen.render()
      })
    }
    if (this.items.length === 1) { this.select(0) }
    // XXX May be affected by new element.options.mouse option.
    if (this.mouse) {
      box.on(CLICK, () => {
        self.emit(ACTION, box, self.selected)
        self.emit(SELECT, box, self.selected)
        if (box.data.callback) { box.data.callback() }
        self.select(box)
        self.screen.render()
      })
    }
    this.emit(ADD_ITEM)
  }
  render() {
    const self = this
    let drawn = 0
    if (!this.screen.autoPadding) drawn += this.intL
    this.items.forEach((item, i) => {
      if (i < self.leftBase) { item.hide() }
      else {
        item.relL = drawn + 1
        drawn += item.width + 2
        item.show()
      }
    })
    return this._render()
  }
  select(offset) {
    if (typeof offset !== NUM) offset = this.items.indexOf(offset)
    offset = offset < 0 ? 0 : offset >= this.items.length ? this.items.length - 1 : offset
    if (!this.sup) {
      this.emit(SELECT_ITEM, this.items[offset], offset)
      return
    }
    const prevPos = this.calcCoord()
    if (!prevPos) return
    const self  = this,
          width = ( prevPos.xHi - prevPos.xLo ) - this.intW
    let drawn   = 0,
        visible = 0
    let item = this.items[offset]
    if (!item) return
    this.items.forEach((item, i) => {
      if (i < self.leftBase) return
      const prevPos = item.calcCoord()
      if (!prevPos || prevPos.xHi <= prevPos.xLo) return
      drawn += ( prevPos.xHi - prevPos.xLo ) + 2
      if (drawn <= width) visible++
    })
    let diff = offset - ( this.leftBase + this.leftOffset )
    if (offset > this.leftBase + this.leftOffset) {
      if (offset > this.leftBase + visible - 1) {
        this.leftOffset = 0
        this.leftBase = offset
      }
      else {
        this.leftOffset += diff
      }
    }
    else if (offset < this.leftBase + this.leftOffset) {
      diff = -diff
      if (offset < this.leftBase) {
        this.leftOffset = 0
        this.leftBase = offset
      }
      else {
        this.leftOffset -= diff
      }
    }
    // XXX Move `action` and `select` events here.
    this.emit(SELECT_ITEM, item, offset)
  }
  removeItem(item) {
    const index = typeof item === NUM ? item : this.items.indexOf(item)
    if (~index && this.items[index]) {
      item = this.items.splice(index, 1)[0]
      this.ritems.splice(index, 1)
      this.commands.splice(index, 1)
      this.remove(item)
      if (index === this.selected) { this.select(index - 1) }
    }
    this.emit(REMOVE_ITEM)
  }
  move(offset) { this.select(this.selected + offset) }
  moveLeft(offset) { this.move(-( offset || 1 )) }
  moveRight(offset) { this.move(offset || 1) }
  selectTab(index) {
    const item = this.items[index]
    if (item) {
      if (item.data.callback) { item.data.callback() }
      this.select(index)
      this.screen.render()
    }
    this.emit(SELECT_TAB, item, index)
  }
}
