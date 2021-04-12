/**
 * scrollabletext.js - scrollable text element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
import { Node }          from '../core/node'
import { ScrollableBox } from './scrollablebox'

export class ScrollableText extends ScrollableBox {
  type = 'scrollable-text'
  /**
   * ScrollableText
   */
  constructor(options = {}) {
    options.alwaysScroll = true
    super(options)
    if (!(this instanceof Node)) return new ScrollableText(options)
  }
}
