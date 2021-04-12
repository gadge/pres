/**
 * input.js - abstract input element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
import { Box, Node } from '@pres/components-core'

export class Input extends Box {
  /**
   * Input
   */
  constructor(options = {}) {
    super(options)
    if (!(this instanceof Node)) return new Input(options)
    this.type = 'input'
  }
}






