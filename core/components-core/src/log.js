/**
 * log.js - log element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { LOG as _LOG, SET_CONTENT, } from '@pres/enum-events'
import { OBJ }                       from '@typen/enum-data-types'
import util                          from 'util'
import { ScrollableBox }             from './scrollable-box'
import { ScrollableText }            from './scrollable-text'

const nextTick = global.setImmediate || process.nextTick.bind(process)
export class Log extends ScrollableText {
  type = 'log'

  /**
   * Log
   */
  constructor(options = {}) {
    if (!options.sku) options.sku = 'log'
    super(options)
    const self = this
    // if (!(this instanceof Node)) return new Log(options)
    this.scrollback = options.scrollback ?? Infinity
    this.scrollOnInput = options.scrollOnInput
    this.on(SET_CONTENT, () => {
      if (!self._userScrolled || self.scrollOnInput) nextTick(() => {
        self.setScrollPerc(100)
        self._userScrolled = false
        self.screen.render()
      })
    })
  }
  static build(options) { return new Log(options) }
  log = this.add // log() { return this.add() }
  add(...args) {
    if (typeof args[0] === OBJ) {
      args[0] = util.inspect(args[0], true, 20, true)
    }
    const text = util.format.apply(util, args)
    this.emit(_LOG, text)
    const ret = this.pushLine(text)
    if (this._clines.fake.length > this.scrollback) this.shiftLine(0, (this.scrollback / 3) | 0)
    return ret
  }
  _scroll = ScrollableBox.prototype.scroll
  scroll(offset, always) {
    if (offset === 0) return this._scroll(offset, always)
    this._userScrolled = true
    const ret = this._scroll(offset, always)
    if (this.getScrollPerc() === 100) this._userScrolled = false
    return ret
  }
}
