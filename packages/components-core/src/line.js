/**
 * line.js - line element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import { Box }  from '../core/box'
import { Node } from '../core/node'

export class Line extends Box {
  /**
   * Line
   */
  constructor(options = {}) {
    super(parseOption(options))
    // if (!(this instanceof Node)) return new Line(options)
    const orientation = options.orientation || 'vertical'
    delete options.orientation
    this.ch = !options.type || options.type === 'line'
      ? orientation === 'horizontal' ? '─' : '│'
      : options.ch || ' '
    this.border = {
      type: 'bg',
      __proto__: this
    }
    this.style.border = this.style
    this.type = 'line'
  }
}

const parseOption = options => {
  if ((options.orientation || 'vertical') === 'vertical') {
    options.width = 1
  } else {
    options.height = 1
  }
  return options
}



