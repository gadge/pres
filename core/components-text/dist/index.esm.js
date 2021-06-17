import { List } from '@pres/components-data';
import { Box, Element } from '@pres/components-core';
import chalk from 'chalk';
import marked from 'marked';
import TerminalRenderer from 'marked-terminal';

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

class Markdown extends Box {
  constructor(options) {
    // if (!(this instanceof Box)) { return new Markdown(options) }
    const markdownOptions = {
      style: options.markdownStyle
    };
    Markdown.prototype.evalStyles.call(null, markdownOptions);
    Markdown.prototype.setOptions.call(null, markdownOptions.style); // this.options = options

    super(options); // Mixin.assign(this, new Box(options)) // Box.call(this, options)

    if (options.markdown) this.setMarkdown(options.markdown);
    this.type = 'markdown';
  }

  static build(options) {
    return new Markdown(options);
  }

  setMarkdown(str) {
    this.setContent(marked(str));
  }

  setOptions(style) {
    marked.setOptions({
      renderer: new TerminalRenderer(style)
    });
  }

  evalStyles(options) {
    if (!options.style) return;

    for (let st in options.style) {
      if (typeof options.style[st] != 'string') continue;
      const tokens = options.style[st].split('.');
      options.style[st] = chalk;

      for (let j = 1; j < tokens.length; j++) {
        options.style[st] = options.style[st][tokens[j]];
      }
    }
  }

  getOptionsPrototype() {
    return {
      markdown: 'string',
      markdownStyle: 'object'
    };
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

const logList = options => new LogList(options);

const markdown = options => new Markdown(options);

const text = options => new Text(options);

export { LogList, Markdown, Text, logList, markdown, text };
