/**
 * radioset.js - radio set element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Box } from '@pres/components-core'


export class RadioSet extends Box {
  /**
   * RadioSet
   */
  constructor(options = {}) {
    super(options)
    // if (!(this instanceof Node)) return new RadioSet(options)
    // Possibly inherit parent's style.
    // options.style = this.parent.style;
    this.type = 'radio-set'
  }
  static build(options) { return new RadioSet(options) }
}





