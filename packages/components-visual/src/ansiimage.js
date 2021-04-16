/**
 * ansiimage.js - render PNGS/GIFS as ANSI
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Box }     from '@pres/components-core'
import * as colors from '@pres/util-colors'
import cp          from 'child_process'
import { png }     from '../vendor/tng'

import { ATTACH, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEWLISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHTEXCEPTION, WARNING, } from '@pres/enum-events'

export class  ANSIImage extends Box {
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
      const lpos = self.lpos
      if (!lpos) return
      // prevent image from blending with itself if there are alpha channels
      self.screen.clearRegion(lpos.xi, lpos.xl, lpos.yi, lpos.yl)
    })

    this.on(DESTROY, function () {
      self.stop()
    })
    this.type = 'ansiimage'
  }
  setImage(file) {
    this.file = typeof file === 'string' ? file : null

    if (/^https?:/.test(file)) {
      file = ANSIImage.curl(file)
    }

    let width = this.position.width
    let height = this.position.height

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
      } else {
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
    const coords = this._render()
    if (!coords) return

    if (this.img && this.cellmap) {
      this.img.renderElement(this.cellmap, this)
    }

    return coords
  }
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
}


/**
 * Expose
 */


