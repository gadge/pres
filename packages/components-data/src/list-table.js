/**
 * listtable.js - list table element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Box }                     from '@pres/components-core'
import { ATTACH, RESIZE, SCROLL, } from '@pres/enum-events'
import { LEFT, RIGHT }             from '@pres/enum-key-names'
import { styleToAttr }             from '@pres/util-sgr-attr'
import { List }                    from './list'
import { Table }                   from './table'

export class ListTable extends List {
  /**
   * ListTable
   */
  constructor(options = {}) {
    // options.shrink = true;
    options.normalShrink = true
    options.style = options.style || {}
    options.style.border = options.style.border || {}
    options.style.header = options.style.header || {}
    options.style.cell = options.style.cell || {}
    const __align = options.align || 'center'
    delete options.align
    options.style.selected = options.style.cell.selected
    options.style.item = options.style.cell
    const __border = options.border
    if (
      __border &&
      __border.top === false &&
      __border.bottom === false &&
      __border.left === false &&
      __border.right === false
    ) { delete options.border }
    if (!options.sku) options.sku = 'list-table'
    super(options)
    const self = this
    // if (!( this instanceof Node )) { return new ListTable(options) }
    this.__align = __align
    options.border = __border
    this._header = new Box({
      sup: this,
      left: this.screen.autoPadding ? 0 : this.intL,
      top: 0,
      width: 'shrink',
      height: 1,
      style: options.style.header,
      tags: options.parseTags || options.tags
    })
    this.on(SCROLL, () => {
      self._header.setFront()
      self._header.rtop = self.childBase
      if (!self.screen.autoPadding) {
        self._header.rtop = self.childBase + ( self.border ? 1 : 0 )
      }
    })
    this.pad = options.pad != null
      ? options.pad
      : 2
    this.setData(options.rows || options.data)
    this.on(ATTACH, () => self.setData(self.rows))
    this.on(RESIZE, () => {
      const selected = self.selected
      self.setData(self.rows)
      self.select(selected)
      self.screen.render()
    })
    this.type = 'list-table'
  }
  static build(options) { return new ListTable(options) }
  _calculateMaxes() { return Table.prototype._calculateMaxes.call(this) }
  setRows(rows) { return this.setData(rows) }
  setData(rows) {
    const self     = this,
          align    = this.__align,
          selected = this.selected,
          original = this.items.slice()
    let sel = this.ritems[this.selected]
    if (this.visible && this.lpos) this.clearPos()
    this.clearItems()
    this.rows = rows || []
    this._calculateMaxes()
    if (!this._maxes) return
    this.addItem('')
    this.rows.forEach((row, i) => {
      const isHeader = i === 0
      let text = ''
      row.forEach((cell, i) => {
        const width = self._maxes[i]
        let clen = self.strWidth(cell)
        if (i !== 0) {
          text += ' '
        }
        while (clen < width) {
          if (align === 'center') {
            cell = ' ' + cell + ' '
            clen += 2
          }
          else if (align === LEFT) {
            cell = cell + ' '
            clen += 1
          }
          else if (align === RIGHT) {
            cell = ' ' + cell
            clen += 1
          }
        }
        if (clen > width) {
          if (align === 'center') {
            cell = cell.substring(1)
            clen--
          }
          else if (align === LEFT) {
            cell = cell.slice(0, -1)
            clen--
          }
          else if (align === RIGHT) {
            cell = cell.substring(1)
            clen--
          }
        }
        text += cell
      })
      if (isHeader) {
        self._header.setContent(text)
      }
      else {
        self.addItem(text)
      }
    })
    this._header.setFront()
    // Try to find our old item if it still exists.
    sel = this.ritems.indexOf(sel)
    if (~sel) { this.select(sel) }
    else if (this.items.length === original.length) { this.select(selected) }
    else { this.select(Math.min(selected, this.items.length - 1)) }
  }
  _select(i) { return List.prototype.select.call(this, i) }
  select(i) {
    if (i === 0) i = 1
    if (i <= this.childBase) this.setScroll(this.childBase - 1)
    return this._select(i)
  }
  render() {
    const self = this
    const coords = this._render()
    if (!coords) return
    this._calculateMaxes()
    if (!this._maxes) return coords
    const lines = this.screen.lines,
          xi    = coords.xi,
          yi    = coords.yi
    let rx,
        ry
    const borderAttr = styleToAttr(this.style.border)
    const height = coords.yl - coords.yi - this.intB
    let border = this.border
    if (!this.border && this.options.border) border = this.options.border
    if (!border || this.options.noCellBorders) return coords
    // Draw border with correct angles.
    ry = 0
    for (let i = 0, line; i < height + 1; i++) {
      if (!( line = lines[yi + ry] )) break
      rx = 0
      self._maxes.slice(0, -1).forEach(max => {
        rx += max
        if (!line[xi + rx + 1]) return
        // center
        if (ry === 0) {
          // top
          rx++
          line[xi + rx].inject(borderAttr, '\u252c') // '┬'
          // XXX If we alter iheight and intT for no borders - nothing should be written here
          if (!border.top) line[xi + rx].ch = '\u2502' // '│'
          line.dirty = true
        }
        else if (ry === height) {
          // bottom
          rx++
          line[xi + rx].inject(borderAttr, '\u2534') // '┴'
          // XXX If we alter iheight and intB for no borders - nothing should be written here
          if (!border.bottom) line[xi + rx].ch = '\u2502' // '│'
          line.dirty = true
        }
        else {
          // middle
          rx++
        }
      })
      ry += 1
    }
    // Draw internal borders.
    for (let ry = 1, line; ry < height; ry++) {
      if (!( line = lines[yi + ry] )) break
      rx = 0
      self._maxes.slice(0, -1).forEach(max => {
        rx += max
        if (!line[xi + rx + 1]) return
        if (self.options.fillCellBorders !== false) {
          const lbg = line[xi + rx].at & 0x1ff
          rx++
          line[xi + rx].at = ( borderAttr & ~0x1ff ) | lbg
        }
        else {
          rx++
          line[xi + rx].at = borderAttr
        }
        line[xi + rx].ch = '\u2502' // '│'
        line.dirty = true
      })
    }
    return coords
  }
}
