'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var componentsCore = require('@pres/components-core');
var componentsText = require('@pres/components-text');
var componentsForm = require('@pres/components-form');

/**
 * loading.js - loading element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Loading extends componentsCore.Box {
  /**
   * Loading
   */
  constructor(options = {}) {
    super(options);

    if (!(this instanceof componentsCore.Node)) {
      return new Loading(options);
    }

    this._.icon = new componentsText.Text({
      parent: this,
      align: 'center',
      top: 2,
      left: 1,
      right: 1,
      height: 1,
      content: '|'
    });
    this.type = 'loading';
  }

  load(text) {
    const self = this; // XXX Keep above:
    // var parent = this.parent;
    // this.detach();
    // parent.append(this);

    this.show();
    this.setContent(text);

    if (this._.timer) {
      this.stop();
    }

    this.screen.lockKeys = true;
    this._.timer = setInterval(function () {
      if (self._.icon.content === '|') {
        self._.icon.setContent('/');
      } else if (self._.icon.content === '/') {
        self._.icon.setContent('-');
      } else if (self._.icon.content === '-') {
        self._.icon.setContent('\\');
      } else if (self._.icon.content === '\\') {
        self._.icon.setContent('|');
      }

      self.screen.render();
    }, 200);
  }

  stop() {
    this.screen.lockKeys = false;
    this.hide();

    if (this._.timer) {
      clearInterval(this._.timer);
      delete this._.timer;
    }

    this.screen.render();
  }

}
/**
 * Expose
 */

/**
 * message.js - message element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

const parseOptions = options => {
  options.tags = true;
  return options;
};

class Message extends componentsCore.Box {
  /**
   * Message / Error
   */
  constructor(options = {}) {
    super(parseOptions(options));
    this.log = this.display;

    if (!(this instanceof componentsCore.Node)) {
      return new Message(options);
    }

    this.type = 'message';
  }

  display(text, time, callback) {
    const self = this;

    if (typeof time === 'function') {
      callback = time;
      time = null;
    }

    if (time == null) time = 3; // Keep above:
    // var parent = this.parent;
    // this.detach();
    // parent.append(this);

    if (this.scrollable) {
      this.screen.saveFocus();
      this.focus();
      this.scrollTo(0);
    }

    this.show();
    this.setContent(text);
    this.screen.render();

    if (time === Infinity || time === -1 || time === 0) {
      const end = function () {
        if (end.done) return;
        end.done = true;

        if (self.scrollable) {
          try {
            self.screen.restoreFocus();
          } catch (e) {}
        }

        self.hide();
        self.screen.render();
        if (callback) callback();
      };

      setTimeout(function () {
        self.onScreenEvent('keypress', function fn(ch, key) {
          if (key.name === 'mouse') return;

          if (self.scrollable) {
            if (key.name === 'up' || self.options.vi && key.name === 'k' || key.name === 'down' || self.options.vi && key.name === 'j' || self.options.vi && key.name === 'u' && key.ctrl || self.options.vi && key.name === 'd' && key.ctrl || self.options.vi && key.name === 'b' && key.ctrl || self.options.vi && key.name === 'f' && key.ctrl || self.options.vi && key.name === 'g' && !key.shift || self.options.vi && key.name === 'g' && key.shift) {
              return;
            }
          }

          if (self.options.ignoreKeys && ~self.options.ignoreKeys.indexOf(key.name)) {
            return;
          }

          self.removeScreenEvent('keypress', fn);
          end();
        }); // XXX May be affected by new element.options.mouse option.

        if (!self.options.mouse) return;
        self.onScreenEvent('mouse', function fn(data) {
          if (data.action === 'mousemove') return;
          self.removeScreenEvent('mouse', fn);
          end();
        });
      }, 10);
      return;
    }

    setTimeout(function () {
      self.hide();
      self.screen.render();
      if (callback) callback();
    }, time * 1000);
  }

  error(text, time, callback) {
    return this.display('{red-fg}Error: ' + text + '{/red-fg}', time, callback);
  }

}
/**
 * Expose
 */

/**
 * progressbar.js - progress bar element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
/**
 * ProgressBar
 */

class ProgressBar extends componentsForm.Input {
  constructor(options = {}) {
    super(options);
    const self = this;

    if (!(this instanceof componentsCore.Node)) {
      return new ProgressBar(options);
    }

    this.filled = options.filled || 0;

    if (typeof this.filled === 'string') {
      this.filled = +this.filled.slice(0, -1);
    }

    this.value = this.filled;
    this.pch = options.pch || ' '; // XXX Workaround that predates the usage of `el.ch`.

    if (options.ch) {
      this.pch = options.ch;
      this.ch = ' ';
    }

    if (options.bch) {
      this.ch = options.bch;
    }

    if (!this.style.bar) {
      this.style.bar = {};
      this.style.bar.fg = options.barFg;
      this.style.bar.bg = options.barBg;
    }

    this.orientation = options.orientation || 'horizontal';

    if (options.keys) {
      this.on('keypress', function (ch, key) {
        let back, forward;

        if (self.orientation === 'horizontal') {
          back = ['left', 'h'];
          forward = ['right', 'l'];
        } else if (self.orientation === 'vertical') {
          back = ['down', 'j'];
          forward = ['up', 'k'];
        }

        if (key.name === back[0] || options.vi && key.name === back[1]) {
          self.progress(-5);
          self.screen.render();
          return;
        }

        if (key.name === forward[0] || options.vi && key.name === forward[1]) {
          self.progress(5);
          self.screen.render();
        }
      });
    }

    if (options.mouse) {
      this.on('click', function (data) {
        let x, y, m, p;
        if (!self.lpos) return;

        if (self.orientation === 'horizontal') {
          x = data.x - self.lpos.xi;
          m = self.lpos.xl - self.lpos.xi - self.iwidth;
          p = x / m * 100 | 0;
        } else if (self.orientation === 'vertical') {
          y = data.y - self.lpos.yi;
          m = self.lpos.yl - self.lpos.yi - self.iheight;
          p = y / m * 100 | 0;
        }

        self.setProgress(p);
      });
    }

    this.type = 'progress-bar';
  }

  render() {
    const ret = this._render();

    if (!ret) return;
    let xi = ret.xi,
        xl = ret.xl,
        yi = ret.yi,
        yl = ret.yl,
        dattr;
    if (this.border) xi++, yi++, xl--, yl--;

    if (this.orientation === 'horizontal') {
      xl = xi + (xl - xi) * (this.filled / 100) | 0;
    } else if (this.orientation === 'vertical') {
      yi = yi + (yl - yi - ((yl - yi) * (this.filled / 100) | 0));
    }

    dattr = this.sattr(this.style.bar);
    this.screen.fillRegion(dattr, this.pch, xi, xl, yi, yl);

    if (this.content) {
      const line = this.screen.lines[yi];

      for (let i = 0; i < this.content.length; i++) {
        line[xi + i][1] = this.content[i];
      }

      line.dirty = true;
    }

    return ret;
  }

  progress(filled) {
    this.filled += filled;
    if (this.filled < 0) this.filled = 0;else if (this.filled > 100) this.filled = 100;

    if (this.filled === 100) {
      this.emit('complete');
    }

    this.value = this.filled;
  }

  setProgress(filled) {
    this.filled = 0;
    this.progress(filled);
  }

  reset() {
    this.emit('reset');
    this.filled = 0;
    this.value = this.filled;
  }

}

exports.Loading = Loading;
exports.Message = Message;
exports.ProgressBar = ProgressBar;
