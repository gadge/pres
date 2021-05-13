/**
 * listbar.js - listbar element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Box }                             from '@pres/components-core'
import {
  ACTION, ADD_ITEM, CANCEL, CLICK, FOCUS, KEYPRESS, REMOVE_ITEM, SELECT, SELECT_ITEM, SELECT_TAB, SET_ITEMS,
}                                          from '@pres/enum-events'
import { ENTER, ESCAPE, LEFT, RIGHT, TAB } from '@pres/enum-key-names'
import * as helpers           from '@pres/util-helpers'
import { FUN, NUM, OBJ, STR } from '@typen/enum-data-types'

export class ListBar extends Box {
  add = this.appendItem
  addItem = this.appendItem
  /**
   * Listbar / HorizontalList
   */
  constructor(options = {}) {
    if (!options.sku) options.sku = 'list-bar'
    super(options)
    const self = this
    // if (!(this instanceof Node)) return new Listbar(options)
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
        if (key.name === LEFT ||
          (options.vi && key.name === 'h') ||
          (key.shift && key.name === TAB)) {
          self.moveLeft()
          self.screen.render()
          // Stop propagation if we're in a form.
          if (key.name === TAB) return false
          return void 0
        }
        if (key.name === RIGHT ||
          (options.vi && key.name === 'l') ||
          key.name === TAB) {
          self.moveRight()
          self.screen.render()
          // Stop propagation if we're in a form.
          if (key.name === TAB) return false
          return void 0
        }
        if (key.name === ENTER ||
          (options.vi && key.name === 'k' && !key.shift)) {
          self.emit(ACTION, self.items[self.selected], self.selected)
          self.emit(SELECT, self.items[self.selected], self.selected)
          const item = self.items[self.selected]
          if (item._.cmd.callback) item._.cmd.callback()
          self.screen.render()
          return void 0
        }
        if (key.name === ESCAPE || (options.vi && key.name === 'q')) {
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
    this.type = 'listbar'
  }
  static build(options) { return new ListBar(options) }
  get selected() { return this.leftBase + this.leftOffset }
  setItems(commands) {
    const self = this
    if (!Array.isArray(commands)) {
      commands = Object.keys(commands).reduce((obj, key, i) => {
        let cmd = commands[key],
            cb
        if (typeof cmd === FUN) {
          cb = cmd
          cmd = { callback: cb }
        }
        if (cmd.text == null) cmd.text = key
        if (cmd.prefix == null) cmd.prefix = ++i + ''
        if (cmd.text == null && cmd.callback) cmd.text = cmd.callback.name
        obj.push(cmd)
        return obj
      }, [])
    }
    this.items.forEach(el => el.detach())
    this.items = []
    this.ritems = []
    this.commands = []
    commands.forEach(cmd => self.add(cmd))
    this.emit(SET_ITEMS)
  }
  appendItem(item, callback) {
    const self = this,
          prev = this.items[this.items.length - 1]
    let drawn,
        cmd,
        title,
        len
    if (!this.sup) { drawn = 0 }
    else {
      drawn = prev ? prev.aleft + prev.width : 0
      if (!this.screen.autoPadding) { drawn += this.ileft }
    }
    if (typeof item === OBJ) {
      cmd = item
      if (cmd.prefix == null) cmd.prefix = (this.items.length + 1) + ''
    }
    if (typeof item === STR) {
      cmd = {
        prefix: (this.items.length + 1) + '',
        text: item,
        callback: callback
      }
    }
    if (typeof item === FUN) {
      cmd = {
        prefix: (this.items.length + 1) + '',
        text: item.name,
        callback: item
      }
    }
    if (cmd.keys && cmd.keys[0]) {
      cmd.prefix = cmd.keys[0]
    }
    const t = helpers.generateTags(this.style.prefix || { fg: 'lightblack' })
    title = (cmd.prefix != null ? t.open + cmd.prefix + t.close + ':' : '') + cmd.text

    len = ((cmd.prefix != null ? cmd.prefix + ':' : '') + cmd.text).length
    const options = {
      screen: this.screen,
      top: 0,
      left: drawn + 1,
      height: 1,
      content: title,
      width: len + 2,
      align: 'center',
      autoFocus: false,
      tags: true,
      mouse: true,
      style: helpers.merge({}, this.style.item),
      noOverflow: true
    }
    if (!this.screen.autoPadding) {
      options.top += this.itop
      options.left += this.ileft
    }
    [ 'bg', 'fg', 'bold', 'underline', 'blink', 'inverse', 'invisible' ].forEach(name => {
      options.style[name] = () => {
        let attr = self.items[self.selected] === el
          ? self.style.selected[name]
          : self.style.item[name]
        if (typeof attr === FUN) attr = attr(el)
        return attr
      }
    })
    var el = new Box(options)
    this._[cmd.text] = el
    cmd.element = el
    el._.cmd = cmd
    this.ritems.push(cmd.text)
    this.items.push(el)
    this.commands.push(cmd)
    this.append(el)
    if (cmd.callback) {
      if (cmd.keys) {
        this.screen.key(cmd.keys, () => {
          self.emit(ACTION, el, self.selected)
          self.emit(SELECT, el, self.selected)
          if (el._.cmd.callback) el._.cmd.callback()
          self.select(el)
          self.screen.render()
        })
      }
    }
    if (this.items.length === 1) { this.select(0) }
    // XXX May be affected by new element.options.mouse option.
    if (this.mouse) {
      el.on(CLICK, () => {
        self.emit(ACTION, el, self.selected)
        self.emit(SELECT, el, self.selected)
        if (el._.cmd.callback) { el._.cmd.callback() }
        self.select(el)
        self.screen.render()
      })
    }
    this.emit(ADD_ITEM)
  }
  render() {
    const self = this
    let drawn = 0
    if (!this.screen.autoPadding) {
      drawn += this.ileft
    }
    this.items.forEach((el, i) => {
      if (i < self.leftBase) { el.hide() }
      else {
        el.rleft = drawn + 1
        drawn += el.width + 2
        el.show()
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
    const lpos = this._getCoords()
    if (!lpos) return
    const self  = this,
          width = (lpos.xl - lpos.xi) - this.iwidth
    let drawn   = 0,
        visible = 0,
        el
    el = this.items[offset]
    if (!el) return
    this.items.forEach((el, i) => {
      if (i < self.leftBase) return
      const lpos = el._getCoords()
      if (!lpos) return
      if (lpos.xl - lpos.xi <= 0) return
      drawn += (lpos.xl - lpos.xi) + 2
      if (drawn <= width) visible++
    })
    let diff = offset - (this.leftBase + this.leftOffset)
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
    this.emit(SELECT_ITEM, el, offset)
  }
  removeItem(child) {
    const i = typeof child !== NUM
      ? this.items.indexOf(child)
      : child
    if (~i && this.items[i]) {
      child = this.items.splice(i, 1)[0]
      this.ritems.splice(i, 1)
      this.commands.splice(i, 1)
      this.remove(child)
      if (i === this.selected) { this.select(i - 1) }
    }
    this.emit(REMOVE_ITEM)
  }
  move(offset) { this.select(this.selected + offset) }
  moveLeft(offset) { this.move(-(offset || 1)) }
  moveRight(offset) { this.move(offset || 1) }
  selectTab(index) {
    const item = this.items[index]
    if (item) {
      if (item._.cmd.callback) { item._.cmd.callback() }
      this.select(index)
      this.screen.render()
    }
    this.emit(SELECT_TAB, item, index)
  }
}
