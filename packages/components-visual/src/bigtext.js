/**
 * bigtext.js - bigtext element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
import { Box } from '@pres/components-core'
import fs      from 'fs'

export class BigText extends Box {
  /**
   * BigText
   */
  constructor(options = {}) {
    super(options)
    // if (!(this instanceof Node)) { return new BigText(options) }
    options.font = options.font || __dirname + '/../fonts/ter-u14n.json'
    options.fontBold = options.font || __dirname + '/../fonts/ter-u14b.json'
    this.fch = options.fch
    this.ratio = {}
    this.font = this.loadFont(options.font)
    this.fontBold = this.loadFont(options.font)
    // super(options)
    if (this.style.bold) this.font = this.fontBold
    this.type = 'bigtext'
  }
  static build(options) { return new BigText(options) }
  loadFont(filename) {
    const self = this
    let data,
        font
    data = JSON.parse(fs.readFileSync(filename, 'utf8'))
    this.ratio.width = data.width
    this.ratio.height = data.height
    function convertLetter(ch, lines) {
      let line, i
      while (lines.length > self.ratio.height) {
        lines.shift()
        lines.pop()
      }
      lines = lines.map(function (line) {
        let chs = line.split('')
        chs = chs.map(function (ch) {
          return ch === ' ' ? 0 : 1
        })
        while (chs.length < self.ratio.width) {
          chs.push(0)
        }
        return chs
      })
      while (lines.length < self.ratio.height) {
        line = []
        for (i = 0; i < self.ratio.width; i++) {
          line.push(0)
        }
        lines.push(line)
      }
      return lines
    }
    font = Object.keys(data.glyphs).reduce(function (out, ch) {
      const lines = data.glyphs[ch].map
      out[ch] = convertLetter(ch, lines)
      return out
    }, {})
    delete font[' ']
    return font
  }
  setContent(content) {
    this.content = ''
    this.text = content || ''
  }
  render() {
    if (this.position.width == null || this._shrinkWidth) {
      // if (this.width - this.iwidth < this.ratio.width * this.text.length + 1) {
      this.position.width = this.ratio.width * this.text.length + 1
      this._shrinkWidth = true
      // }
    }
    if (this.position.height == null || this._shrinkHeight) {
      // if (this.height - this.iheight < this.ratio.height + 0) {
      this.position.height = this.ratio.height + 0
      this._shrinkHeight = true
      // }
    }
    const coords = this._render()
    if (!coords) return
    const lines  = this.screen.lines,
          left   = coords.xi + this.ileft,
          top    = coords.yi + this.itop,
          right  = coords.xl - this.iright,
          bottom = coords.yl - this.ibottom
    const normAttr = this.sattr(this.style),
          back     = normAttr & 0x1ff,
          fore     = ( normAttr >> 9 ) & 0x1ff,
          mode     = ( normAttr >> 18 ) & 0x1ff,
          currAttr = ( mode << 18 ) | ( back << 9 ) | fore
    let x = left, i = 0
    for (; x < right; x += this.ratio.width, i++) {
      const ch = this.text[i]
      if (!ch) break
      const map = this.font[ch]
      if (!map) continue
      for (let y = top; y < Math.min(bottom, top + this.ratio.height); y++) {
        if (!lines[y]) continue
        const mline = map[y - top]
        if (!mline) continue
        for (let mx = 0; mx < this.ratio.width; mx++) {
          const mcell = mline[mx]
          if (mcell == null) break
          if (this.fch && this.fch !== ' ') {
            lines[y][x + mx][0] = normAttr
            lines[y][x + mx].ch = mcell === 1 ? this.fch : this.ch
          }
          else {
            lines[y][x + mx][0] = mcell === 1 ? currAttr : normAttr
            lines[y][x + mx].ch = mcell === 1 ? ' ' : this.ch
          }
        }
        lines[y].dirty = true
      }
    }
    return coords
  }
}

/**
 * Expose
 */


