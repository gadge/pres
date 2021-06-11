/**
 * element.js - base element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Node }                                     from '@pres/components-node'
import { ESC, LF, TAB }                             from '@pres/enum-control-chars'
import {
  ATTACH, CLICK, DETACH, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEMOVE, MOUSEOUT, MOUSEOVER, MOUSEUP, MOUSEWHEEL,
  MOVE, NEW_LISTENER, PARSED_CONTENT, PRERENDER, RENDER, RESIZE, SCROLL, SET_CONTENT, SHOW, WHEELDOWN, WHEELUP,
}                                                   from '@pres/enum-events'
import { BOTTOM, CENTER, LEFT, MIDDLE, RIGHT, TOP } from '@pres/enum-key-names'
import * as colors                                  from '@pres/util-blessed-colors'
import * as helpers                                 from '@pres/util-helpers'
import { sgraToAttr, styleToAttr }                  from '@pres/util-sgr-attr'
import * as unicode                                 from '@pres/util-unicode'
import { SP }                                       from '@texting/enum-chars'
import { FUN, STR }                                 from '@typen/enum-data-types'
import { nullish }                                  from '@typen/nullish'
import { last }                                     from '@vect/vector-index'
import assert                                       from 'assert'
import { Cadre }                                    from '../utils/Cadre'
import { parsePercent }                             from '../utils/parsePercent'
import { Box }                                      from './box'

const nextTick = global.setImmediate || process.nextTick.bind(process)

export class Element extends Node {
  type = 'element'
  /**
   * Element
   */
  constructor(options = {}, lazy) {
    options.sku = options.sku ?? 'element'
    super(options)
    if (lazy) return this
    Element.prototype.config.call(this, options)
  }
  static build(options) { return new Element(options) }
  config(options) {
    const self = this
    this.type = this.type ?? 'element'
    // console.log('>> [Element.prototype.config]', this.codename)
    this.noOverflow = options.noOverflow
    this.dockBorders = options.dockBorders
    this.shadow = options.shadow
    this.style = options.style ?? {
      fg: options.fg,
      bg: options.bg,
      bold: options.bold,
      underline: options.underline,
      blink: options.blink,
      inverse: options.inverse,
      invisible: options.invisible,
      transparent: options.transparent,
    }
    this.hidden = options.hidden || false
    this.fixed = options.fixed || false
    this.align = options.align || LEFT
    this.valign = options.valign || TOP
    this.wrap = options.wrap !== false
    this.shrink = options.shrink
    this.fixed = options.fixed
    this.ch = options.ch || ' '

    const position = this.position = ( options.position ?? ( options.position = {
      left: options.left,
      right: options.right,
      top: options.top,
      bottom: options.bottom,
      width: options.width,
      height: options.height
    } ) )
    if (position.width === 'shrink' || position.height === 'shrink') {
      if (position.width === 'shrink') delete position.width
      if (position.height === 'shrink') delete position.height
      options.shrink = true
    }
    // this.position = position
    this.padding = Cadre.build(options.padding)
    this.border = options.border
    if (this.border) {
      if (typeof this.border === STR) this.border = { type: this.border }
      this.border.type = this.border.type || 'bg'
      if (this.border.type === 'ascii') this.border.type = 'line'
      this.border.ch = this.border.ch || ' '
      this.style.border = this.style.border || this.border.style
      if (!this.style.border) {
        this.style.border = {}
        this.style.border.fg = this.border.fg
        this.style.border.bg = this.border.bg
      }
      //this.border.style = this.style.border;
      if (this.border.left == null) this.border.left = true
      if (this.border.top == null) this.border.top = true
      if (this.border.right == null) this.border.right = true
      if (this.border.bottom == null) this.border.bottom = true
    }
    // if (options.mouse || options.clickable) {
    if (options.clickable) { this.screen._listenMouse(this) }
    if (options.input || options.keyable) { this.screen._listenKeys(this) }
    this.parseTags = options.parseTags || options.tags
    this.setContent(options.content || '', true)
    if (options.label) { this.setLabel(options.label) }
    if (options.hoverText) { this.setHover(options.hoverText) }
    // TODO: Possibly move this to Node for onScreenEvent(MOUSE, ...).
    this.on(NEW_LISTENER, (type) => {
      // type = type.split(' ').slice(1).join(' ');
      if (
        type === CLICK || type === MOUSE || type === MOUSEDOWN || type === MOUSEUP ||
        type === MOUSEMOVE || type === MOUSEOVER || type === MOUSEOUT || type === MOUSEWHEEL ||
        type === WHEELDOWN || type === WHEELUP
      ) { self.screen._listenMouse(self) }
      else if (type === KEYPRESS || type.indexOf(KEY + SP) === 0) { self.screen._listenKeys(self) }
    })
    this.on(RESIZE, () => self.parseContent())
    this.on(ATTACH, () => self.parseContent())
    this.on(DETACH, () => delete self.lpos)
    if (options.hoverBg != null) {
      options.hoverEffects = options.hoverEffects || {}
      options.hoverEffects.bg = options.hoverBg
    }
    if (this.style.hover) { options.hoverEffects = this.style.hover }
    if (this.style.focus) { options.focusEffects = this.style.focus }
    if (options.effects) {
      if (options.effects.hover) options.hoverEffects = options.effects.hover
      if (options.effects.focus) options.focusEffects = options.effects.focus
    }
    const EVENT_LIST_COLLECTION = [
      [ 'hoverEffects', 'mouseover', 'mouseout', '_htemp' ],
      [ 'focusEffects', 'focus', 'blur', '_ftemp' ]
    ]
    EVENT_LIST_COLLECTION.forEach(props => {
      const [ pname, over, out, temp ] = props
      self.screen.setEffects(self, self, over, out, self.options[pname], temp)
    })
    if (this.options.draggable) { this.draggable = true }
    if (options.focused) this.focus()
  }
  get focused() { return this.screen.focused === this}
  get visible() {
    let el = this
    do {
      if (el.detached) return false
      if (el.hidden) return false
      // if (!el.lpos) return false;
      // if (el.position.width === 0 || el.position.height === 0) return false;
    } while (( el = el.sup ))
    return true
  }
  get _detached() {
    let el = this
    do {
      if (el.type === 'screen') return false
      if (!el.sup) return true
    } while (( el = el.sup ))
    return false
  }
  get draggable() { return this._draggable === true }
  set draggable(draggable) { return draggable ? this.enableDrag(draggable) : this.disableDrag() }

  /**
   * Positioning
   */
  /**
   * Position Getters and Setters
   */
  // NOTE:
  // For absR, absB, right, and bottom:
  // If position.bottom is null, we could simply set top instead.
  // But it wouldn't replicate bottom behavior appropriately if
  // the sup was resized, etc.

  get width() { return this.calcW(false) }
  get height() { return this.calcH(false) }

  set width(val) {
    if (this.position.width === val) return
    if (/^\d+$/.test(val)) val = +val
    this.emit(RESIZE)
    this.clearPos()
    return this.position.width = val
  }
  set height(val) {
    if (this.position.height === val) return
    if (/^\d+$/.test(val)) val = +val
    this.emit(RESIZE)
    this.clearPos()
    return this.position.height = val
  }

  get absT() { return this.calcT(false) }
  get absB() { return this.calcB(false) }
  get absL() { return this.calcL(false) }
  get absR() { return this.calcR(false) }

  get relT() { return this.absT - this.sup.absT }
  get relB() { return this.absB - this.sup.absB }
  get relL() { return this.absL - this.sup.absL }
  get relR() { return this.absR - this.sup.absR }

  get intT() { return ( this.border ? 1 : 0 ) + this.padding.top }
  get intB() { return ( this.border ? 1 : 0 ) + this.padding.bottom }
  get intL() { return ( this.border ? 1 : 0 ) + this.padding.left }
  get intR() { return ( this.border ? 1 : 0 ) + this.padding.right }

  get intH() { return ( this.border ? 2 : 0 ) + this.padding.top + this.padding.bottom }
  get intW() { return ( this.border ? 2 : 0 ) + this.padding.left + this.padding.right }

  set absT(val) {
    let expr
    if (typeof val === STR) {
      if (val === CENTER) {
        val = this.screen.height / 2 | 0
        val -= this.height / 2 | 0
      }
      else {
        expr = val.split(/(?=\+|-)/)
        val = expr[0]
        val = +val.slice(0, -1) / 100
        val = this.screen.height * val | 0
        val += +( expr[1] || 0 )
      }
    }
    val -= this.sup.absT
    if (this.position.top === val) return
    this.emit(MOVE)
    this.clearPos()
    return this.position.top = val
  }
  set absB(val) {
    val -= this.sup.absB
    if (this.position.bottom === val) return
    this.emit(MOVE)
    this.clearPos()
    return this.position.bottom = val
  }
  set absL(val) {
    let expr
    if (typeof val === STR) {
      if (val === CENTER) {
        val = this.screen.width / 2 | 0
        val -= this.width / 2 | 0
      }
      else {
        expr = val.split(/(?=\+|-)/)
        val = expr[0]
        val = +val.slice(0, -1) / 100
        val = this.screen.width * val | 0
        val += +( expr[1] || 0 )
      }
    }
    val -= this.sup.absL
    if (this.position.left === val) return
    this.emit(MOVE)
    this.clearPos()
    return this.position.left = val
  }
  set absR(val) {
    val -= this.sup.absR
    if (this.position.right === val) return
    this.emit(MOVE)
    this.clearPos()
    return this.position.right = val
  }

  set relT(val) {
    if (this.position.top === val) return
    if (/^\d+$/.test(val)) val = +val
    this.emit(MOVE)
    this.clearPos()
    return this.position.top = val
  }
  set relB(val) {
    if (this.position.bottom === val) return
    this.emit(MOVE)
    this.clearPos()
    return this.position.bottom = val
  }
  set relL(val) {
    if (this.position.left === val) return
    if (/^\d+$/.test(val)) val = +val
    this.emit(MOVE)
    this.clearPos()
    return this.position.left = val
  }
  set relR(val) {
    if (this.position.right === val) return
    this.emit(MOVE)
    this.clearPos()
    return this.position.right = val
  }

  get paddingSum() { return this.padding.left + this.padding.top + this.padding.right + this.padding.bottom }

  /**
   * Position Getters
   */
  calcPos() {
    const pos = this.lpos
    assert.ok(pos)
    if (pos.absL != null) return pos
    pos.absL = pos.xi
    pos.absT = pos.yi
    pos.absR = this.screen.cols - pos.xl
    pos.absB = this.screen.rows - pos.yl
    pos.width = pos.xl - pos.xi
    pos.height = pos.yl - pos.yi
    return pos
  }

  calcT(get) {
    const sup = get ? this.sup.calcPos() : this.sup
    /** @type {string|number} */ let top = this.position.top || 0
    if (typeof top === STR) {
      if (top === CENTER) top = '50%'
      top = parsePercent(top, sup.height)
      if (this.position.top === CENTER) top -= this.calcH(get) / 2 | 0
    }
    if (this.position.top == null && this.position.bottom != null) {
      return this.screen.rows - this.calcH(get) - this.calcB(get)
    }
    if (this.screen.autoPadding) {
      if (( this.position.top != null || this.position.bottom == null ) && this.position.top !== CENTER) {
        top += this.sup.intT
      }
    }
    return ( sup.absT || 0 ) + top
  }
  calcB(get) {
    const sup = get ? this.sup.calcPos() : this.sup
    let bottom
    if (this.position.bottom == null && this.position.top != null) {
      bottom = this.screen.rows - ( this.calcT(get) + this.calcH(get) )
      if (this.screen.autoPadding) bottom += this.sup.intB
      return bottom
    }
    bottom = ( sup.absB || 0 ) + ( this.position.bottom || 0 )
    if (this.screen.autoPadding) bottom += this.sup.intB
    return bottom
  }
  calcL(get) {
    const sup = get ? this.sup.calcPos() : this.sup
    let left = this.position.left || 0,
        expr
    if (typeof left === STR) {
      if (left === CENTER) left = '50%'
      expr = left.split(/(?=\+|-)/)
      left = expr[0]
      left = +left.slice(0, -1) / 100
      left = sup.width * left | 0
      left += +( expr[1] || 0 )
      if (this.position.left === CENTER) {
        left -= this.calcW(get) / 2 | 0
      }
    }
    if (this.position.left == null && this.position.right != null) {
      return this.screen.cols - this.calcW(get) - this.calcR(get)
    }
    if (this.screen.autoPadding) {
      if (( this.position.left != null ||
        this.position.right == null ) &&
        this.position.left !== CENTER) {
        left += this.sup.intL
      }
    }
    return ( sup.absL || 0 ) + left
  }
  calcR(get) {
    const sup = get ? this.sup.calcPos() : this.sup
    let right
    if (this.position.right == null && this.position.left != null) {
      right = this.screen.cols - ( this.calcL(get) + this.calcW(get) )
      if (this.screen.autoPadding) right += this.sup.intR
      return right
    }
    right = ( sup.absR || 0 ) + ( this.position.right || 0 )
    if (this.screen.autoPadding) right += this.sup.intR
    return right
  }
  calcW(get) {
    const sup = get ? this.sup.calcPos() : this.sup
    let width = this.position.width,
        left,
        expr
    if (typeof width === STR) {
      if (width === 'half') width = '50%'
      expr = width.split(/(?=\+|-)/)
      width = expr[0]
      width = +width.slice(0, -1) / 100
      width = sup.width * width | 0
      width += +( expr[1] || 0 )
      return width
    }
    // This is for if the element is being streched or shrunken.
    // Although the width for shrunken elements is calculated
    // in the render function, it may be calculated based on
    // the content width, and the content width is initially
    // decided by the width the element, so it needs to be
    // calculated here.
    if (width == null) {
      left = this.position.left || 0
      if (typeof left === STR) {
        if (left === CENTER) left = '50%'
        expr = left.split(/(?=\+|-)/)
        left = expr[0]
        left = +left.slice(0, -1) / 100
        left = sup.width * left | 0
        left += +( expr[1] || 0 )
      }
      width = sup.width - ( this.position.right || 0 ) - left
      if (this.screen.autoPadding) {
        if (( this.position.left != null || this.position.right == null ) &&
          this.position.left !== CENTER) {
          width -= this.sup.intL
        }
        width -= this.sup.intR
      }
    }
    return width
  }
  calcH(get) {
    const sup = get ? this.sup.calcPos() : this.sup
    let height = this.position.height,
        top,
        expr
    if (typeof height === STR) {
      if (height === 'half') height = '50%'
      expr = height.split(/(?=\+|-)/)
      height = expr[0]
      height = +height.slice(0, -1) / 100
      height = sup.height * height | 0
      height += +( expr[1] || 0 )
      return height
    }
    // This is for if the element is being streched or shrunken.
    // Although the width for shrunken elements is calculated
    // in the render function, it may be calculated based on
    // the content width, and the content width is initially
    // decided by the width the element, so it needs to be
    // calculated here.
    if (height == null) {
      top = this.position.top || 0
      if (typeof top === STR) {
        if (top === CENTER) top = '50%'
        expr = top.split(/(?=\+|-)/)
        top = expr[0]
        top = +top.slice(0, -1) / 100
        top = sup.height * top | 0
        top += +( expr[1] || 0 )
      }
      height = sup.height - ( this.position.bottom || 0 ) - top
      if (this.screen.autoPadding) {
        if (( this.position.top != null ||
          this.position.bottom == null ) &&
          this.position.top !== CENTER) {
          height -= this.sup.intT
        }
        height -= this.sup.intB
      }
    }
    return height
  }

  calcShrinkBox(xi, xl, yi, yl, get) {
    if (!this.sub.length) return { xi: xi, xl: xi + 1, yi: yi, yl: yi + 1 }
    let i, el, ret, mxi = xi, mxl = xi + 1, myi = yi, myl = yi + 1
    // This is a chicken and egg problem. We need to determine how the sub
    // will render in order to determine how this element renders, but it in
    // order to figure out how the sub will render, they need to know
    // exactly how their sup renders, so, we can give them what we have so
    // far.
    let _lpos
    if (get) {
      _lpos = this.lpos
      this.lpos = { xi: xi, xl: xl, yi: yi, yl: yl }
      //this.shrink = false;
    }
    for (i = 0; i < this.sub.length; i++) {
      el = this.sub[i]

      ret = el.calcCoords(get)
      // Or just (seemed to work, but probably not good):
      // ret = el.lpos || this.lpos;
      if (!ret) continue
      // Since the sup element is shrunk, and the child elements think it's
      // going to take up as much space as possible, an element anchored to the
      // right or bottom will inadvertantly make the sup's shrunken size as
      // large as possible. So, we can just use the height and/or width the of
      // element.
      // if (get) {
      if (el.position.left == null && el.position.right != null) {
        ret.xl = xi + ( ret.xl - ret.xi )
        ret.xi = xi
        if (this.screen.autoPadding) {
          // Maybe just do this no matter what.
          ret.xl += this.intL
          ret.xi += this.intL
        }
      }
      if (el.position.top == null && el.position.bottom != null) {
        ret.yl = yi + ( ret.yl - ret.yi )
        ret.yi = yi
        if (this.screen.autoPadding) {
          // Maybe just do this no matter what.
          ret.yl += this.intT
          ret.yi += this.intT
        }
      }
      if (ret.xi < mxi) mxi = ret.xi
      if (ret.xl > mxl) mxl = ret.xl
      if (ret.yi < myi) myi = ret.yi
      if (ret.yl > myl) myl = ret.yl
    }
    if (get) {
      this.lpos = _lpos
      //this.shrink = true;
    }
    if (
      ( this.position.width == null ) &&
      ( this.position.left == null || this.position.right == null )
    ) {
      if (this.position.left == null && this.position.right != null) {
        xi = xl - ( mxl - mxi )
        xi -= !this.screen.autoPadding ? this.padding.left + this.padding.right : this.intL
      }
      else {
        xl = mxl
        if (!this.screen.autoPadding) {
          xl += this.padding.left + this.padding.right
          // XXX Temporary workaround until we decide to make autoPadding default.
          // See widget-listtable.js for an example of why this is necessary.
          // XXX Maybe just to this for all this being that this would affect
          // width shrunken normal shrunken lists as well.
          // if (this._isList) {
          if (this.type === 'list-table') {
            xl -= this.padding.left + this.padding.right
            xl += this.intR
          }
        }
        else {
          //xl += this.padding.right;
          xl += this.intR
        }
      }
    }
    if (
      ( this.position.height == null ) &&
      ( this.position.top == null || this.position.bottom == null ) &&
      ( !this.scrollable || this._isList )
    ) {
      // NOTE: Lists get special treatment if they are shrunken - assume they
      // want all list items showing. This is one case we can calculate the
      // height based on items/boxes.
      if (this._isList) {
        myi = 0 - this.intT
        myl = this.items.length + this.intB
      }
      if (this.position.top == null && this.position.bottom != null) {
        yi = yl - ( myl - myi )
        yi -= !this.screen.autoPadding ? this.padding.top + this.padding.bottom : this.intT
      }
      else {
        yl = myl
        yl += !this.screen.autoPadding ? this.padding.top + this.padding.bottom : this.intB
      }
    }
    return { xi: xi, xl: xl, yi: yi, yl: yl }
  }
  calcShrinkContent(xi, xl, yi, yl) {
    const h = this.contLines.length,
          w = this.contLines.mwidth || 1
    if (
      ( this.position.width == null ) &&
      ( this.position.left == null || this.position.right == null )
    ) {
      if (this.position.left == null && this.position.right != null) { xi = xl - w - this.intW }
      else { xl = xi + w + this.intW }
    }
    if (
      ( this.position.height == null ) &&
      ( this.position.top == null || this.position.bottom == null ) &&
      ( !this.scrollable || this._isList )
    ) {
      if (this.position.top == null && this.position.bottom != null) { yi = yl - h - this.intH }
      else { yl = yi + h + this.intH }
    }
    return { xi: xi, xl: xl, yi: yi, yl: yl }
  }
  calcShrink(xi, xl, yi, yl, get) {
    const shrinkBox     = this.calcShrinkBox(xi, xl, yi, yl, get),
          shrinkContent = this.calcShrinkContent(xi, xl, yi, yl, get)
    let xll = xl, yll = yl
    // Figure out which one is bigger and use it.
    if (shrinkBox.xl - shrinkBox.xi > shrinkContent.xl - shrinkContent.xi) { xi = shrinkBox.xi, xl = shrinkBox.xl }
    else { xi = shrinkContent.xi, xl = shrinkContent.xl }
    if (shrinkBox.yl - shrinkBox.yi > shrinkContent.yl - shrinkContent.yi) { yi = shrinkBox.yi, yl = shrinkBox.yl }
    else { yi = shrinkContent.yi, yl = shrinkContent.yl }
    // Recenter shrunken elements.
    if (xl < xll && this.position.left === CENTER) {
      xll = ( xll - xl ) / 2 | 0
      xi += xll
      xl += xll
    }
    if (yl < yll && this.position.top === CENTER) {
      yll = ( yll - yl ) / 2 | 0
      yi += yll
      yl += yll
    }
    return { xi: xi, xl: xl, yi: yi, yl: yl }
  }
  calcCoords(get, noscroll) {
    if (this.hidden) return
    // if (this.sup._rendering) {
    //   get = true;
    // }
    let xi    = this.calcL(get),
        xl    = xi + this.calcW(get),
        yi    = this.calcT(get),
        yl    = yi + this.calcH(get),
        base  = this.childBase || 0,
        el    = this,
        fixed = this.fixed,
        coords,
        v,
        noleft,
        noright,
        notop,
        nobot,
        ppos,
        b
    // Attempt to shrink the element base on the
    // size of the content and child elements.
    if (this.shrink) {
      coords = this.calcShrink(xi, xl, yi, yl, get)
      xi = coords.xi, xl = coords.xl
      yi = coords.yi, yl = coords.yl
    }
    // Find a scrollable ancestor if we have one.
    while (( el = el.sup )) {
      if (el.scrollable) {
        if (fixed) {
          fixed = false
          continue
        }
        break
      }
    }
    // Check to make sure we're visible and
    // inside of the visible scroll area.
    // NOTE: Lists have a property where only
    // the list items are obfuscated.
    // Old way of doing things, this would not render right if a shrunken element
    // with lots of boxes in it was within a scrollable element.
    // See: $ node test/widget-shrink-fail.js
    // var thisparent = this.sup;
    const thisparent = el
    if (el && !noscroll) {
      ppos = thisparent.lpos
      // The shrink option can cause a stack overflow
      // by calling calcCoords on the child again.
      // if (!get && !thisparent.shrink) {
      //   ppos = thisparent.calcCoords();
      // }
      if (!ppos) return
      // TODO: Figure out how to fix base (and cbase to only
      // take into account the *sup's* padding.

      yi -= ppos.base
      yl -= ppos.base

      b = thisparent.border ? 1 : 0
      // XXX
      // Fixes non-`fixed` labels to work with scrolling (they're ON the border):
      // if (this.position.left < 0
      //     || this.position.right < 0
      //     || this.position.top < 0
      //     || this.position.bottom < 0) {
      if (this._isLabel) {
        b = 0
      }
      if (yi < ppos.yi + b) {
        if (yl - 1 < ppos.yi + b) {
          // Is above.
          return
        }
        else {
          // Is partially covered above.
          notop = true
          v = ppos.yi - yi
          if (this.border) v--
          if (thisparent.border) v++
          base += v
          yi += v
        }
      }
      else if (yl > ppos.yl - b) {
        if (yi > ppos.yl - 1 - b) {
          // Is below.
          return
        }
        else {
          // Is partially covered below.
          nobot = true
          v = yl - ppos.yl
          if (this.border) v--
          if (thisparent.border) v++
          yl -= v
        }
      }
      // Shouldn't be necessary.
      // assert.ok(yi < yl);
      if (yi >= yl) return
      // Could allow overlapping stuff in scrolling elements
      // if we cleared the pending buffer before every draw.
      if (xi < el.lpos.xi) {
        xi = el.lpos.xi
        noleft = true
        if (this.border) xi--
        if (thisparent.border) xi++
      }
      if (xl > el.lpos.xl) {
        xl = el.lpos.xl
        noright = true
        if (this.border) xl++
        if (thisparent.border) xl--
      }
      //if (xi > xl) return;
      if (xi >= xl) return
    }
    if (this.noOverflow && this.sup.lpos) {
      if (xi < this.sup.lpos.xi + this.sup.intL) { xi = this.sup.lpos.xi + this.sup.intL }
      if (xl > this.sup.lpos.xl - this.sup.intR) { xl = this.sup.lpos.xl - this.sup.intR }
      if (yi < this.sup.lpos.yi + this.sup.intT) { yi = this.sup.lpos.yi + this.sup.intT }
      if (yl > this.sup.lpos.yl - this.sup.intB) { yl = this.sup.lpos.yl - this.sup.intB }
    }
    // if (this.sup.lpos) {
    //   this.sup.lpos._scrollBottom = Math.max(
    //     this.sup.lpos._scrollBottom, yl);
    // }
    return {
      xi: xi,
      xl: xl,
      yi: yi,
      yl: yl,
      base: base,
      noleft: noleft,
      noright: noright,
      notop: notop,
      nobot: nobot,
      renders: this.screen.renders
    }
  }

  clearPos(get, override) {
    if (this.detached) return
    const coord = this.calcCoords(get)
    if (!coord) return
    this.screen.clearRegion(
      coord.xi, coord.xl,
      coord.yi, coord.yl,
      override)
  }

  /**
   * Relative coordinates as default properties
   */
  get left() { return this.relL }
  set left(val) { return this.relL = val }
  get right() { return this.relR }
  set right(val) { return this.relR = val }
  get top() { return this.relT }
  set top(val) { return this.relT = val }
  get bottom() { return this.relB }
  set bottom(val) { return this.relB = val }

  sattr(style, fg, bg) { return styleToAttr(style, fg, bg) }
  // Convert `{red-fg}foo{/red-fg}` to `\x1b[31mfoo\x1b[39m`.
  get _clines() { return this.contLines }
  parseContent(noTags) {
    if (this.detached) return false
    const width = this.width - this.intW
    if (this.contLines == null || this.contLines.width !== width || this.contLines.content !== this.content) {
      let content = this.content
      content = content
        .replace(/[\x00-\x08\x0b-\x0c\x0e-\x1a\x1c-\x1f\x7f]/g, '')
        .replace(/\x1b(?!\[[\d;]*m)/g, '')
        .replace(/\r\n|\r/g, LF)
        .replace(/\t/g, this.screen.tabc)
      if (this.screen.fullUnicode) {
        // double-width chars will eat the next char after render. create a
        // blank character after it so it doesn't eat the real next char.
        content = content.replace(unicode.chars.all, '$1\x03')
        // iTerm2 cannot render combining characters properly.
        if (this.screen.program.isiTerm2) content = content.replace(unicode.chars.combining, '')
      }
      else {
        // no double-width: replace them with question-marks.
        content = content.replace(unicode.chars.all, '??')
        // delete combining characters since they're 0-width anyway.
        // NOTE: We could drop this, the non-surrogates would get changed to ? by
        // the unicode filter, and surrogates changed to ? by the surrogate
        // regex. however, the user might expect them to be 0-width.
        // NOTE: Might be better for performance to drop!
        content = content.replace(unicode.chars.combining, '')
        // no surrogate pairs: replace them with question-marks.
        content = content.replace(unicode.chars.surrogate, '?')
        // XXX Deduplicate code here:
        // content = helpers.dropUnicode(content);
      }
      if (!noTags) { content = this.#parseTags(content) }
      this.contLines = this.#wrapContent(content, width)
      // console.log(`>> [{${ this.codename }}.contLines]`, this.contLines)
      this.contLines.width = width
      this.contLines.content = this.content
      this.contLines.attr = this.#parseAttr(this.contLines)
      this.contLines.ci = []
      this.contLines.reduce(function (total, line) {
        this.contLines.ci.push(total)
        return total + line.length + 1
      }.bind(this), 0)
      this._pcontent = this.contLines.join(LF)
      this.emit(PARSED_CONTENT)
      return true
    }
    // Need to calculate this every time because the default fg/bg may change.
    this.contLines.attr = this.#parseAttr(this.contLines) || this.contLines.attr
    return false
  }
  #wrapContent(content, width) {
    const tags = this.parseTags
    let state = this.align
    const wrap = this.wrap
    let margin = 0
    const rtof = [],
          ftor = [],
          out  = []
    let no = 0,
        line,
        align,
        total,
        i,
        part,
        j,
        lines,
        rest

    lines = content.split(LF)
    if (!content) {
      out.push(content)
      out.rtof = [ 0 ]
      out.ftor = [ [ 0 ] ]
      out.fake = lines
      out.real = out
      out.mwidth = 0
      return out
    }
    if (this.scrollbar) margin++
    if (this.type === 'textarea') margin++
    if (width > margin) width -= margin

    let matches, phrase, word
    main:
      for (; no < lines.length; no++) {
        line = lines[no]
        align = state

        ftor.push([])
        // Handle alignment tags.
        if (tags) {
          if (( matches = /^{(left|center|right)}/.exec(line) ) && ( [ phrase, word ] = matches )) {
            line = line.slice(phrase.length)
            align = state = word !== LEFT ? word : null
          }
          if (( matches = /{\/(left|center|right)}$/.exec(line) ) && ( [ phrase ] = matches )) {
            line = line.slice(0, -phrase.length) //state = null;
            state = this.align
          }
        }
        // If the string is apparently too long, wrap it.
        while (line.length > width) {
          // Measure the real width of the string.
          for (i = 0, total = 0; i < line.length; i++) {
            while (line[i] === ESC) while (line[i] && line[i++] !== 'm') { }
            if (!line[i]) break
            if (++total === width) {
              // If we're not wrapping the text, we have to finish up the rest of
              // the control sequences before cutting off the line.
              i++
              if (!wrap) {
                rest = line.slice(i).match(/\x1b\[[^m]*m/g)
                rest = rest ? rest.join('') : ''
                out.push(this._align(line.slice(0, i) + rest, width, align))
                ftor[no].push(out.length - 1)
                rtof.push(no)
                continue main
              }
              if (!this.screen.fullUnicode) {
                // Try to find a space to break on.
                if (i !== line.length) {
                  j = i
                  while (j > i - 10 && j > 0 && line[--j] !== ' ')
                    if (line[j] === ' ') i = j + 1
                }
              }
              else {
                // Try to find a character to break on.
                if (i !== line.length) {
                  // <XXX>
                  // Compensate for surrogate length counts on wrapping (experimental):
                  // NOTE: Could optimize this by putting it in the sup for loop.
                  if (unicode.isSurrogate(line, i)) i--
                  let s = 0, n = 0
                  for (; n < i; n++) {
                    if (unicode.isSurrogate(line, n)) s++, n++
                  }
                  i += s
                  // </XXX>
                  j = i
                  // Break _past_ space.
                  // Break _past_ double-width chars.
                  // Break _past_ surrogate pairs.
                  // Break _past_ combining chars.
                  while (j > i - 10 && j > 0) {
                    j--
                    if (line[j] === ' ' ||
                      line[j] === '\x03' ||
                      ( unicode.isSurrogate(line, j - 1) && line[j + 1] !== '\x03' ) || unicode.isCombining(line, j)) {
                      break
                    }
                  }
                  if (line[j] === ' ' ||
                    line[j] === '\x03' ||
                    ( unicode.isSurrogate(line, j - 1) && line[j + 1] !== '\x03' ) || unicode.isCombining(line, j)) {
                    i = j + 1
                  }
                }
              }
              break
            }
          }
          part = line.slice(0, i)
          line = line.slice(i)
          out.push(this._align(part, width, align))
          ftor[no].push(out.length - 1)
          rtof.push(no)
          // Make sure we didn't wrap the line to the very end, otherwise we get a pointless empty line after a newline.
          if (line === '') continue main
          // If only an escape code got cut off, at it to `part`.
          if (/^(?:\x1b[\[\d;]*m)+$/.test(line)) {
            out[out.length - 1] += line
            continue main
          }
        }
        out.push(this._align(line, width, align))
        ftor[no].push(out.length - 1)
        rtof.push(no)
      }
    out.rtof = rtof
    out.ftor = ftor
    out.fake = lines
    out.real = out

    out.mwidth = out.reduce((current, line) => {
      line = line.replace(/\x1b\[[\d;]*m/g, '')
      return line.length > current ? line.length : current
    }, 0)
    return out
  }
  #parseTags(text) {
    if (!this.parseTags) return text
    if (!/{\/?[\w\-,;!#]*}/.test(text)) return text
    const program = this.screen.program
    let out = '',
        state
    const bg   = [],
          fg   = [],
          flag = []
    let cap,
        slash,
        param,
        attr,
        esc
    while (true) {
      if (!esc && ( cap = /^{escape}/.exec(text) )) {
        text = text.slice(cap[0].length)
        esc = true
        continue
      }
      if (esc && ( cap = /^([\s\S]+?){\/escape}/.exec(text) )) {
        text = text.slice(cap[0].length)
        out += cap[1]
        esc = false
        continue
      }
      if (esc) {
        // throw new Error('Unterminated escape tag.');
        out += text
        break
      }
      if (( cap = /^{(\/?)([\w\-,;!#]*)}/.exec(text) )) {
        text = text.slice(cap[0].length)
        slash = cap[1] === '/'
        param = cap[2].replace(/-/g, ' ')
        if (param === 'open') {
          out += '{'
          continue
        }
        else if (param === 'close') {
          out += '}'
          continue
        }
        state = param.slice(-3) === ' bg' ? bg : param.slice(-3) === ' fg' ? fg : flag
        // console.log('>> [element.#parseTags]', param, state)
        if (slash) {
          if (!param) {
            out += program.parseAttr('normal')
            bg.length = 0
            fg.length = 0
            flag.length = 0
          }
          else {
            attr = program.parseAttr(param, false)
            if (!nullish(attr)) {
              state.pop()
              out += state.length ? program.parseAttr(last(state)) : attr
            }
            else {
              out += cap[0]
            }
          }
        }
        else {
          if (!param) {
            out += cap[0]
          }
          else {
            attr = program.parseAttr(param)
            if (!nullish(attr)) {
              state.push(param)
              out += attr
            }
            else {
              out += cap[0]
            }
          }
        }
        continue
      }
      if (( cap = /^[\s\S]+?(?={\/?[\w\-,;!#]*})/.exec(text) )) {
        text = text.slice(cap[0].length)
        out += cap[0]
        continue
      }
      out += text
      break
    }
    return out
  }
  #parseAttr(lines) {
    const normAttr = styleToAttr(this.style)
    let baseAttr = normAttr
    const attrList = []
    if (lines[0].attr === baseAttr) return void 0
    for (let j = 0, line; j < lines.length; j++) {
      line = lines[j]
      attrList[j] = baseAttr
      for (let i = 0, matches, sgra; i < line.length; i++) {
        if (line[i] === ESC) {
          if (( matches = /^\x1b\[[\d;]*m/.exec(line.slice(i)) ) && ( [ sgra ] = matches )) {
            baseAttr = sgraToAttr(sgra, baseAttr, normAttr)
            i += sgra.length - 1
          }
        }
      }
    }
    return attrList
  }
  _render = Element.prototype.render
  render() {
    this._emit(PRERENDER)
    this.parseContent()
    const coords = this.calcCoords(true)
    if (!coords) return void ( delete this.lpos )
    if (coords.xl - coords.xi <= 0) return void ( coords.xl = Math.max(coords.xl, coords.xi) )
    if (coords.yl - coords.yi <= 0) return void ( coords.yl = Math.max(coords.yl, coords.yi) )
    const lines = this.screen.lines
    // console.log(`>> [{${ this.codename }}.render]`, lines[0][0],lines[0][0].modeSign)
    let xi = coords.xi,
        xl = coords.xl,
        yi = coords.yi,
        yl = coords.yl,
        currAttr,
        ch
    const content = this._pcontent
    let ci = this.contLines.ci[coords.base],
        borderAttr,
        normAttr,
        visible,
        i

    const bch = this.ch
    if (coords.base >= this.contLines.ci.length) ci = this._pcontent.length
    this.lpos = coords
    if (this.border?.type === 'line') {
      this.screen._borderStops[coords.yi] = true
      this.screen._borderStops[coords.yl - 1] = true
    }
    normAttr = styleToAttr(this.style)
    // console.log('>> [element.render] interim', dattr)
    currAttr = normAttr
    // If we're in a scrollable text box, check to
    // see which attributes this line starts with.
    if (ci > 0) currAttr = this.contLines.attr[Math.min(coords.base, this.contLines.length - 1)]
    if (this.border) xi++, xl--, yi++, yl--
    // If we have padding/valign, that means the
    // content-drawing loop will skip a few cells/lines.
    // To deal with this, we can just fill the whole thing
    // ahead of time. This could be optimized.
    if (this.paddingSum || ( this.valign && this.valign !== TOP )) {
      if (this.style.transparent) {
        for (let y = Math.max(yi, 0), line, cell; ( y < yl ); y++) {
          if (!( line = lines[y] )) break
          for (let x = Math.max(xi, 0); x < xl; x++) {
            if (!( cell = line[x] )) break
            cell.at = colors.blend(currAttr, cell.at)
            line.dirty = true // lines[y][x][1] = bch;
          }
        }
      }
      else {
        this.screen.fillRegion(normAttr, bch, xi, xl, yi, yl)
      }
    }
    if (this.paddingSum) { xi += this.padding.left, xl -= this.padding.right, yi += this.padding.top, yl -= this.padding.bottom }
    // Determine where to place the text if it's vertically aligned.
    if (this.valign === MIDDLE || this.valign === BOTTOM) {
      visible = yl - yi
      if (this.contLines.length < visible) {
        if (this.valign === MIDDLE) {
          visible = visible / 2 | 0
          visible -= this.contLines.length / 2 | 0
        }
        else if (this.valign === BOTTOM) {
          visible -= this.contLines.length
        }
        ci -= visible * ( xl - xi )
      }
    }
    // Draw the content and background.
    for (let y = yi, line; y < yl; y++) {
      if (!( line = lines[y] )) {
        if (y >= this.screen.height || yl < this.intB) { break }
        else { continue }
      }
      for (let x = xi, cell; x < xl; x++) {
        if (!( cell = line[x] )) {
          if (x >= this.screen.width || xl < this.intR) { break }
          else { continue }
        }
        ch = content[ci++] || bch
        // if (!content[ci] && !coords._contentEnd) {
        //   coords._contentEnd = { x: x - xi, y: y - yi };
        // }
        // Handle escape codes.
        let matches, sgra
        while (ch === ESC) {
          if (( matches = /^\x1b\[[\d;]*m/.exec(content.slice(ci - 1)) ) && ( [ sgra ] = matches )) {
            ci += sgra.length - 1
            currAttr = sgraToAttr(sgra, currAttr, normAttr)
            // Ignore foreground changes for selected items.
            if (this.sup._isList && this.sup.interactive && this.sup.items[this.sup.selected] === this && this.sup.options.invertSelected !== false) {
              currAttr = ( currAttr & ~( 0x1ff << 9 ) ) | ( normAttr & ( 0x1ff << 9 ) )
            }
            ch = content[ci] || bch
            ci++
          }
          else {
            break
          }
        }
        // Handle newlines.
        if (ch === TAB) ch = bch
        if (ch === LF) {
          // If we're on the first cell and we find a newline and the last cell
          // of the last line was not a newline, let's just treat this like the
          // newline was already "counted".
          if (x === xi && y !== yi && content[ci - 2] !== LF) {
            x--
            continue
          }
          // We could use fillRegion here, name the
          // outer loop, and continue to it instead.
          ch = bch
          for (; x < xl; x++) {
            if (!( cell = line[x] )) break
            if (this.style.transparent) {
              cell.inject(
                colors.blend(currAttr, cell.at),
                content[ci] ? ch : null
              )
              line.dirty = true
            }
            else if (cell.at !== currAttr || cell.ch !== ch) {
              cell.inject(currAttr, ch)
              line.dirty = true
            }
          }
          continue
        }
        if (this.screen.fullUnicode && content[ci - 1]) {
          const point = unicode.codePointAt(content, ci - 1)
          // Handle combining chars:
          // Make sure they get in the same cell and are counted as 0.
          if (unicode.combining[point]) {
            if (point > 0x00ffff) {
              ch = content[ci - 1] + content[ci]
              ci++
            }
            if (x - 1 >= xi) { line[x - 1].ch += ch }
            else if (y - 1 >= yi) { lines[y - 1][xl - 1].ch += ch }
            x--
            continue
          }
          // Handle surrogate pairs:
          // Make sure we put surrogate pair chars in one cell.
          if (point > 0x00ffff) {
            ch = content[ci - 1] + content[ci]
            ci++
          }
        }
        if (this._noFill) continue
        const nextCell = line[x]
        if (this.style.transparent) {
          nextCell.inject(
            colors.blend(currAttr, nextCell.at),
            content[ci] ? ch : null
          )
          line.dirty = true
        }
        else {
          if (currAttr !== cell.at || ch !== cell.ch) {
            nextCell.inject(currAttr, ch)
            line.dirty = true
          }
        }
      }
    }
    // Draw the scrollbar.
    // Could possibly draw this after all child elements.
    if (this.scrollbar) {
      // i = this.getScrollHeight();
      i = Math.max(this.contLines.length, this._scrollBottom())
    }
    if (coords.notop || coords.nobot) i = -Infinity
    if (this.scrollbar && ( yl - yi ) < i) {
      let x = xl - 1
      if (this.scrollbar.ignoreBorder && this.border) x++
      let y = this.alwaysScroll ? this.childBase / ( i - ( yl - yi ) ) : ( this.childBase + this.childOffset ) / ( i - 1 )
      y = yi + ( ( yl - yi ) * y | 0 )
      if (y >= yl) y = yl - 1
      let line = lines[y],
          cell = line && line[x]
      if (cell) {
        if (this.track) {
          ch = this.track.ch || ' '
          currAttr = styleToAttr(this.style.track, this.style.track.fg || this.style.fg, this.style.track.bg || this.style.bg)
          this.screen.fillRegion(currAttr, ch, x, x + 1, yi, yl)
        }
        ch = this.scrollbar.ch || ' '
        currAttr = styleToAttr(this.style.scrollbar, this.style.scrollbar.fg || this.style.fg, this.style.scrollbar.bg || this.style.bg)
        if (currAttr !== cell.at || ch !== cell.ch) {
          cell.inject(currAttr, ch)
          lines[y].dirty = true
        }
      }
    }
    if (this.border) xi--, xl++, yi--, yl++
    if (this.paddingSum) {
      xi -= this.padding.left, xl += this.padding.right, yi -= this.padding.top, yl += this.padding.bottom
    }
    // Draw the border.
    if (this.border) {
      borderAttr = styleToAttr(this.style.border)
      let y = yi
      if (coords.notop) y = -1
      let line = lines[y]
      for (let x = xi, cell; x < xl; x++) {
        if (!line) break
        if (coords.noleft && x === xi) continue
        if (coords.noright && x === xl - 1) continue
        if (!( cell = line[x] )) continue
        if (this.border.type === 'line') {
          if (x === xi) {
            ch = '\u250c' // '┌'
            if (!this.border.left) {
              if (this.border.top) { ch = '\u2500' } // '─'
              else { continue }
            }
            else {
              if (!this.border.top) { ch = '\u2502' } // '│'
            }
          }
          else if (x === xl - 1) {
            ch = '\u2510' // '┐'
            if (!this.border.right) {
              if (this.border.top) { ch = '\u2500' } // '─'
              else { continue }
            }
            else {
              if (!this.border.top) { ch = '\u2502' } // '│'
            }
          }
          else { ch = '\u2500' } // '─'
        }
        else if (this.border.type === 'bg') { ch = this.border.ch }
        if (!this.border.top && x !== xi && x !== xl - 1) {
          ch = ' '
          if (cell.at !== normAttr || cell.ch !== ch) {
            cell.inject(normAttr, ch)
            lines[y].dirty = true
            continue
          }
        }
        if (cell.at !== borderAttr || cell.ch !== ch) {
          cell.inject(borderAttr, ch)
          line.dirty = true
        }
      }
      for (let y = yi + 1, line, cell; y < yl - 1; y++) {
        if (!( line = lines[y] )) continue
        if (( cell = line[xi] )) {
          if (this.border.left) {
            if (this.border.type === 'line') { ch = '\u2502' } // '│'
            else if (this.border.type === 'bg') { ch = this.border.ch }
            if (!coords.noleft)
              if (cell.at !== borderAttr || cell.ch !== ch) {
                cell.inject(borderAttr, ch)
                line.dirty = true
              }
          }
          else {
            ch = ' '
            if (cell.at !== normAttr || cell.ch !== ch) {
              cell.inject(normAttr, ch)
              line.dirty = true
            }
          }
        }
        if (( cell = line[xl - 1] )) {
          if (this.border.right) {
            if (this.border.type === 'line') { ch = '\u2502' } // '│'
            else if (this.border.type === 'bg') { ch = this.border.ch }
            if (!coords.noright)
              if (cell.at !== borderAttr || cell.ch !== ch) {
                cell.inject(borderAttr, ch)
                line.dirty = true
              }
          }
          else {
            ch = ' '
            if (cell.at !== normAttr || cell.ch !== ch) {
              cell.inject(normAttr, ch)
              line.dirty = true
            }
          }
        }
      }
      y = yl - 1
      if (coords.nobot) y = -1
      for (let x = xi, cell; x < xl; x++) {
        if (!( line = lines[y] )) break
        if (coords.noleft && x === xi) continue
        if (coords.noright && x === xl - 1) continue
        if (!( cell = line[x] )) continue
        if (this.border.type === 'line') {
          if (x === xi) {
            ch = '\u2514' // '└'
            if (!this.border.left) {
              if (this.border.bottom) { ch = '\u2500' } // '─'
              else { continue }
            }
            else {
              if (!this.border.bottom) { ch = '\u2502' } // '│'
            }
          }
          else if (x === xl - 1) {
            ch = '\u2518' // '┘'
            if (!this.border.right) {
              if (this.border.bottom) { ch = '\u2500' } // '─'
              else { continue }
            }
            else {
              if (!this.border.bottom) { ch = '\u2502' } // '│'
            }
          }
          else { ch = '\u2500' } // '─'
        }
        else if (this.border.type === 'bg') { ch = this.border.ch }
        if (!this.border.bottom && x !== xi && x !== xl - 1) {
          ch = ' '
          if (cell.at !== normAttr || cell.ch !== ch) {
            cell.inject(normAttr, ch)
            line.dirty = true
          }
          continue
        }
        if (cell.at !== borderAttr || cell.ch !== ch) {
          cell.inject(borderAttr, ch)
          line.dirty = true
        }
      }
    }
    if (this.shadow) {
      // right
      for (let y = Math.max(yi + 1, 0), line; y < yl + 1; y++) {
        if (!( line = lines[y] )) break
        for (let x = xl, cell; x < xl + 2; x++) {
          if (!( cell = line[x] )) break
          // lines[y][x][0] = colors.blend(this.dattr, lines[y][x][0]);
          cell.at = colors.blend(cell.at)
          line.dirty = true
        }
      }
      // bottom
      for (let y = yl, line; y < yl + 1; y++) {
        if (!( line = lines[y] )) break
        for (let x = Math.max(xi + 1, 0), cell; x < xl; x++) {
          if (!( cell = line[x] )) break
          // lines[y][x][0] = colors.blend(this.dattr, lines[y][x][0]);
          cell.at = colors.blend(cell.at)
          line.dirty = true
        }
      }
    }
    this.sub.forEach(el => {
      if (el.screen._ci !== -1) el.index = el.screen._ci++
      // if (el.screen._rendering) { el._rendering = true; }
      el.render()
      // if (el.screen._rendering) { el._rendering = false; }
    })
    this._emit(RENDER, [ coords ])
    return coords
  }
  screenshot(xi, xl, yi, yl) {
    xi = this.lpos.xi + this.intL + ( xi || 0 )
    xl = xl != null ? this.lpos.xi + this.intL + ( xl || 0 ) : this.lpos.xl - this.intR
    yi = this.lpos.yi + this.intT + ( yi || 0 )
    yl = yl != null ? this.lpos.yi + this.intT + ( yl || 0 ) : this.lpos.yl - this.intB
    return this.screen.screenshot(xi, xl, yi, yl)
  }

  onScreenEvent(type, handler) {
    const listeners = this._slisteners ?? ( this._slisteners = [] )
    listeners.push({ type, handler })
    this.screen.on(type, handler)
  }
  onceScreenEvent(type, handler) {
    const listeners = this._slisteners ?? ( this._slisteners = [] )
    const entry = { type, handler }
    listeners.push(entry)
    this.screen.once(type, function () {
      const i = listeners.indexOf(entry)
      if (~i) listeners.splice(i, 1)
      return handler.apply(this, arguments)
    })
  }
  removeScreenEvent(type, handler) {
    const listeners = this._slisteners ?? ( this._slisteners = [] )
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      if (listener.type === type && listener.handler === handler) {
        listeners.splice(i, 1)
        if (this._slisteners.length === 0) delete this._slisteners
        break
      }
    }
    this.screen.removeListener(type, handler)
  }
  free() {
    const listeners = this._slisteners ?? ( this._slisteners = [] )
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      this.screen.removeListener(listener.type, listener.handler)
    }
    delete this._slisteners
  }
  hide() {
    if (this.hidden) return
    this.clearPos()
    this.hidden = true
    this.emit(HIDE)
    if (this.screen.focused === this) this.screen.rewindFocus()
  }
  show() {
    if (!this.hidden) return
    this.hidden = false
    this.emit(SHOW)
  }
  toggle() { return this.hidden ? this.show() : this.hide() }
  focus() { return this.screen.focused = this }
  setContent(content, noClear, noTags) {
    if (!noClear) this.clearPos()
    this.content = content || ''
    this.parseContent(noTags)
    this.emit(SET_CONTENT)
  }
  getContent() { return this.contLines?.fake.join(LF) ?? '' }
  setText(content, noClear) {
    content = content || ''
    content = content.replace(/\x1b\[[\d;]*m/g, '')
    return this.setContent(content, noClear, true)
  }
  getText() { return this.getContent().replace(/\x1b\[[\d;]*m/g, '') }

  _align(line, width, align) {
    if (!align) return line
    //if (!align && !~line.indexOf('{|}')) return line;
    const cline = line.replace(/\x1b\[[\d;]*m/g, ''),
          len   = cline.length
    let s = width - len
    if (this.shrink) { s = 0 }
    if (len === 0) return line
    if (s < 0) return line
    if (align === CENTER && ( s = Array(( ( s / 2 ) | 0 ) + 1).join(' ') )) return s + line + s
    else if (align === RIGHT && ( s = Array(s + 1).join(' ') )) return s + line
    else if (this.parseTags && ~line.indexOf('{|}')) {
      const parts = line.split('{|}')
      const cparts = cline.split('{|}')
      s = Math.max(width - cparts[0].length - cparts[1].length, 0)
      s = Array(s + 1).join(' ')
      return parts[0] + s + parts[1]
    }
    return line
  }
  enableMouse() { this.screen._listenMouse(this) }
  enableKeys() { this.screen._listenKeys(this) }
  enableInput() {
    this.screen._listenMouse(this)
    this.screen._listenKeys(this)
  }
  enableDrag(verify) {
    const self = this
    if (this._draggable) return true
    if (typeof verify !== FUN) verify = () => true
    this.enableMouse()
    this.on(MOUSEDOWN, this._dragMD = function (data) {
      if (self.screen._dragging) return
      if (!verify(data)) return
      self.screen._dragging = self
      self._drag = {
        x: data.x - self.absL,
        y: data.y - self.absT
      }
      self.setFront()
    })
    this.onScreenEvent(MOUSE, this._dragM = function (data) {
      if (self.screen._dragging !== self) return
      if (data.action !== MOUSEDOWN && data.action !== MOUSEMOVE) {
        delete self.screen._dragging
        delete self._drag
        return
      }
      // This can happen in edge cases where the user is
      // already dragging and element when it is detached.
      if (!self.sup) return
      const ox = self._drag.x,
            oy = self._drag.y,
            px = self.sup.absL,
            py = self.sup.absT,
            x  = data.x - px - ox,
            y  = data.y - py - oy
      if (self.position.right != null) {
        if (self.position.left != null) self.width = '100%-' + ( self.sup.width - self.width )
        self.position.right = null
      }
      if (self.position.bottom != null) {
        if (self.position.top != null) self.height = '100%-' + ( self.sup.height - self.height )
        self.position.bottom = null
      }
      self.relL = x
      self.relT = y
      self.screen.render()
    })
    return this._draggable = true
  }
  disableDrag() {
    if (!this._draggable) return false
    delete this.screen._dragging
    delete this._drag
    this.removeListener(MOUSEDOWN, this._dragMD)
    this.removeScreenEvent(MOUSE, this._dragM)
    return this._draggable = false
  }
  key() { return this.screen.program.key.apply(this, arguments) }
  onceKey() { return this.screen.program.onceKey.apply(this, arguments) }
  unkey() { return this.screen.program.unkey.apply(this, arguments) }
  removeKey() { return this.screen.program.unkey.apply(this, arguments) }
  setIndex(index) {
    if (!this.sup) return
    if (index < 0) { index = this.sup.sub.length + index }
    index = Math.max(index, 0)
    index = Math.min(index, this.sup.sub.length - 1)
    const i = this.sup.sub.indexOf(this)
    if (!~i) return
    const item = this.sup.sub.splice(i, 1)[0]
    this.sup.sub.splice(index, 0, item)
  }
  setFront() { return this.setIndex(-1) }
  setBack() { return this.setIndex(0) }
  setLabel(options) {
    const self = this
    // const Box = require('./box')
    if (typeof options === STR) options = { text: options }
    if (this._label) {
      this._label.setContent(options.text)
      if (options.side !== RIGHT) {
        this._label.relL = 2 + ( this.border ? -1 : 0 )
        this._label.position.right = undefined
        if (!this.screen.autoPadding) this._label.relL = 2
      }
      else {
        this._label.relR = 2 + ( this.border ? -1 : 0 )
        this._label.position.left = undefined
        if (!this.screen.autoPadding) this._label.relR = 2
      }
      return
    }
    this._label = new Box({
      screen: this.screen,
      sup: this,
      content: options.text,
      top: -this.intT,
      tags: this.parseTags,
      shrink: true,
      style: this.style.label
    })
    if (options.side !== RIGHT) { this._label.relL = 2 - this.intL }
    else { this._label.relR = 2 - this.intR }
    this._label._isLabel = true
    if (!this.screen.autoPadding) {
      if (options.side !== RIGHT) { this._label.relL = 2 }
      else { this._label.relR = 2 }
      this._label.relT = 0
    }
    const reposition = () => {
      self._label.relT = ( self.childBase || 0 ) - self.intT
      if (!self.screen.autoPadding) { self._label.relT = ( self.childBase || 0 ) }
      self.screen.render()
    }
    this.on(SCROLL, this._labelScroll = () => reposition())
    this.on(RESIZE, this._labelResize = () => nextTick(() => reposition()))
  }
  removeLabel() {
    if (!this._label) return
    this.removeListener(SCROLL, this._labelScroll)
    this.removeListener(RESIZE, this._labelResize)
    this._label.detach()
    delete this._labelScroll
    delete this._labelResize
    delete this._label
  }
  setHover(options) {
    if (typeof options === STR) options = { text: options }
    this._hoverOptions = options
    this.enableMouse()
    this.screen._initHover()
  }
// The below methods are a bit confusing: basically
// whenever Box.render is called `lpos` gets set on
// the element, an object containing the rendered
// coordinates. Since these don't update if the
// element is moved somehow, they're unreliable in
// that situation. However, if we can guarantee that
// lpos is good and up to date, it can be more
// accurate than the calculated positions below.
// In this case, if the element is being rendered,
// it's guaranteed that the sup will have been
// rendered first, in which case we can use the
// parant's lpos instead of recalculating it's
// position (since that might be wrong because
  removeHover() {
    delete this._hoverOptions
    if (!this.screen._hoverText || this.screen._hoverText.detached) return
    this.screen._hoverText.detach()
    this.screen.render()
  }
  // it doesn't handle content shrinkage).
  /**
   * Content Methods
   */
  insertLine(i, line) {
    if (typeof line === STR) line = line.split(LF)
    if (i !== i || i == null) i = this.contLines.ftor.length
    i = Math.max(i, 0)
    while (this.contLines.fake.length < i) {
      this.contLines.fake.push('')
      this.contLines.ftor.push([ this.contLines.push('') - 1 ])
      this.contLines.rtof(this.contLines.fake.length - 1)
    }
    // NOTE: Could possibly compare the first and last ftor line numbers to see
    // if they're the same, or if they fit in the visible region entirely.
    const start = this.contLines.length
    let diff,
        real
    if (i >= this.contLines.ftor.length) {
      real = this.contLines.ftor[this.contLines.ftor.length - 1]
      real = real[real.length - 1] + 1
    }
    else {
      real = this.contLines.ftor[i][0]
    }
    for (let j = 0; j < line.length; j++)
      this.contLines.fake.splice(i + j, 0, line[j])
    this.setContent(this.contLines.fake.join(LF), true)
    diff = this.contLines.length - start
    if (diff > 0) {
      const pos = this.calcCoords()
      if (!pos) return
      const ht   = pos.yl - pos.yi - this.intH,
            base = this.childBase || 0,
            vis  = real >= base && real - base < ht // visible
      if (pos && vis && this.screen.cleanSides(this)) {
        this.screen.insertLine(diff,
          pos.yi + this.intT + real - base,
          pos.yi,
          pos.yl - this.intB - 1)
      }
    }
  }
  deleteLine(i, n = 1) {
    if (i !== i || i == null) i = this.contLines.ftor.length - 1
    i = Math.max(i, 0)
    i = Math.min(i, this.contLines.ftor.length - 1)
    // NOTE: Could possibly compare the first and last ftor line numbers to see
    // if they're the same, or if they fit in the visible region entirely.
    const start = this.contLines.length
    let diff
    const real = this.contLines.ftor[i][0]
    while (n--) this.contLines.fake.splice(i, 1)
    this.setContent(this.contLines.fake.join(LF), true)
    diff = start - this.contLines.length
    // XXX clearPos() without diff statement?
    let height = 0
    if (diff > 0) {
      const pos = this.calcCoords()
      if (!pos) return

      height = pos.yl - pos.yi - this.intH
      const base    = this.childBase || 0,
            visible = real >= base && real - base < height
      if (pos && visible && this.screen.cleanSides(this)) {
        this.screen.deleteLine(diff,
          pos.yi + this.intT + real - base,
          pos.yi,
          pos.yl - this.intB - 1)
      }
    }
    if (this.contLines.length < height) this.clearPos()
  }
  insertTop(line) {
    const fake = this.contLines.rtof[this.childBase || 0]
    return this.insertLine(fake, line)
  }
  insertBottom(line) {
    const h    = ( this.childBase || 0 ) + this.height - this.intH,
          i    = Math.min(h, this.contLines.length),
          fake = this.contLines.rtof[i - 1] + 1
    return this.insertLine(fake, line)
  }
  deleteTop(n) {
    const fake = this.contLines.rtof[this.childBase || 0]
    return this.deleteLine(fake, n)
  }
  deleteBottom(n = 1) {
    const h    = ( this.childBase || 0 ) + this.height - 1 - this.intH,
          i    = Math.min(h, this.contLines.length - 1),
          fake = this.contLines.rtof[i]
    return this.deleteLine(fake - ( n - 1 ), n)
  }
  setLine(i, line) {
    i = Math.max(i, 0)
    while (this.contLines.fake.length < i) { this.contLines.fake.push('') }
    this.contLines.fake[i] = line
    return this.setContent(this.contLines.fake.join(LF), true)
  }
  setBaseLine(i, line) {
    const fake = this.contLines.rtof[this.childBase || 0]
    return this.setLine(fake + i, line)
  }
  getLine(i) {
    i = Math.max(i, 0)
    i = Math.min(i, this.contLines.fake.length - 1)
    return this.contLines.fake[i]
  }
  getBaseLine(i) {
    const fake = this.contLines.rtof[this.childBase || 0]
    return this.getLine(fake + i)
  }
  clearLine(i) {
    i = Math.min(i, this.contLines.fake.length - 1)
    return this.setLine(i, '')
  }
  clearBaseLine(i) {
    const fake = this.contLines.rtof[this.childBase || 0]
    return this.clearLine(fake + i)
  }
  unshiftLine(line) { return this.insertLine(0, line) }
  shiftLine(n) { return this.deleteLine(0, n) }
  pushLine(line) { return !this.content ? this.setLine(0, line) : this.insertLine(this.contLines.fake.length, line) }
  popLine(n) { return this.deleteLine(this.contLines.fake.length - 1, n) }
  getLines() { return this.contLines.fake.slice() }
  getScreenLines() { return this.contLines.slice() }
  strWidth(text) {
    text = this.parseTags ? helpers.stripTags(text) : text
    return this.screen.fullUnicode ? unicode.strWidth(text) : helpers.dropUnicode(text).length
  }
}
