/**
 * image.js - image element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
import { Box, Node } from '@pres/components-core'

const parseOptions = options => {
  options.type = options.itype || options.type || 'ansi'
  return options
}
export class Image extends Box {
  /**
   * Image
   */
  constructor(options = {}) {
    super(parseOptions(options))
    if (!(this instanceof Node)) { return new Image(options) }
    if (options.type === 'ansi' && this.type !== 'ansiimage') {
      const ANSIImage = require('./ansiimage')
      Object.getOwnPropertyNames(ANSIImage.prototype).forEach(function (key) {
        if (key === 'type') return
        Object.defineProperty(this, key,
          Object.getOwnPropertyDescriptor(ANSIImage.prototype, key))
      }, this)
      ANSIImage.call(this, options)
      return this
    }

    if (options.type === 'overlay' && this.type !== 'overlayimage') {
      const OverlayImage = require('./overlayimage')
      Object.getOwnPropertyNames(OverlayImage.prototype).forEach(function (key) {
        if (key === 'type') return
        Object.defineProperty(this, key,
          Object.getOwnPropertyDescriptor(OverlayImage.prototype, key))
      }, this)
      OverlayImage.call(this, options)
      return this
    }

    throw new Error('`type` must either be `ansi` or `overlay`.')
    this.type = 'image';
  }
}


/**
 * Expose
 */


