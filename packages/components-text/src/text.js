/**
 * text.js - text element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
import { Element, Node } from '@pres/components-core'

const parseOptions = options => {
  options.shrink = true
  return options
}
export class Text extends Element {
  /**
   * Text
   */
  constructor(options = {}) {
    super(parseOptions(options))
    if (!(this instanceof Node)) { return new Text(options) }
    this.type = 'text'
  }
}


