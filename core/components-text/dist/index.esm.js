import { List } from '@pres/components-data';
import { Element } from '@pres/components-core';

class LogList extends List {
  constructor(options) {
    if (!options.sku) options.sku = 'log-list'; // if (!(this instanceof Node)) { return new Log(options) }

    options.bufferLength = options.bufferLength || 30;
    super(options);
    this.logLines = [];
    this.interactive = false;
    this.type = 'log';
  }

  static build(options) {
    return new LogList(options);
  }

  log(str) {
    this.logLines.push(str);

    if (this.logLines.length > this.options.bufferLength) {
      this.logLines.shift();
    }

    this.setItems(this.logLines);
    this.scrollTo(this.logLines.length);
  }

}

/**
 * text.js - text element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Text extends Element {
  /**
   * Text
   */
  constructor(options = {}) {
    if (!options.sku) options.sku = 'text';
    options.shrink = true;
    super(options); // if (!(this instanceof Node)) return new Text(options)

    this.type = 'text';
  }

  static build(options) {
    return new Text(options);
  }

}

export { LogList, Text };
