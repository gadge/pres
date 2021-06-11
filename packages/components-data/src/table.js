/**
 * table.js - table element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Box }             from '@pres/components-core'
import { ATTACH, RESIZE, } from '@pres/enum-events'
import { LEFT, RIGHT }     from '@pres/enum-key-names'
import { styleToAttr }     from '@pres/util-sgr-attr'

export class Table extends Box {
  setRows = this.setData
  /**
   * Table
   */
  constructor(options = {}) {
    options.shrink = true
    options.style = options.style || {}
    options.style.border = options.style.border || {}
    options.style.header = options.style.header || {}
    options.style.cell = options.style.cell || {}
    options.align = options.align || 'center'
    // Regular tables do not get custom height (this would
    // require extra padding). Maybe add in the future.
    delete options.height
    if (!options.sku) options.sku = 'table'
    super(options)
    const self = this
    // if (!(this instanceof Node)) { return new Table(options) }
    this.pad = options.pad ?? 2
    this.setData(options.rows || options.data)
    this.on(ATTACH, () => {
      self.setContent('')
      self.setData(self.rows)
    })
    this.on(RESIZE, () => {
      self.setContent('')
      self.setData(self.rows)
      self.screen.render()
    })
    this.type = 'table'
  }
  static build(options) { return new Table(options) }
  _calculateMaxes() {
    const self = this
    let maxes = []
    if (this.detached) return
    this.rows = this.rows || []
    this.rows.forEach(row => {
      row.forEach((cell, i) => {
        const clen = self.strWidth(cell)
        if (!maxes[i] || maxes[i] < clen) {
          maxes[i] = clen
        }
      })
    })
    let total = maxes.reduce((total, max) => total + max, 0)
    total += maxes.length + 1
    // XXX There might be an issue with resizing where on the first resize event
    // width appears to be less than total if it's a percentage or left/right
    // combination.
    if (this.width < total) delete this.position.width
    if (this.position.width != null) {
      const missing = this.width - total
      const w = missing / maxes.length | 0
      const wr = missing % maxes.length
      maxes = maxes.map((max, i) => i === maxes.length - 1 ? max + w + wr : max + w)
    }
    else {
      maxes = maxes.map(max => max + self.pad)
    }
    return this._maxes = maxes
  }
  setData(rows) {
    const self = this
    let text = ''
    const align = this.align
    this.rows = rows || []
    this._calculateMaxes()
    if (!this._maxes) return
    this.rows.forEach((row, i) => {
      const isFooter = i === self.rows.length - 1
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
      if (!isFooter) {
        text += '\n\n'
      }
    })
    delete this.align
    this.setContent(text)
    this.align = align
  }
  render() {
    // console.log(`>>> calling table.render`)
    const self = this
    const coords = this._render()
    if (!coords) return
    this._calculateMaxes()
    if (!this._maxes) return coords
    const lines = this.screen.lines,
          xLo    = coords.xLo,
          yLo    = coords.yLo
    let rx,
        ry
    const normAttr   = styleToAttr(this.style),
          headAttr   = styleToAttr(this.style.header),
          cellAttr   = styleToAttr(this.style.cell),
          borderAttr = styleToAttr(this.style.border)
    const width  = coords.xHi - coords.xLo - this.intR,
          height = coords.yHi - coords.yLo - this.intB
    // Apply attributes to header cells and cells.
    for (let y = this.intT, line; y < height; y++) {
      if (!( line = lines[yLo + y] )) break
      for (let x = this.intL, cell; x < width; x++) {
        if (!( cell = line[xLo + x] )) break
        // Check to see if it's not the default attr. Allows for tags:
        if (cell.at !== normAttr) continue
        cell.at = y === this.intT ? headAttr : cellAttr
        line.dirty = true
      }
    }
    if (!this.border || this.options.noCellBorders) return coords
    // Draw border with correct angles.
    ry = 0
    for (let i = 0, line; i < self.rows.length + 1; i++) {
      if (!( line = lines[yLo + ry] )) break
      rx = 0
      self._maxes.forEach((max, i) => {
        rx += max
        if (i === 0) {
          if (!line[xLo + 0]) return
          // left side
          if (ry === 0) {
            // top
            line[xLo + 0].at = borderAttr
            // line[xLo + 0].ch = '\u250c'; // '┌'
          }
          else if (ry / 2 === self.rows.length) {
            // bottom
            line[xLo + 0].at = borderAttr
            // line[xLo + 0].ch = '\u2514'; // '└'
          }
          else {
            // middle
            line[xLo + 0].inject(borderAttr, '\u251c') // '├'
            // XXX If we alter intW and intL for no borders - nothing should be written here
            if (!self.border.left) line[xLo + 0].ch = '\u2500' // '─'

          }
          line.dirty = true
        }
        else if (i === self._maxes.length - 1) {
          if (!line[xLo + rx + 1]) return
          // right side
          if (ry === 0) {
            // top
            rx++
            line[xLo + rx].at = borderAttr
            // line[xLo + rx].ch = '\u2510'; // '┐'
          }
          else if (ry / 2 === self.rows.length) {
            // bottom
            rx++
            line[xLo + rx].at = borderAttr
            // line[xLo + rx].ch = '\u2518'; // '┘'
          }
          else {
            // middle
            rx++
            line[xLo + rx].inject(borderAttr, '\u2524') // '┤'
            // XXX If we alter intW and intR for no borders - nothing should be written here
            if (!self.border.right) line[xLo + rx].ch = '\u2500' // '─'
          }
          line.dirty = true
          return
        }
        if (!line[xLo + rx + 1]) return
        // center
        if (ry === 0) {
          // top
          rx++
          line[xLo + rx].inject(borderAttr, '\u252c') // '┬'
          // XXX If we alter intH and intT for no borders - nothing should be written here
          if (!self.border.top) line[xLo + rx].ch = '\u2502' // '│'

        }
        else if (ry / 2 === self.rows.length) {
          // bottom
          rx++
          line[xLo + rx].inject(borderAttr, '\u2534') // '┴'
          // XXX If we alter intH and intB for no borders - nothing should be written here
          if (!self.border.bottom) line[xLo + rx].ch = '\u2502' // '│'

        }
        else {
          // middle
          if (self.options.fillCellBorders) {
            const lineBackColor = ( ry <= 2 ? headAttr : cellAttr ) & 0x1ff
            rx++
            line[xLo + rx].at = ( borderAttr & ~0x1ff ) | lineBackColor
          }
          else {
            rx++
            line[xLo + rx].at = borderAttr
          }
          line[xLo + rx].ch = '\u253c' // '┼'
          // rx++;
        }
        line.dirty = true
      })
      ry += 2
    }
    // Draw internal borders.
    for (let ry = 1, line; ry < self.rows.length * 2; ry++) {
      if (!( line = lines[yLo + ry] )) break
      rx = 0
      self._maxes.slice(0, -1).forEach(max => {
        rx += max
        if (!line[xLo + rx + 1]) return
        if (ry % 2 !== 0) {
          if (self.options.fillCellBorders) {
            const lineBackColor = ( ry <= 2 ? headAttr : cellAttr ) & 0x1ff
            rx++
            line[xLo + rx].at = ( borderAttr & ~0x1ff ) | lineBackColor
          }
          else {
            rx++
            line[xLo + rx].at = borderAttr
          }
          line[xLo + rx].ch = '\u2502' // '│'
          line.dirty = true
        }
        else {
          rx++
        }
      })
      rx = 1
      self._maxes.forEach(max => {
        while (max--) {
          if (ry % 2 === 0) {
            if (!line) break
            if (!line[xLo + rx + 1]) break
            if (self.options.fillCellBorders) {
              const lineBackColor = ( ry <= 2 ? headAttr : cellAttr ) & 0x1ff
              line[xLo + rx].at = ( borderAttr & ~0x1ff ) | lineBackColor
            }
            else {
              line[xLo + rx].at = borderAttr
            }
            line[xLo + rx].ch = '\u2500' // '─'
            line.dirty = true
          }
          rx++
        }
        rx++
      })
    }
    return coords
  }
}

/**
 * Expose
 */


