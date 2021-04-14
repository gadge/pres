/**
 * progressbar.js - progress bar element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Node }  from '@pres/components-core'
import { Input } from '@pres/components-form'


/**
 * ProgressBar
 */

export class ProgressBar extends Input {
  constructor(options = {}) {
    super(options)
    const self = this
    // if (!(this instanceof Node)) return new ProgressBar(options)
    this.filled = options.filled || 0
    if (typeof this.filled === 'string') {
      this.filled = +this.filled.slice(0, -1)
    }
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
      this.on('keypress', function (ch, key) {
        let back, forward
        if (self.orientation === 'horizontal') {
          back = [ 'left', 'h' ]
          forward = [ 'right', 'l' ]
        } else if (self.orientation === 'vertical') {
          back = [ 'down', 'j' ]
          forward = [ 'up', 'k' ]
        }
        if (key.name === back[0] || (options.vi && key.name === back[1])) {
          self.progress(-5)
          self.screen.render()
          return
        }
        if (key.name === forward[0] || (options.vi && key.name === forward[1])) {
          self.progress(5)
          self.screen.render()

        }
      })
    }

    if (options.mouse) {
      this.on('click', function (data) {
        let x, y, m, p
        if (!self.lpos) return
        if (self.orientation === 'horizontal') {
          x = data.x - self.lpos.xi
          m = (self.lpos.xl - self.lpos.xi) - self.iwidth
          p = x / m * 100 | 0
        } else if (self.orientation === 'vertical') {
          y = data.y - self.lpos.yi
          m = (self.lpos.yl - self.lpos.yi) - self.iheight
          p = y / m * 100 | 0
        }
        self.setProgress(p)
      })
    }
    this.type = 'progress-bar'
  }
  render() {
    const ret = this._render()
    if (!ret) return

    let
      xi = ret.xi,
      xl = ret.xl,
      yi = ret.yi,
      yl = ret.yl,
      dattr

    if (this.border) xi++, yi++, xl--, yl--

    if (this.orientation === 'horizontal') {
      xl = xi + ((xl - xi) * (this.filled / 100)) | 0
    } else if (this.orientation === 'vertical') {
      yi = yi + ((yl - yi) - (((yl - yi) * (this.filled / 100)) | 0))
    }

    dattr = this.sattr(this.style.bar)

    this.screen.fillRegion(dattr, this.pch, xi, xl, yi, yl)

    if (this.content) {
      const line = this.screen.lines[yi]
      for (let i = 0; i < this.content.length; i++) {
        line[xi + i][1] = this.content[i]
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
      this.emit('complete')
    }
    this.value = this.filled
  }
  setProgress(filled) {
    this.filled = 0
    this.progress(filled)
  }
  reset() {
    this.emit('reset')
    this.filled = 0
    this.value = this.filled
  }
}


