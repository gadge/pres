/**
 * box.js - box element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import * as mixin  from '@ject/mixin'
import { Element } from './element'
import { Scroll }  from './scroll'

/**
 * Box
 */
export class Box extends Element {
  type = 'box'
  constructor(options = {}) {
    super(options) // // if (!(this instanceof Node)) return new Box(options)
    if (options.scrollable) {
      // console.log(Reflect.ownKeys(Scrollable.prototype))
      mixin.assign(this, Scroll.prototype)
      Scroll.prototype.config.call(this, options)
      console.log('>> [Scroll.prototype.config]', this.codename)
    }
  }
  static build(options) { return new Box(options) }
}
