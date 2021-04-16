'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var componentsCore = require('@pres/components-core');

/**
 * text.js - text element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Text extends componentsCore.Element {
  /**
   * Text
   */
  constructor(options = {}) {
    options.shrink = true;
    super(options); // if (!(this instanceof Node)) return new Text(options)

    this.type = 'text';
  }

}

exports.Text = Text;
