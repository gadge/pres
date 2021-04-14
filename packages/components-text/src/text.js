/**
 * text.js - text element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
import { Element } from '@pres/components-core'

export class Text extends Element {
  /**
   * Text
   */
  constructor(options = {}) {
    options.shrink = true
    super(options)
    // if (!(this instanceof Node)) return new Text(options)
    this.type = 'text'
  }
}


