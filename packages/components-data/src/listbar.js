/**
 * listbar.js - listbar element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Box }     from '@pres/components-core'
import { helpers } from '@pres/util-helpers'

import { ATTACH, REMOVE_LISTENER, EVENT, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEW_LISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHT_EXCEPTION, WARNING, ACTION, ADD_ITEM, ADOPT, BTNDOWN, BTNUP, CD, CHECK, COMPLETE, CONNECT, CREATE_ITEM, DBLCLICK, DRAG, INSERT_ITEM, _LOG, MOVE, PARSED_CONTENT, PASSTHROUGH, REFRESH, REMOVE, REMOVE_ITEM, REPARENT, RESPONSE, SELECT, SELECT_ITEM, SELECT_TAB, SET_ITEMS, UNCHECK, WHEELDOWN, WHEELUP, } from '@pres/enum-events'

export class  Listbar extends Box {
  /**
   * Listbar / HorizontalList
   */
  constructor(options = {}) {
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
      this.on(KEYPRESS, function (ch, key) {
        if (key.name === 'left'
          || (options.vi && key.name === 'h')
          || (key.shift && key.name === 'tab')) {
          self.moveLeft()
          self.screen.render()
          // Stop propagation if we're in a form.
          if (key.name === 'tab') return false
          return
        }
        if (key.name === 'right'
          || (options.vi && key.name === 'l')
          || key.name === 'tab') {
          self.moveRight()
          self.screen.render()
          // Stop propagation if we're in a form.
          if (key.name === 'tab') return false
          return
        }
        if (key.name === 'enter'
          || (options.vi && key.name === 'k' && !key.shift)) {
          self.emit(ACTION, self.items[self.selected], self.selected)
          self.emit(SELECT, self.items[self.selected], self.selected)
          const item = self.items[self.selected]
          if (item._.cmd.callback) {
            item._.cmd.callback()
          }
          self.screen.render()
          return
        }
        if (key.name === 'escape' || (options.vi && key.name === 'q')) {
          self.emit(ACTION)
          self.emit(CANCEL)
        }
      })
    }

    if (options.autoCommandKeys) {
      this.onScreenEvent(KEYPRESS, function (ch) {
        if (/^[0-9]$/.test(ch)) {
          let i = +ch - 1
          if (!~i) i = 9
          return self.selectTab(i)
        }
      })
    }

    this.on(FOCUS, function () {
      self.select(self.selected)
    })
    this.type = 'listbar'
    this.add = Listbar.prototype.appendItem
    this.addItem = Listbar.prototype.appendItem
  }
  get selected() {
    return this.leftBase + this.leftOffset
  }
  setItems(commands) {
    const self = this

    if (!Array.isArray(commands)) {
      commands = Object.keys(commands).reduce(function (obj, key, i) {
        let cmd = commands[key],
          cb

        if (typeof cmd === 'function') {
          cb = cmd
          cmd = { callback: cb }
        }

        if (cmd.text == null) cmd.text = key
        if (cmd.prefix == null) cmd.prefix = ++i + ''

        if (cmd.text == null && cmd.callback) {
          cmd.text = cmd.callback.name
        }

        obj.push(cmd)

        return obj
      }, [])
    }

    this.items.forEach(function (el) {
      el.detach()
    })

    this.items = []
    this.ritems = []
    this.commands = []

    commands.forEach(function (cmd) {
      self.add(cmd)
    })

    this.emit(SET_ITEMS)
  }
  appendItem(item, callback) {
    const self = this,
      prev = this.items[this.items.length - 1]
    let drawn,
      cmd,
      title,
      len

    if (!this.parent) {
      drawn = 0
    } else {
      drawn = prev ? prev.aleft + prev.width : 0
      if (!this.screen.autoPadding) {
        drawn += this.ileft
      }
    }

    if (typeof item === 'object') {
      cmd = item
      if (cmd.prefix == null) cmd.prefix = (this.items.length + 1) + ''
    }

    if (typeof item === 'string') {
      cmd = {
        prefix: (this.items.length + 1) + '',
        text: item,
        callback: callback
      }
    }

    if (typeof item === 'function') {
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

    [ 'bg', 'fg', 'bold', 'underline',
      'blink', 'inverse', 'invisible' ].forEach(function (name) {
      options.style[name] = function () {
        let attr = self.items[self.selected] === el
          ? self.style.selected[name]
          : self.style.item[name]
        if (typeof attr === 'function') attr = attr(el)
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
        this.screen.key(cmd.keys, function () {
          self.emit(ACTION, el, self.selected)
          self.emit(SELECT, el, self.selected)
          if (el._.cmd.callback) {
            el._.cmd.callback()
          }
          self.select(el)
          self.screen.render()
        })
      }
    }

    if (this.items.length === 1) {
      this.select(0)
    }

    // XXX May be affected by new element.options.mouse option.
    if (this.mouse) {
      el.on(CLICK, function () {
        self.emit(ACTION, el, self.selected)
        self.emit(SELECT, el, self.selected)
        if (el._.cmd.callback) {
          el._.cmd.callback()
        }
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

    this.items.forEach(function (el, i) {
      if (i < self.leftBase) {
        el.hide()
      } else {
        el.rleft = drawn + 1
        drawn += el.width + 2
        el.show()
      }
    })

    return this._render()
  }
  select(offset) {
    if (typeof offset !== 'number') {
      offset = this.items.indexOf(offset)
    }

    if (offset < 0) {
      offset = 0
    } else if (offset >= this.items.length) {
      offset = this.items.length - 1
    }

    if (!this.parent) {
      this.emit(SELECT_ITEM, this.items[offset], offset)
      return
    }

    const lpos = this._getCoords()
    if (!lpos) return

    const self = this,
      width = (lpos.xl - lpos.xi) - this.iwidth
    let drawn = 0,
      visible = 0,
      el

    el = this.items[offset]
    if (!el) return

    this.items.forEach(function (el, i) {
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
      } else {
        this.leftOffset += diff
      }
    } else if (offset < this.leftBase + this.leftOffset) {
      diff = -diff
      if (offset < this.leftBase) {
        this.leftOffset = 0
        this.leftBase = offset
      } else {
        this.leftOffset -= diff
      }
    }

    // XXX Move `action` and `select` events here.
    this.emit(SELECT_ITEM, el, offset)
  }
  removeItem(child) {
    const i = typeof child !== 'number'
      ? this.items.indexOf(child)
      : child

    if (~i && this.items[i]) {
      child = this.items.splice(i, 1)[0]
      this.ritems.splice(i, 1)
      this.commands.splice(i, 1)
      this.remove(child)
      if (i === this.selected) {
        this.select(i - 1)
      }
    }

    this.emit(REMOVE_ITEM)
  }
  move(offset) {
    this.select(this.selected + offset)
  }
  moveLeft(offset) {
    this.move(-(offset || 1))
  }
  moveRight(offset) {
    this.move(offset || 1)
  }
  selectTab(index) {
    const item = this.items[index]
    if (item) {
      if (item._.cmd.callback) {
        item._.cmd.callback()
      }
      this.select(index)
      this.screen.render()
    }
    this.emit(SELECT_TAB, item, index)
  }
}
