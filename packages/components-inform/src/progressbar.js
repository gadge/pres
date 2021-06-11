/**
 * progressbar.js - progress bar element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
import { Input }                             from '@pres/components-form'
import { CLICK, COMPLETE, KEYPRESS, RESET, } from '@pres/enum-events'

/**
 * ProgressBar
 */

export class ProgressBar extends Input {
  constructor(options = {}) {
    super(options)
    const self = this
    // if (!(this instanceof Node)) return new ProgressBar(options)
    this.filled = options.filled || 0
    if (typeof this.filled === 'string') this.filled = +this.filled.slice(0, -1)
    this.value = this.filled
    this.pch = options.pch || ' '
    // XXX Workaround that predates the usage of `el.ch`.
    if (options.ch) {
      this.pch = options.ch
      this.ch = ' '
    }
    if (options.bch) {
      this.ch = options.bch
    }
    if (!this.style.bar) {
      this.style.bar = {}
      this.style.bar.fg = options.barFg
      this.style.bar.bg = options.barBg
    }
    this.orientation = options.orientation || 'horizontal'
    if (options.keys) {
      this.on(KEYPRESS, function (ch, key) {
        let back, forward
        if (self.orientation === 'horizontal') {
          back = [ 'left', 'h' ]
          forward = [ 'right', 'l' ]
        }
        else if (self.orientation === 'vertical') {
          back = [ 'down', 'j' ]
          forward = [ 'up', 'k' ]
        }
        if (key.name === back[0] || ( options.vi && key.name === back[1] )) {
          self.progress(-5)
          self.screen.render()
          return
        }
        if (key.name === forward[0] || ( options.vi && key.name === forward[1] )) {
          self.progress(5)
          self.screen.render()
        }
      })
    }
    if (options.mouse) {
      this.on(CLICK, function (data) {
        let x, y, m, p
        if (!self.lpos) return
        if (self.orientation === 'horizontal') {
          x = data.x - self.lpos.xLo
          m = ( self.lpos.xHi - self.lpos.xLo ) - self.intW
          p = x / m * 100 | 0
        }
        else if (self.orientation === 'vertical') {
          y = data.y - self.lpos.yLo
          m = ( self.lpos.yHi - self.lpos.yLo ) - self.intH
          p = y / m * 100 | 0
        }
        self.setProgress(p)
      })
    }
    this.type = 'progress-bar'
  }
  static build(options) { return new ProgressBar(options) }
  render() {
    const ret = this._render()
    if (!ret) return
    let
      xLo = ret.xLo,
      xHi = ret.xHi,
      yLo = ret.yLo,
      yHi = ret.yHi,
      dattr
    if (this.border) xLo++, yLo++, xHi--, yHi--
    if (this.orientation === 'horizontal') {
      xHi = xLo + ( ( xHi - xLo ) * ( this.filled / 100 ) ) | 0
    }
    else if (this.orientation === 'vertical') {
      yLo = yLo + ( ( yHi - yLo ) - ( ( ( yHi - yLo ) * ( this.filled / 100 ) ) | 0 ) )
    }
    dattr = this.sattr(this.style.bar)
    this.screen.fillRegion(dattr, this.pch, xLo, xHi, yLo, yHi)
    if (this.content) {
      const line = this.screen.lines[yLo]
      for (let i = 0; i < this.content.length; i++) {
        line[xLo + i].ch = this.content[i]
      }
      line.dirty = true
    }
    return ret
  }
  progress(filled) {
    this.filled += filled
    if (this.filled < 0) this.filled = 0
    else if (this.filled > 100) this.filled = 100
    if (this.filled === 100) {
      this.emit(COMPLETE)
    }
    this.value = this.filled
  }
  setProgress(filled) {
    this.filled = 0
    this.progress(filled)
  }
  reset() {
    this.emit(RESET)
    this.filled = 0
    this.value = this.filled
  }
}

