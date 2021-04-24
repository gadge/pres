/**
 * scrollablebox.js - scrollable box element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { KEYPRESS, MOUSEDOWN, MOUSEUP, PARSED_CONTENT, SCROLL, WHEELDOWN, WHEELUP, } from '@pres/enum-events'
import { Box }                                                                       from '../core/box'

export class ScrollableBox extends Box {
  type = 'scrollable-box'
  /**
   * ScrollableBox
   */
  constructor(options = {}) {
    super(options)
    const self = this
    // if (!(this instanceof Node)) return new ScrollableBox(options)
    if (options.scrollable === false) return this
    this.scrollable = true
    this.childOffset = 0
    this.childBase = 0
    this.baseLimit = options.baseLimit || Infinity
    this.alwaysScroll = options.alwaysScroll
    const scrollbar = this.scrollbar = options.scrollbar
    if (scrollbar) {
      if (!scrollbar.ch) scrollbar.ch = ' '
      this.style.scrollbar = this.style.scrollbar ?? scrollbar.style ?? {
        fg: scrollbar.fg,
        bg: scrollbar.bg,
        bold: scrollbar.bold,
        underline: scrollbar.underline,
        inverse: scrollbar.inverse,
        invisible: scrollbar.invisible,
      }
      if (this.track || scrollbar.track) {
        this.track = scrollbar.track || this.track
        this.style.track = this.style.scrollbar.track || this.style.track
        this.track.ch = this.track.ch || ' '
        this.style.track = this.style.track ?? this.track.style ?? {
          fg: this.track.fg,
          bg: this.track.bg,
          bold: this.track.bold,
          underline: this.track.underline,
          inverse: this.track.inverse,
          invisible: this.track.invisible,
        }
        this.track.style = this.style.track
      }
      // Allow controlling of the scrollbar via the mouse:
      if (options.mouse) {
        this.on(MOUSEDOWN, function (data) {
          if (self._scrollingBar) {
            // Do not allow dragging on the scrollbar:
            delete self.screen._dragging
            delete self._drag
            return
          }
          const x = data.x - self.aleft
          const y = data.y - self.atop
          if (x === self.width - self.iright - 1) {
            // Do not allow dragging on the scrollbar:
            delete self.screen._dragging
            delete self._drag
            const perc = (y - self.itop) / (self.height - self.iheight)
            self.setScrollPerc(perc * 100 | 0)
            self.screen.render()
            let smd, smu
            self._scrollingBar = true
            self.onScreenEvent(MOUSEDOWN, smd = function (data) {
              const y = data.y - self.atop
              const perc = y / self.height
              self.setScrollPerc(perc * 100 | 0)
              self.screen.render()
            })
            // If mouseup occurs out of the window, no mouseup event fires, and
            // scrollbar will drag again on mousedown until another mouseup
            // occurs.
            self.onScreenEvent(MOUSEUP, smu = function () {
              self._scrollingBar = false
              self.removeScreenEvent(MOUSEDOWN, smd)
              self.removeScreenEvent(MOUSEUP, smu)
            })
          }
        })
      }
    }
    if (options.mouse) {
      this.on(WHEELDOWN, () => {
        self.scroll(self.height / 2 | 0 || 1)
        self.screen.render()
      })
      this.on(WHEELUP, () => {
        self.scroll(-(self.height / 2 | 0) || -1)
        self.screen.render()
      })
    }
    if (options.keys && !options.ignoreKeys) {
      this.on(KEYPRESS, (ch, key) => {
        if (key.name === 'up' || (options.vi && key.name === 'k')) {
          self.scroll(-1)
          self.screen.render()
          return
        }
        if (key.name === 'down' || (options.vi && key.name === 'j')) {
          self.scroll(1)
          self.screen.render()
          return
        }
        if (options.vi && key.name === 'u' && key.ctrl) {
          self.scroll(-(self.height / 2 | 0) || -1)
          self.screen.render()
          return
        }
        if (options.vi && key.name === 'd' && key.ctrl) {
          self.scroll(self.height / 2 | 0 || 1)
          self.screen.render()
          return
        }
        if (options.vi && key.name === 'b' && key.ctrl) {
          self.scroll(-self.height || -1)
          self.screen.render()
          return
        }
        if (options.vi && key.name === 'f' && key.ctrl) {
          self.scroll(self.height || 1)
          self.screen.render()
          return
        }
        if (options.vi && key.name === 'g' && !key.shift) {
          self.scrollTo(0)
          self.screen.render()
          return
        }
        if (options.vi && key.name === 'g' && key.shift) {
          self.scrollTo(self.getScrollHeight())
          self.screen.render()
        }
      })
    }
    this.on(PARSED_CONTENT, () => self._recalculateIndex())
    self._recalculateIndex()
  }
  static build(options) { return new ScrollableBox(options) }
  // XXX Potentially use this in place of scrollable checks elsewhere.
  get reallyScrollable() {
    if (this.shrink) return this.scrollable
    return this.getScrollHeight() > this.height
  }
  _scrollBottom() {
    if (!this.scrollable) return 0
    // We could just calculate the children, but we can
    // optimize for lists by just returning the items.length.
    if (this._isList) { return this.items ? this.items.length : 0 }
    if (this.lpos && this.lpos._scrollBottom) { return this.lpos._scrollBottom }
    const bottom = this.children.reduce((current, el) => {
      // el.height alone does not calculate the shrunken height, we need to use
      // getCoords. A shrunken box inside a scrollable element will not grow any
      // larger than the scrollable element's context regardless of how much
      // content is in the shrunken box, unless we do this (call getCoords
      // without the scrollable calculation):
      // See: $ node test/widget-shrink-fail-2.js
      if (!el.detached) {
        const lpos = el._getCoords(false, true)
        if (lpos) { return Math.max(current, el.rtop + (lpos.yl - lpos.yi)) }
      }
      return Math.max(current, el.rtop + el.height)
    }, 0)
    // XXX Use this? Makes .getScrollHeight() useless!
    // if (bottom < this._clines.length) bottom = this._clines.length;
    if (this.lpos) this.lpos._scrollBottom = bottom
    return bottom
  }
  setScroll(offset, always) {
    // XXX
    // At first, this appeared to account for the first new calculation of childBase:
    this.scroll(0)
    return this.scroll(offset - (this.childBase + this.childOffset), always)
  }
  scrollTo(offset, always) {
    // XXX
    // At first, this appeared to account for the first new calculation of childBase:
    this.scroll(0)
    return this.scroll(offset - (this.childBase + this.childOffset), always)
  }
  getScroll() { return this.childBase + this.childOffset }
  scroll(offset, always) {
    if (!this.scrollable) return
    if (this.detached) return
    // Handle scrolling.
    const visible = this.height - this.iheight,
          base    = this.childBase
    let d,
        p,
        t,
        b,
        max,
        emax
    if (this.alwaysScroll || always) {
      // Semi-workaround
      this.childOffset = offset > 0
        ? visible - 1 + offset
        : offset
    }
    else {
      this.childOffset += offset
    }
    if (this.childOffset > visible - 1) {
      d = this.childOffset - (visible - 1)
      this.childOffset -= d
      this.childBase += d
    }
    else if (this.childOffset < 0) {
      d = this.childOffset
      this.childOffset += -d
      this.childBase += d
    }
    if (this.childBase < 0) {
      this.childBase = 0
    }
    else if (this.childBase > this.baseLimit) {
      this.childBase = this.baseLimit
    }
    // Find max "bottom" value for
    // content and descendant elements.
    // Scroll the content if necessary.
    if (this.childBase === base) { return this.emit(SCROLL) }
    // When scrolling text, we want to be able to handle SGR codes as well as line
    // feeds. This allows us to take preformatted text output from other programs
    // and put it in a scrollable text box.
    this.parseContent()
    // XXX
    // max = this.getScrollHeight() - (this.height - this.iheight);
    max = this._clines.length - (this.height - this.iheight)
    if (max < 0) max = 0
    emax = this._scrollBottom() - (this.height - this.iheight)
    if (emax < 0) emax = 0
    this.childBase = Math.min(this.childBase, Math.max(emax, max))
    if (this.childBase < 0) { this.childBase = 0 }
    else if (this.childBase > this.baseLimit) { this.childBase = this.baseLimit }
    // Optimize scrolling with CSR + IL/DL.
    p = this.lpos
    // Only really need _getCoords() if we want
    // to allow nestable scrolling elements...
    // or if we **really** want shrinkable
    // scrolling elements.
    // p = this._getCoords();
    if (p && this.childBase !== base && this.screen.cleanSides(this)) {
      t = p.yi + this.itop
      b = p.yl - this.ibottom - 1
      d = this.childBase - base
      // scrolled down
      if (d > 0 && d < visible) {
        this.screen.deleteLine(d, t, t, b)
      }
      // scrolled up
      else if (d < 0 && -d < visible) {
        d = -d
        this.screen.insertLine(d, t, t, b)
      }
    }
    return this.emit(SCROLL)
  }
  _recalculateIndex() {
    let max, emax
    if (this.detached || !this.scrollable) {
      return 0
    }
    // XXX
    // max = this.getScrollHeight() - (this.height - this.iheight);

    max = this._clines.length - (this.height - this.iheight)
    if (max < 0) max = 0
    emax = this._scrollBottom() - (this.height - this.iheight)
    if (emax < 0) emax = 0
    this.childBase = Math.min(this.childBase, Math.max(emax, max))
    if (this.childBase < 0) { this.childBase = 0 }
    else if (this.childBase > this.baseLimit) { this.childBase = this.baseLimit }
  }
  resetScroll() {
    if (!this.scrollable) return
    this.childOffset = 0
    this.childBase = 0
    return this.emit(SCROLL)
  }
  getScrollHeight() {
    return Math.max(this._clines.length, this._scrollBottom())
  }
  getScrollPerc(s) {
    const pos = this.lpos || this._getCoords()
    if (!pos) return s ? -1 : 0
    const height = (pos.yl - pos.yi) - this.iheight,
          i      = this.getScrollHeight()
    let p
    if (height < i) {
      if (this.alwaysScroll) { p = this.childBase / (i - height) }
      else { p = (this.childBase + this.childOffset) / (i - 1) }
      return p * 100
    }
    return s ? -1 : 0
  }
  setScrollPerc(i) {
    // XXX
    // var m = this.getScrollHeight();
    const m = Math.max(this._clines.length, this._scrollBottom())
    return this.scrollTo((i / 100) * m | 0)
  }
}
