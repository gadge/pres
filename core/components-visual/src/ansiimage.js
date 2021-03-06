/**
 * ansiimage.js - render PNGS/GIFS as ANSI
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Box }                 from '@pres/components-core'
import { DESTROY, PRERENDER, } from '@pres/enum-events'
import * as colors             from '@pres/util-blessed-colors'
import cp                      from 'child_process'
import { png }                 from '../vendor/tng'

export class ANSIImage extends Box {
  /**
   * ANSIImage
   */
  constructor(options = {}) {
    options.shrink = true
    super(options)
    const self = this
    // if (!(this instanceof Node)) { return new ANSIImage(options) }
    this.scale = this.options.scale || 1.0
    this.options.animate = this.options.animate !== false
    this._noFill = true
    if (this.options.file) {
      this.setImage(this.options.file)
    }
    this.screen.on(PRERENDER, function () {
      const prevPos = self.prevPos
      if (!prevPos) return
      // prevent image from blending with itself if there are alpha channels
      self.screen.clearRegion(prevPos.xLo, prevPos.xHi, prevPos.yLo, prevPos.yHi)
    })
    this.on(DESTROY, function () {
      self.stop()
    })
    this.type = 'ansiimage'
  }
  static build(options) { return new ANSIImage(options) }
  static curl(url) {
    try {
      return cp.execFileSync('curl',
        [ '-s', '-A', '', url ],
        { stdio: [ 'ignore', 'pipe', 'ignore' ] })
    } catch (e) {

    }
    try {
      return cp.execFileSync('wget',
        [ '-U', '', '-O', '-', url ],
        { stdio: [ 'ignore', 'pipe', 'ignore' ] })
    } catch (e) {

    }
    throw new Error('curl or wget failed.')
  }
  setImage(file) {
    this.file = typeof file === 'string' ? file : null
    if (/^https?:/.test(file)) {
      file = ANSIImage.curl(file)
    }
    let width = this.pos.width
    let height = this.pos.height
    if (width != null) {
      width = this.width
    }
    if (height != null) {
      height = this.height
    }
    try {
      this.setContent('')
      this.img = png(file, {
        colors: colors,
        width: width,
        height: height,
        scale: this.scale,
        ascii: this.options.ascii,
        speed: this.options.speed,
        filename: this.file
      })
      if (width == null || height == null) {
        this.width = this.img.cellmap[0].length
        this.height = this.img.cellmap.length
      }
      if (this.img.frames && this.options.animate) {
        this.play()
      }
      else {
        this.cellmap = this.img.cellmap
      }
    } catch (e) {
      this.setContent('Image Error: ' + e.message)
      this.img = null
      this.cellmap = null
    }
  }
  play() {
    const self = this
    if (!this.img) return
    return this.img.play(function (bmp, cellmap) {
      self.cellmap = cellmap
      self.screen.render()
    })
  }
  pause() {
    if (!this.img) return
    return this.img.pause()
  }
  stop() {
    if (!this.img) return
    return this.img.stop()
  }
  clearImage() {
    this.stop()
    this.setContent('')
    this.img = null
    this.cellmap = null
  }
  render() {
    const coords = this.renderElement()
    if (!coords) return
    if (this.img && this.cellmap) {
      this.img.renderElement(this.cellmap, this)
    }
    return coords
  }
}

/**
 * Expose
 */


