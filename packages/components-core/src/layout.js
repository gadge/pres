/**
 * layout.js - layout element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
import { PRERENDER, RENDER, } from '@pres/enum-events'
import { Element }            from '../core/element'

export class Layout extends Element {
  /**
   * Layout
   */
  constructor(options = {}) {
    if (!options.sku) options.sku = 'layout'
    super(options)
    // if (!(this instanceof Node)) return new Layout(options)
    if (
      (options.width == null && (options.left == null && options.right == null)) ||
      (options.height == null && (options.top == null && options.bottom == null))
    ) throw new Error('`Layout` must have a width and height!')
    options.layout = options.layout || 'inline'
    if (options.renderer) this.renderer = options.renderer
    this.type = 'layout'
  }
  static build(options) { return new Layout(options) }
  isRendered(el) { return !el.lpos ? false : (el.lpos.xHi - el.lpos.xLo) > 0 && (el.lpos.yHi - el.lpos.yLo) > 0 }
  getLast(i) {
    while (this.sub[--i]) {
      const el = this.sub[i]
      if (this.isRendered(el)) return el
    }
  }
  getLastCoords(i) {
    const last = this.getLast(i)
    if (last) return last.lpos
  }
  _renderCoords() {
    const coords = this.calcCoords(true)
    const sub = this.sub
    this.sub = []
    this._render()
    this.sub = sub
    return coords
  }
  renderer(coords) {
    const self = this
    // The coordinates of the layout element
    const width  = coords.xHi - coords.xLo,
          height = coords.yHi - coords.yLo,
          xLo     = coords.xLo,
          yLo     = coords.yLo
    // The current row offset in cells (which row are we on?)
    let rowOffset = 0
    // The index of the first child in the row
    let rowIndex = 0
    let lastRowIndex = 0

    // Figure out the highest width child
    let highWidth
    if (this.options.layout === 'grid') {
      highWidth = this.sub.reduce((out, el) => Math.max(out, el.width), 0)
    }
    return function iterator(el, i) {
      // Make our sub shrinkable. If they don't have a height, for
      // example, calculate it for them.
      el.shrink = true
      // Find the previous rendered child's coordinates
      const last = self.getLast(i)
      // If there is no previously rendered element, we are on the first child.
      if (!last) {
        el.position.left = 0
        el.position.top = 0
      }
      else {
        // Otherwise, figure out where to place this child. We'll start by
        // setting it's `left`/`x` coordinate to right after the previous
        // rendered element. This child will end up directly to the right of it.
        el.position.left = last.lpos.xHi - xLo
        // Make sure the position matches the highest width element
        if (self.options.layout === 'grid') {
          // Compensate with width:
          // el.position.width = el.width + (highWidth - el.width);
          // Compensate with position:
          el.position.left += highWidth - (last.lpos.xHi - last.lpos.xLo)
        }
        // If our child does not overlap the right side of the Layout, set it's
        // `top`/`y` to the current `rowOffset` (the coordinate for the current
        // row).
        if (el.position.left + el.width <= width) {
          el.position.top = rowOffset
        }
        else {
          // Otherwise we need to start a new row and calculate a new
          // `rowOffset` and `rowIndex` (the index of the child on the current
          // row).
          rowOffset += self.sub.slice(rowIndex, i).reduce(function (out, el) {
            if (!self.isRendered(el)) return out
            out = Math.max(out, el.lpos.yHi - el.lpos.yLo)
            return out
          }, 0)
          lastRowIndex = rowIndex
          rowIndex = i
          el.position.left = 0
          el.position.top = rowOffset
        }
      }
      // Make sure the elements on lower rows graviatate up as much as possible
      if (self.options.layout === 'inline') {
        let above = null
        let abovea = Infinity
        for (let j = lastRowIndex; j < rowIndex; j++) {
          const l = self.sub[j]
          if (!self.isRendered(l)) continue
          const abs = Math.abs(el.position.left - (l.lpos.xLo - xLo))
          // if (abs < abovea && (l.lpos.xHi - l.lpos.xLo) <= el.width) {
          if (abs < abovea) {
            above = l
            abovea = abs
          }
        }
        if (above) el.position.top = above.lpos.yHi - yLo
      }
      // If our child overflows the Layout, do not render it!
      // Disable this feature for now.
      if (el.position.top + el.height > height) {
        // Returning false tells blessed to ignore this child.
        // return false;
      }
    }
  }
  render() {
    this._emit(PRERENDER)
    const coords = this._renderCoords()
    if (!coords) {
      delete this.lpos
      return
    }
    if (coords.xHi - coords.xLo <= 0) return void (coords.xHi = Math.max(coords.xHi, coords.xLo))
    if (coords.yHi - coords.yLo <= 0) return void (coords.yHi = Math.max(coords.yHi, coords.yLo))
    this.lpos = coords
    if (this.border) coords.xLo++, coords.xHi--, coords.yLo++, coords.yHi--
    if (this.paddingSum) {
      coords.xLo += this.padding.left, coords.xHi -= this.padding.right
      coords.yLo += this.padding.top, coords.yHi -= this.padding.bottom
    }
    const iterator = this.renderer(coords)
    if (this.border) coords.xLo--, coords.xHi++, coords.yLo--, coords.yHi++
    if (this.paddingSum) {
      coords.xLo -= this.padding.left, coords.xHi += this.padding.right
      coords.yLo -= this.padding.top, coords.yHi += this.padding.bottom
    }
    this.sub.forEach((el, i) => {
      if (el.screen._ci !== -1) el.index = el.screen._ci++
      const rendered = iterator(el, i)
      if (rendered === false) {
        delete el.lpos
        return
      }
      // if (el.screen._rendering) {
      //   el._rendering = true;
      // }
      el.render()
      // if (el.screen._rendering) {
      //   el._rendering = false;
      // }
    })
    this._emit(RENDER, [ coords ])
    return coords
  }
}


