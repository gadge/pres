import { KEYPRESS, MOUSEDOWN, MOUSEUP, PARSED_CONTENT, SCROLL, WHEELDOWN, WHEELUP, } from '@pres/enum-events'
import { DOWN, UP }                                                                  from '@pres/enum-key-names'

/**
 * @extends {Element}
 */
export class Scroll {
  constructor(options = {}, lazy) {
    if (lazy) return this
    this.config(options)
  }
  config(options) {
    console.log('>> [set scroll]', this?.codename)
    const self = this
    // if (options.scrollable === false) return this
    this.scrollable = true
    this.childOffset = 0
    this.childBase = 0
    this.baseLimit = options.baseLimit || Infinity
    this.alwaysScroll = options.alwaysScroll
    this.scrollbar = options.scrollbar
    if (this.scrollbar) {
      this.scrollbar.ch = this.scrollbar.ch || ' '
      this.style.scrollbar = this.style.scrollbar || this.scrollbar.style
      if (!this.style.scrollbar) {
        this.style.scrollbar = {}
        this.style.scrollbar.fg = this.scrollbar.fg
        this.style.scrollbar.bg = this.scrollbar.bg
        this.style.scrollbar.bold = this.scrollbar.bold
        this.style.scrollbar.underline = this.scrollbar.underline
        this.style.scrollbar.inverse = this.scrollbar.inverse
        this.style.scrollbar.invisible = this.scrollbar.invisible
      }
      //this.scrollbar.style = this.style.scrollbar;
      if (this.track || this.scrollbar.track) {
        this.track = this.scrollbar.track || this.track
        this.style.track = this.style.scrollbar.track || this.style.track
        this.track.ch = this.track.ch || ' '
        this.style.track = this.style.track || this.track.style
        if (!this.style.track) {
          this.style.track = {}
          this.style.track.fg = this.track.fg
          this.style.track.bg = this.track.bg
          this.style.track.bold = this.track.bold
          this.style.track.underline = this.track.underline
          this.style.track.inverse = this.track.inverse
          this.style.track.invisible = this.track.invisible
        }
        this.track.style = this.style.track
      }
      // Allow controlling of the scrollbar via the mouse:
      if (options.mouse) {
        this.on(MOUSEDOWN, data => {
          if (self._scrollingBar) {
            // Do not allow dragging on the scrollbar:
            delete self.screen._dragging
            delete self._drag
            return
          }
          const x = data.x - self.absL
          const y = data.y - self.absT
          if (x === self.width - self.intR - 1) {
            // Do not allow dragging on the scrollbar:
            delete self.screen._dragging
            delete self._drag
            const perc = ( y - self.intT ) / ( self.height - self.intH )
            self.setScrollPerc(perc * 100 | 0)
            self.screen.render()
            let smd, smu
            self._scrollingBar = true
            self.onScreenEvent(MOUSEDOWN, smd = data => {
              const y = data.y - self.absT
              const perc = y / self.height
              self.setScrollPerc(perc * 100 | 0)
              self.screen.render()
            })
            // If mouseup occurs out of the window, no mouseup event fires, and
            // scrollbar will drag again on mousedown until another mouseup
            // occurs.
            self.onScreenEvent(MOUSEUP, smu = () => {
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
        self.scroll(-( self.height / 2 | 0 ) || -1)
        self.screen.render()
      })
    }
    if (options.keys && !options.ignoreKeys) {
      this.on(KEYPRESS, (ch, key) => {
        const { ctrl, name, shift } = key, { vi } = options
        if (name === UP || ( vi && name === 'k' )) return void ( self.scroll(-1), self.screen.render() )
        if (name === DOWN || ( vi && name === 'j' )) return void ( self.scroll(1), self.screen.render() )
        if (vi && name === 'u' && ctrl) return void ( self.scroll(-( self.height / 2 | 0 ) || -1), self.screen.render() )
        if (vi && name === 'd' && ctrl) return void ( self.scroll(self.height / 2 | 0 || 1), self.screen.render() )
        if (vi && name === 'b' && ctrl) return void ( self.scroll(-self.height || -1), self.screen.render() )
        if (vi && name === 'f' && ctrl) return void ( self.scroll(self.height || 1), self.screen.render() )
        if (vi && name === 'g' && !shift) return void ( self.scrollTo(0), self.screen.render() )
        if (vi && name === 'g' && shift) return void ( self.scrollTo(self.getScrollHeight()), self.screen.render() )
      })
    }
    this.on(PARSED_CONTENT, () => self._recalculateIndex())
    self._recalculateIndex()
  }
  get reallyScrollable() {
    // XXX Potentially use this in place of scrollable checks elsewhere.
    if (this.shrink) return this.scrollable
    return this.getScrollHeight() > this.height
  }
  _scrollBottom() {
    if (!this.scrollable) return 0
    // We could just calculate the sub, but we can
    // optimize for lists by just returning the items.length.
    if (this._isList) return this.items ? this.items.length : 0
    if (this.prevPos && this.prevPos._scrollBottom) return this.prevPos._scrollBottom
    const bottom = this.sub.reduce((current, el) => {
      // el.height alone does not calculate the shrunken height, we need to use
      // getCoords. A shrunken box inside a scrollable element will not grow any
      // larger than the scrollable element's context regardless of how much
      // content is in the shrunken box, unless we do this (call getCoords
      // without the scrollable calculation):
      // See: $ node test/widget-shrink-fail-2.js
      if (!el.detached) {
        const prevPos = el.calcCoords(false, true)
        if (prevPos) return Math.max(current, el.relT + ( prevPos.yHi - prevPos.yLo ))
      }
      return Math.max(current, el.relT + el.height)
    }, 0)
    // XXX Use this? Makes .getScrollHeight() useless!
    // if (bottom < this._clines.length) bottom = this._clines.length;
    if (this.prevPos) this.prevPos._scrollBottom = bottom
    return bottom
  }
  setScroll(offset, always) { return this.scrollTo(offset, always) }
  scrollTo(offset, always) {
    // XXX
    // At first, this appeared to account for the first new calculation of childBase:
    this.scroll(0)
    return this.scroll(offset - ( this.childBase + this.childOffset ), always)
  }
  getScroll() {
    return this.childBase + this.childOffset
  }
  scroll(offset, always) {
    if (!this.scrollable) return
    if (this.detached) return
    // Handle scrolling.
    const visible = this.height - this.intH,
          base    = this.childBase
    let d,
        p,
        t,
        b,
        max,
        emax
    if (this.alwaysScroll || always) { // Semi-workaround
      this.childOffset = offset > 0 ? visible - 1 + offset : offset
    }
    else {
      this.childOffset += offset
    }
    if (this.childOffset > visible - 1) {
      d = this.childOffset - ( visible - 1 )
      this.childOffset -= d
      this.childBase += d
    }
    else if (this.childOffset < 0) {
      d = this.childOffset
      this.childOffset += -d
      this.childBase += d
    }
    this.childBase = this.childBase < 0 ? 0 : this.childBase > this.baseLimit ? this.baseLimit : this.childBase
    // Find max "bottom" value for
    // content and descendant elements.
    // Scroll the content if necessary.
    if (this.childBase === base) return this.emit(SCROLL)
    // When scrolling text, we want to be able to handle SGR codes as well as line
    // feeds. This allows us to take preformatted text output from other programs
    // and put it in a scrollable text box.
    this.parseContent()
    // XXX
    // max = this.getScrollHeight() - (this.height - this.intH);

    max = this._clines.length - ( this.height - this.intH )
    if (max < 0) max = 0
    emax = this._scrollBottom() - ( this.height - this.intH )
    if (emax < 0) emax = 0
    this.childBase = Math.min(this.childBase, Math.max(emax, max))
    this.childBase = this.childBase < 0 ? 0 : this.childBase > this.baseLimit ? this.baseLimit : this.childBase
    // Optimize scrolling with CSR + IL/DL.
    p = this.prevPos
    // Only really need calcCoords() if we want
    // to allow nestable scrolling elements...
    // or if we **really** want shrinkable
    // scrolling elements.
    // p = this.calcCoords();
    if (p && this.childBase !== base && this.screen.cleanSides(this)) {
      t = p.yLo + this.intT
      b = p.yHi - this.intB - 1
      d = this.childBase - base
      if (d > 0 && d < visible) {
        this.screen.deleteLine(d, t, t, b)  // scrolled down
      }
      else if (d < 0 && -d < visible) {
        d = -d
        this.screen.insertLine(d, t, t, b)  // scrolled up
      }
    }
    return this.emit(SCROLL)
  }
  _recalculateIndex() {
    let max, emax
    if (this.detached || !this.scrollable) return 0
    // XXX
    // max = this.getScrollHeight() - (this.height - this.intH);
    max = this._clines.length - ( this.height - this.intH )
    if (max < 0) max = 0
    emax = this._scrollBottom() - ( this.height - this.intH )
    if (emax < 0) emax = 0
    this.childBase = Math.min(this.childBase, Math.max(emax, max))
    this.childBase = this.childBase < 0 ? 0 : this.childBase > this.baseLimit ? this.baseLimit : this.childBase
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
    const pos = this.prevPos || this.calcCoords()
    if (!pos) return s ? -1 : 0
    const height = ( pos.yHi - pos.yLo ) - this.intH,
          i      = this.getScrollHeight()
    let p
    if (height < i) {
      if (this.alwaysScroll) {
        p = this.childBase / ( i - height )
      }
      else {
        p = ( this.childBase + this.childOffset ) / ( i - 1 )
      }
      return p * 100
    }
    return s ? -1 : 0
  }
  setScrollPerc(i) {
    // XXX
    // var m = this.getScrollHeight();
    const m = Math.max(this._clines.length, this._scrollBottom())
    return this.scrollTo(( i / 100 ) * m | 0)
  }
}