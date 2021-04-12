'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var componentsCore = require('@pres/components-core');

/**
 * text.js - text element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

const parseOptions = options => {
  options.shrink = true;
  return options;
};

class Text extends componentsCore.Element {
  /**
   * Text
   */
  constructor(options) {
    super(parseOptions(options));

    if (!(this instanceof componentsCore.Node)) {
      return new Text(options);
    }

    this.type = 'text';
  }

}

exports.Text = Text;
