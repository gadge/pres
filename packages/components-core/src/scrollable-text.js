/**
 * scrollabletext.js - scrollable text element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
import { ScrollableBox } from './scrollable-box'

export class ScrollableText extends ScrollableBox {
  type = 'scrollable-text'
  /**
   * ScrollableText
   */
  constructor(options = {}) {
    if (!options.sku) options.sku = 'scrollable-text'
    options.alwaysScroll = true
    super(options)
    // if (!(this instanceof Node)) return new ScrollableText(options)
  }
  static build(options) { return new ScrollableBox(options) }
}
