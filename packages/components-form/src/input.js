/**
 * input.js - abstract input element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Box } from '@pres/components-core'


export class Input extends Box {
  constructor(options = {}) {
    super(options)
    this.type = 'input'
  }
}






