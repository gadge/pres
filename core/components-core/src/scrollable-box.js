/**
 * scrollablebox.js - scrollable box element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Box } from '../core/box'

export class ScrollableBox extends Box {
  type = 'scrollable-box'
  /**
   * ScrollableBox
   */
  constructor(options = {}) {
    if (!options.sku) options.sku = 'scrollable-box'
    options.scrollable = true
    super(options)
    // console.log(this.type, Reflect.ownKeys(this))
    // const self = this
    // // if (!(this instanceof Node)) return new ScrollableBox(options)
    // if (options.scrollable === false) return this
    // this.scrollable = true
    // this.subOffset = 0
    // this.subBase = 0
    // this.baseLimit = options.baseLimit || Infinity
    // this.alwaysScroll = options.alwaysScroll
    // const scrollbar = this.scrollbar = options.scrollbar
    // if (scrollbar) {
    //   if (!scrollbar.ch) scrollbar.ch = ' '
    //   this.style.scrollbar = this.style.scrollbar ?? scrollbar.style ?? {
    //     fg: scrollbar.fg,
    //     bg: scrollbar.bg,
    //     bold: scrollbar.bold,
    //     underline: scrollbar.underline,
    //     inverse: scrollbar.inverse,
    //     invisible: scrollbar.invisible,
    //   }
    //   if (this.track || scrollbar.track) {
    //     this.track = scrollbar.track || this.track
    //     this.style.track = this.style.scrollbar.track || this.style.track
    //     this.track.ch = this.track.ch || ' '
    //     this.style.track = this.style.track ?? this.track.style ?? {
    //       fg: this.track.fg,
    //       bg: this.track.bg,
    //       bold: this.track.bold,
    //       underline: this.track.underline,
    //       inverse: this.track.inverse,
    //       invisible: this.track.invisible,
    //     }
    //     this.track.style = this.style.track
    //   }
    //   // Allow controlling of the scrollbar via the mouse:
    //   if (options.mouse) {
    //     this.on(MOUSEDOWN, function (data) {
    //       if (self._scrollingBar) {
    //         // Do not allow dragging on the scrollbar:
    //         delete self.screen._dragging
    //         delete self._drag
    //         return
    //       }
    //       const x = data.x - self.absL
    //       const y = data.y - self.absT
    //       if (x === self.width - self.intR - 1) {
    //         // Do not allow dragging on the scrollbar:
    //         delete self.screen._dragging
    //         delete self._drag
    //         const perc = (y - self.intT) / (self.height - self.intH)
    //         self.scrollPercent = (perc * 100 | 0)
    //         self.screen.render()
    //         let smd, smu
    //         self._scrollingBar = true
    //         self.onScreenEvent(MOUSEDOWN, smd = function (data) {
    //           const y = data.y - self.absT
    //           const perc = y / self.height
    //           self.scrollPercent = (perc * 100 | 0)
    //           self.screen.render()
    //         })
    //         // If mouseup occurs out of the window, no mouseup event fires, and
    //         // scrollbar will drag again on mousedown until another mouseup
    //         // occurs.
    //         self.onScreenEvent(MOUSEUP, smu = function () {
    //           self._scrollingBar = false
    //           self.offScreenEvent(MOUSEDOWN, smd)
    //           self.offScreenEvent(MOUSEUP, smu)
    //         })
    //       }
    //     })
    //   }
    // }
    // if (options.mouse) {
    //   this.on(WHEELDOWN, () => {
    //     self.scroll(self.height / 2 | 0 || 1)
    //     self.screen.render()
    //   })
    //   this.on(WHEELUP, () => {
    //     self.scroll(-(self.height / 2 | 0) || -1)
    //     self.screen.render()
    //   })
    // }
    // if (options.keys && !options.ignoreKeys) {
    //   this.on(KEYPRESS, (ch, key) => {
    //     if (key.name === 'up' || (options.vi && key.name === 'k')) {
    //       self.scroll(-1)
    //       self.screen.render()
    //       return
    //     }
    //     if (key.name === 'down' || (options.vi && key.name === 'j')) {
    //       self.scroll(1)
    //       self.screen.render()
    //       return
    //     }
    //     if (options.vi && key.name === 'u' && key.ctrl) {
    //       self.scroll(-(self.height / 2 | 0) || -1)
    //       self.screen.render()
    //       return
    //     }
    //     if (options.vi && key.name === 'd' && key.ctrl) {
    //       self.scroll(self.height / 2 | 0 || 1)
    //       self.screen.render()
    //       return
    //     }
    //     if (options.vi && key.name === 'b' && key.ctrl) {
    //       self.scroll(-self.height || -1)
    //       self.screen.render()
    //       return
    //     }
    //     if (options.vi && key.name === 'f' && key.ctrl) {
    //       self.scroll(self.height || 1)
    //       self.screen.render()
    //       return
    //     }
    //     if (options.vi && key.name === 'g' && !key.shift) {
    //       self.scrollTo(0)
    //       self.screen.render()
    //       return
    //     }
    //     if (options.vi && key.name === 'g' && key.shift) {
    //       self.scrollTo(self.scrollHeight)
    //       self.screen.render()
    //     }
    //   })
    // }
    // this.on(PARSED_CONTENT, () => self.recalcIndex())
    // self.recalcIndex()
  }
  static build(options) { return new ScrollableBox(options) }
  // // XXX Potentially use this in place of scrollable checks elsewhere.
  // get reallyScrollable() {
  //   if (this.shrink) return this.scrollable
  //   return this.scrollHeight > this.height
  // }
  // _scrollBottom() {
  //   if (!this.scrollable) return 0
  //   // We could just calculate the sub, but we can
  //   // optimize for lists by just returning the items.length.
  //   if (this._isList) { return this.items ? this.items.length : 0 }
  //   if (this.lpos && this.lpos._scrollBottom) { return this.lpos._scrollBottom }
  //   const bottom = this.sub.reduce((current, el) => {
  //     // el.height alone does not calculate the shrunken height, we need to use
  //     // getCoords. A shrunken box inside a scrollable element will not grow any
  //     // larger than the scrollable element's context regardless of how much
  //     // content is in the shrunken box, unless we do this (call getCoords
  //     // without the scrollable calculation):
  //     // See: $ node test/widget-shrink-fail-2.js
  //     if (!el.detached) {
  //       const lpos = el.calcCoord(false, true)
  //       if (lpos) { return Math.max(current, el.relT + (lpos.yHi - lpos.yLo)) }
  //     }
  //     return Math.max(current, el.relT + el.height)
  //   }, 0)
  //   // XXX Use this? Makes .scrollHeight useless!
  //   // if (bottom < this.contLines.length) bottom = this.contLines.length;
  //   if (this.lpos) this.lpos._scrollBottom = bottom
  //   return bottom
  // }
  // setScroll(offset, always) {
  //   // XXX
  //   // At first, this appeared to account for the first new calculation of subBase:
  //   this.scroll(0)
  //   return this.scroll(offset - (this.subBase + this.subOffset), always)
  // }
  // scrollTo(offset, always) {
  //   // XXX
  //   // At first, this appeared to account for the first new calculation of subBase:
  //   this.scroll(0)
  //   return this.scroll(offset - (this.subBase + this.subOffset), always)
  // }
  // getScroll() { return this.subBase + this.subOffset }
  // scroll(offset, always) {
  //   if (!this.scrollable) return
  //   if (this.detached) return
  //   // Handle scrolling.
  //   const visible = this.height - this.intH,
  //         base    = this.subBase
  //   let d,
  //       p,
  //       t,
  //       b,
  //       max,
  //       emax
  //   if (this.alwaysScroll || always) {
  //     // Semi-workaround
  //     this.subOffset = offset > 0
  //       ? visible - 1 + offset
  //       : offset
  //   }
  //   else {
  //     this.subOffset += offset
  //   }
  //   if (this.subOffset > visible - 1) {
  //     d = this.subOffset - (visible - 1)
  //     this.subOffset -= d
  //     this.subBase += d
  //   }
  //   else if (this.subOffset < 0) {
  //     d = this.subOffset
  //     this.subOffset += -d
  //     this.subBase += d
  //   }
  //   if (this.subBase < 0) {
  //     this.subBase = 0
  //   }
  //   else if (this.subBase > this.baseLimit) {
  //     this.subBase = this.baseLimit
  //   }
  //   // Find max "bottom" value for
  //   // content and descendant elements.
  //   // Scroll the content if necessary.
  //   if (this.subBase === base) { return this.emit(SCROLL) }
  //   // When scrolling text, we want to be able to handle SGR codes as well as line
  //   // feeds. This allows us to take preformatted text output from other programs
  //   // and put it in a scrollable text box.
  //   this.parseContent()
  //   // XXX
  //   // max = this.scrollHeight - (this.height - this.intH);
  //   max = this.contLines.length - (this.height - this.intH)
  //   if (max < 0) max = 0
  //   emax = this._scrollBottom() - (this.height - this.intH)
  //   if (emax < 0) emax = 0
  //   this.subBase = Math.min(this.subBase, Math.max(emax, max))
  //   if (this.subBase < 0) { this.subBase = 0 }
  //   else if (this.subBase > this.baseLimit) { this.subBase = this.baseLimit }
  //   // Optimize scrolling with CSR + IL/DL.
  //   p = this.lpos
  //   // Only really need calcCoord() if we want
  //   // to allow nestable scrolling elements...
  //   // or if we **really** want shrinkable
  //   // scrolling elements.
  //   // p = this.calcCoord();
  //   if (p && this.subBase !== base && this.screen.cleanSides(this)) {
  //     t = p.yLo + this.intT
  //     b = p.yHi - this.intB - 1
  //     d = this.subBase - base
  //     // scrolled down
  //     if (d > 0 && d < visible) {
  //       this.screen.deleteLine(d, t, t, b)
  //     }
  //     // scrolled up
  //     else if (d < 0 && -d < visible) {
  //       d = -d
  //       this.screen.insertLine(d, t, t, b)
  //     }
  //   }
  //   return this.emit(SCROLL)
  // }
  // recalcIndex() {
  //   let max, emax
  //   if (this.detached || !this.scrollable) { return 0 }
  //   // XXX
  //   // max = this.scrollHeight - (this.height - this.intH);
  //
  //   max = this.contLines.length - (this.height - this.intH)
  //   if (max < 0) max = 0
  //   emax = this._scrollBottom() - (this.height - this.intH)
  //   if (emax < 0) emax = 0
  //   this.subBase = Math.min(this.subBase, Math.max(emax, max))
  //   if (this.subBase < 0) { this.subBase = 0 }
  //   else if (this.subBase > this.baseLimit) { this.subBase = this.baseLimit }
  // }
  // resetScroll() {
  //   if (!this.scrollable) return
  //   this.subOffset = 0
  //   this.subBase = 0
  //   return this.emit(SCROLL)
  // }
  // scrollHeight { return Math.max(this.contLines.length, this._scrollBottom()) }
  // scrollPercent(s) {
  //   const pos = this.lpos || this.calcCoord()
  //   if (!pos) return s ? -1 : 0
  //   const height = (pos.yHi - pos.yLo) - this.intH,
  //         i      = this.scrollHeight
  //   let p
  //   if (height < i) {
  //     if (this.alwaysScroll) { p = this.subBase / (i - height) }
  //     else { p = (this.subBase + this.subOffset) / (i - 1) }
  //     return p * 100
  //   }
  //   return s ? -1 : 0
  // }
  // scrollPercent = (i) {
  //   // XXX
  //   // var m = this.scrollHeight;
  //   const m = Math.max(this.contLines.length, this._scrollBottom())
  //   return this.scrollTo((i / 100) * m | 0)
  // }
}
