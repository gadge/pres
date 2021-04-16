/**
 * image.js - image element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
import * as Mixin    from '@ject/mixin'
import { Box }       from '@pres/components-core'
import { ANSIImage } from './ansiimage'

import { OverlayImage } from './overlayimage'

export class Image extends Box {
  /**
   * Image
   */
  constructor(options = {}) {
    options.type = options.itype || options.type || 'ansi'
    super(options)
    // if (!(this instanceof Node)) { return new Image(options) }
    if (options.type === 'ansi' && this.type !== 'ansiimage') {
      Object.getOwnPropertyNames(ANSIImage.prototype).forEach(function (key) {
        if (key === 'type') return
        Object.defineProperty(this, key,
          Object.getOwnPropertyDescriptor(ANSIImage.prototype, key))
      }, this)
      Mixin.assign(this, new ANSIImage(options))
      // ANSIImage.call(this, options)
      return this
    }

    if (options.type === 'overlay' && this.type !== 'overlayimage') {
      Object.getOwnPropertyNames(OverlayImage.prototype).forEach(function (key) {
        if (key === 'type') return
        Object.defineProperty(this, key,
          Object.getOwnPropertyDescriptor(OverlayImage.prototype, key))
      }, this)
      Mixin.assign(this, new OverlayImage(options)) // OverlayImage.call(this, options)
      return this
    }

    throw new Error('`type` must either be `ansi` or `overlay`.')
    this.type = 'image'
  }
}


/**
 * Expose
 */


