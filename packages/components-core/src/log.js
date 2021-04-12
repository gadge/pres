/**
 * log.js - log element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import util               from 'util'
import { Node }           from '../core/node'
import { ScrollableText } from './scrollabletext'

const nextTick = global.setImmediate || process.nextTick.bind(process)

export class Log extends ScrollableText {
  type = 'log'
  /**
   * Log
   */
  constructor(options = {}) {
    super(options)
    const self = this
    if (!(this instanceof Node)) return new Log(options)

    this.scrollback = options.scrollback != null
      ? options.scrollback
      : Infinity
    this.scrollOnInput = options.scrollOnInput

    this.on('set content', function () {
      if (!self._userScrolled || self.scrollOnInput) {
        nextTick(function () {
          self.setScrollPerc(100)
          self._userScrolled = false
          self.screen.render()
        })
      }
    })
    this._scroll = Log.prototype.scroll
  }
  log = this.add // log() { return this.add() }
  add() {
    const args = Array.prototype.slice.call(arguments)
    if (typeof args[0] === 'object') {
      args[0] = util.inspect(args[0], true, 20, true)
    }
    const text = util.format.apply(util, args)
    this.emit('log', text)
    const ret = this.pushLine(text)
    if (this._clines.fake.length > this.scrollback) {
      this.shiftLine(0, (this.scrollback / 3) | 0)
    }
    return ret
  }
  _scroll = this.scroll
  scroll(offset, always) {
    if (offset === 0) return this._scroll(offset, always)
    this._userScrolled = true
    const ret = this._scroll(offset, always)
    if (this.getScrollPerc() === 100) {
      this._userScrolled = false
    }
    return ret
  }
}
