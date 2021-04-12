/**
 * box.js - box element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Element } from './element'

/**
 * Modules
 */

export class Box extends Element {
  type = 'box'
  /**
   * Box
   */
  constructor(options = {}) {
    super(options) // if (!(this instanceof Node)) return new Box(options)
  }
  static build(options) { return new Box(options) }
}
