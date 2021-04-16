import { Box, Node } from '@pres/components-core';
import { ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, KEYPRESS, RESIZE, ADOPT, REMOVE, CLICK, ACTION, SELECT, CREATE_ITEM, ADD_ITEM, REMOVE_ITEM, INSERT_ITEM, SET_ITEMS, SELECT_ITEM, CANCEL, FOCUS, SELECT_TAB, ATTACH, SCROLL } from '@pres/enum-events';
import { helpers } from '@pres/util-helpers';

/**
 * list.js - list element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class List extends Box {
  /**
   * List
   */
  constructor(options = {}) {
    options.ignoreKeys = true; // Possibly put this here: this.items = [];

    options.scrollable = true;
    super(options);
    this.add = this.appendItem;
    this.addItem = this.appendItem;
    this.find = this.fuzzyFind;
    const self = this; // if (!(this instanceof Node)) return new List(options)

    options.ignoreKeys = true; // Possibly put this here: this.items = [];

    options.scrollable = true;
    this.value = '';
    this.items = [];
    this.ritems = [];
    this.selected = 0;
    this._isList = true;

    if (!this.style.selected) {
      this.style.selected = {};
      this.style.selected.bg = options.selectedBg;
      this.style.selected.fg = options.selectedFg;
      this.style.selected.bold = options.selectedBold;
      this.style.selected.underline = options.selectedUnderline;
      this.style.selected.blink = options.selectedBlink;
      this.style.selected.inverse = options.selectedInverse;
      this.style.selected.invisible = options.selectedInvisible;
    }

    if (!this.style.item) {
      this.style.item = {};
      this.style.item.bg = options.itemBg;
      this.style.item.fg = options.itemFg;
      this.style.item.bold = options.itemBold;
      this.style.item.underline = options.itemUnderline;
      this.style.item.blink = options.itemBlink;
      this.style.item.inverse = options.itemInverse;
      this.style.item.invisible = options.itemInvisible;
    } // Legacy: for apps written before the addition of item attributes.


    ['bg', 'fg', 'bold', 'underline', 'blink', 'inverse', 'invisible'].forEach(function (name) {
      if (self.style[name] != null && self.style.item[name] == null) {
        self.style.item[name] = self.style[name];
      }
    });

    if (this.options.itemHoverBg) {
      this.options.itemHoverEffects = {
        bg: this.options.itemHoverBg
      };
    }

    if (this.options.itemHoverEffects) {
      this.style.item.hover = this.options.itemHoverEffects;
    }

    if (this.options.itemFocusEffects) {
      this.style.item.focus = this.options.itemFocusEffects;
    }

    this.interactive = options.interactive !== false;
    this.mouse = options.mouse || false;

    if (options.items) {
      this.ritems = options.items;
      options.items.forEach(this.add.bind(this));
    }

    this.select(0);

    if (options.mouse) {
      this.screen._listenMouse(this);

      this.on(ELEMENT_WHEELDOWN, function () {
        self.select(self.selected + 2);
        self.screen.render();
      });
      this.on(ELEMENT_WHEELUP, function () {
        self.select(self.selected - 2);
        self.screen.render();
      });
    }

    if (options.keys) {
      this.on(KEYPRESS, function (ch, key) {
        if (key.name === 'up' || options.vi && key.name === 'k') {
          self.up();
          self.screen.render();
          return;
        }

        if (key.name === 'down' || options.vi && key.name === 'j') {
          self.down();
          self.screen.render();
          return;
        }

        if (key.name === 'enter' || options.vi && key.name === 'l' && !key.shift) {
          self.enterSelected();
          return;
        }

        if (key.name === 'escape' || options.vi && key.name === 'q') {
          self.cancelSelected();
          return;
        }

        if (options.vi && key.name === 'u' && key.ctrl) {
          self.move(-((self.height - self.iheight) / 2) | 0);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'd' && key.ctrl) {
          self.move((self.height - self.iheight) / 2 | 0);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'b' && key.ctrl) {
          self.move(-(self.height - self.iheight));
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'f' && key.ctrl) {
          self.move(self.height - self.iheight);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'h' && key.shift) {
          self.move(self.childBase - self.selected);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'm' && key.shift) {
          // TODO: Maybe use Math.min(this.items.length,
          // ... for calculating visible items elsewhere.
          const visible = Math.min(self.height - self.iheight, self.items.length) / 2 | 0;
          self.move(self.childBase + visible - self.selected);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'l' && key.shift) {
          // XXX This goes one too far on lists with an odd number of items.
          self.down(self.childBase + Math.min(self.height - self.iheight, self.items.length) - self.selected);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'g' && !key.shift) {
          self.select(0);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'g' && key.shift) {
          self.select(self.items.length - 1);
          self.screen.render();
          return;
        }

        if (options.vi && (key.ch === '/' || key.ch === '?')) {
          if (typeof self.options.search !== 'function') {
            return;
          }

          return self.options.search(function (err, value) {
            if (typeof err === 'string' || typeof err === 'function' || typeof err === 'number' || err && err.test) {
              value = err;
              err = null;
            }

            if (err || !value) return self.screen.render();
            self.select(self.fuzzyFind(value, key.ch === '?'));
            self.screen.render();
          });
        }
      });
    }

    this.on(RESIZE, function () {
      const visible = self.height - self.iheight; // if (self.selected < visible - 1) {

      if (visible >= self.selected + 1) {
        self.childBase = 0;
        self.childOffset = self.selected;
      } else {
        // Is this supposed to be: self.childBase = visible - self.selected + 1; ?
        self.childBase = self.selected - visible + 1;
        self.childOffset = visible - 1;
      }
    });
    this.on(ADOPT, function (el) {
      if (!~self.items.indexOf(el)) {
        el.fixed = true;
      }
    }); // Ensure children are removed from the
    // item list if they are items.

    this.on(REMOVE, function (el) {
      self.removeItem(el);
    });
    this.type = 'list';
  }

  createItem(content) {
    const self = this; // Note: Could potentially use Button here.

    const options = {
      screen: this.screen,
      content: content,
      align: this.align || 'left',
      top: 0,
      left: 0,
      right: this.scrollbar ? 1 : 0,
      tags: this.parseTags,
      height: 1,
      hoverEffects: this.mouse ? this.style.item.hover : null,
      focusEffects: this.mouse ? this.style.item.focus : null,
      autoFocus: false
    };

    if (!this.screen.autoPadding) {
      options.top = 1;
      options.left = this.ileft;
      options.right = this.iright + (this.scrollbar ? 1 : 0);
    } // if (this.shrink) {
    // XXX NOTE: Maybe just do this on all shrinkage once autoPadding is default?


    if (this.shrink && this.options.normalShrink) {
      delete options.right;
      options.width = 'shrink';
    }

    ['bg', 'fg', 'bold', 'underline', 'blink', 'inverse', 'invisible'].forEach(function (name) {
      options[name] = function () {
        let attr = self.items[self.selected] === item && self.interactive ? self.style.selected[name] : self.style.item[name];
        if (typeof attr === 'function') attr = attr(item);
        return attr;
      };
    });

    if (this.style.transparent) {
      options.transparent = true;
    }

    var item = new Box(options);

    if (this.mouse) {
      item.on(CLICK, function () {
        self.focus();

        if (self.items[self.selected] === item) {
          self.emit(ACTION, item, self.selected);
          self.emit(SELECT, item, self.selected);
          return;
        }

        self.select(item);
        self.screen.render();
      });
    }

    this.emit(CREATE_ITEM);
    return item;
  }

  appendItem(content) {
    content = typeof content === 'string' ? content : content.getContent();
    const item = this.createItem(content);
    item.position.top = this.items.length;

    if (!this.screen.autoPadding) {
      item.position.top = this.itop + this.items.length;
    }

    this.ritems.push(content);
    this.items.push(item);
    this.append(item);

    if (this.items.length === 1) {
      this.select(0);
    }

    this.emit(ADD_ITEM);
    return item;
  }

  removeItem(child) {
    const i = this.getItemIndex(child);

    if (~i && this.items[i]) {
      child = this.items.splice(i, 1)[0];
      this.ritems.splice(i, 1);
      this.remove(child);

      for (let j = i; j < this.items.length; j++) {
        this.items[j].position.top--;
      }

      if (i === this.selected) {
        this.select(i - 1);
      }
    }

    this.emit(REMOVE_ITEM);
    return child;
  }

  insertItem(child, content) {
    content = typeof content === 'string' ? content : content.getContent();
    const i = this.getItemIndex(child);
    if (!~i) return;
    if (i >= this.items.length) return this.appendItem(content);
    const item = this.createItem(content);

    for (let j = i; j < this.items.length; j++) {
      this.items[j].position.top++;
    }

    item.position.top = i + (!this.screen.autoPadding ? 1 : 0);
    this.ritems.splice(i, 0, content);
    this.items.splice(i, 0, item);
    this.append(item);

    if (i === this.selected) {
      this.select(i + 1);
    }

    this.emit(INSERT_ITEM);
  }

  getItem(child) {
    return this.items[this.getItemIndex(child)];
  }

  setItem(child, content) {
    content = typeof content === 'string' ? content : content.getContent();
    const i = this.getItemIndex(child);
    if (!~i) return;
    this.items[i].setContent(content);
    this.ritems[i] = content;
  }

  clearItems() {
    return this.setItems([]);
  }

  setItems(items) {
    const original = this.items.slice(),
          selected = this.selected;
    let sel = this.ritems[this.selected],
        i = 0;
    items = items.slice();
    this.select(0);

    for (; i < items.length; i++) {
      if (this.items[i]) {
        this.items[i].setContent(items[i]);
      } else {
        this.add(items[i]);
      }
    }

    for (; i < original.length; i++) {
      this.remove(original[i]);
    }

    this.ritems = items; // Try to find our old item if it still exists.

    sel = items.indexOf(sel);

    if (~sel) {
      this.select(sel);
    } else if (items.length === original.length) {
      this.select(selected);
    } else {
      this.select(Math.min(selected, items.length - 1));
    }

    this.emit(SET_ITEMS);
  }

  pushItem(content) {
    this.appendItem(content);
    return this.items.length;
  }

  popItem() {
    return this.removeItem(this.items.length - 1);
  }

  unshiftItem(content) {
    this.insertItem(0, content);
    return this.items.length;
  }

  shiftItem() {
    return this.removeItem(0);
  }

  spliceItem(child, n) {
    const self = this;
    let i = this.getItemIndex(child);
    if (!~i) return;
    const items = Array.prototype.slice.call(arguments, 2);
    const removed = [];

    while (n--) {
      removed.push(this.removeItem(i));
    }

    items.forEach(function (item) {
      self.insertItem(i++, item);
    });
    return removed;
  }

  fuzzyFind(search, back) {
    const start = this.selected + (back ? -1 : 1);
    let i;
    if (typeof search === 'number') search += '';

    if (search && search[0] === '/' && search[search.length - 1] === '/') {
      try {
        search = new RegExp(search.slice(1, -1));
      } catch (e) {}
    }

    const test = typeof search === 'string' ? function (item) {
      return !!~item.indexOf(search);
    } : search.test ? search.test.bind(search) : search;

    if (typeof test !== 'function') {
      if (this.screen.options.debug) {
        throw new Error('fuzzyFind(): `test` is not a function.');
      }

      return this.selected;
    }

    if (!back) {
      for (i = start; i < this.ritems.length; i++) {
        if (test(helpers.cleanTags(this.ritems[i]))) return i;
      }

      for (i = 0; i < start; i++) {
        if (test(helpers.cleanTags(this.ritems[i]))) return i;
      }
    } else {
      for (i = start; i >= 0; i--) {
        if (test(helpers.cleanTags(this.ritems[i]))) return i;
      }

      for (i = this.ritems.length - 1; i > start; i--) {
        if (test(helpers.cleanTags(this.ritems[i]))) return i;
      }
    }

    return this.selected;
  }

  getItemIndex(child) {
    if (typeof child === 'number') {
      return child;
    } else if (typeof child === 'string') {
      let i = this.ritems.indexOf(child);
      if (~i) return i;

      for (i = 0; i < this.ritems.length; i++) {
        if (helpers.cleanTags(this.ritems[i]) === child) {
          return i;
        }
      }

      return -1;
    } else {
      return this.items.indexOf(child);
    }
  }

  select(index) {
    if (!this.interactive) {
      return;
    }

    if (!this.items.length) {
      this.selected = 0;
      this.value = '';
      this.scrollTo(0);
      return;
    }

    if (typeof index === 'object') {
      index = this.items.indexOf(index);
    }

    if (index < 0) {
      index = 0;
    } else if (index >= this.items.length) {
      index = this.items.length - 1;
    }

    if (this.selected === index && this._listInitialized) return;
    this._listInitialized = true;
    this.selected = index;
    this.value = helpers.cleanTags(this.ritems[this.selected]);
    if (!this.parent) return;
    this.scrollTo(this.selected); // XXX Move `action` and `select` events here.

    this.emit(SELECT_ITEM, this.items[this.selected], this.selected);
  }

  move(offset) {
    this.select(this.selected + offset);
  }

  up(offset) {
    this.move(-(offset || 1));
  }

  down(offset) {
    this.move(offset || 1);
  }

  pick(label, callback) {
    if (!callback) {
      callback = label;
      label = null;
    }

    if (!this.interactive) {
      return callback();
    }

    const self = this;
    const focused = this.screen.focused;
    if (focused && focused._done) focused._done('stop');
    this.screen.saveFocus(); // XXX Keep above:
    // var parent = this.parent;
    // this.detach();
    // parent.append(this);

    this.focus();
    this.show();
    this.select(0);
    if (label) this.setLabel(label);
    this.screen.render();
    this.once(ACTION, function (el, selected) {
      if (label) self.removeLabel();
      self.screen.restoreFocus();
      self.hide();
      self.screen.render();
      if (!el) return callback();
      return callback(null, helpers.cleanTags(self.ritems[selected]));
    });
  }

  enterSelected(i) {
    if (i != null) this.select(i);
    this.emit(ACTION, this.items[this.selected], this.selected);
    this.emit(SELECT, this.items[this.selected], this.selected);
  }

  cancelSelected(i) {
    if (i != null) this.select(i);
    this.emit(ACTION);
    this.emit(CANCEL);
  }

}

/**
 * listbar.js - listbar element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Listbar extends Box {
  /**
   * Listbar / HorizontalList
   */
  constructor(options = {}) {
    super(options);
    const self = this; // if (!(this instanceof Node)) return new Listbar(options)

    this.items = [];
    this.ritems = [];
    this.commands = [];
    this.leftBase = 0;
    this.leftOffset = 0;
    this.mouse = options.mouse || false; // super(options)

    if (!this.style.selected) this.style.selected = {};
    if (!this.style.item) this.style.item = {};
    if (options.commands || options.items) this.setItems(options.commands || options.items);

    if (options.keys) {
      this.on(KEYPRESS, function (ch, key) {
        if (key.name === 'left' || options.vi && key.name === 'h' || key.shift && key.name === 'tab') {
          self.moveLeft();
          self.screen.render(); // Stop propagation if we're in a form.

          if (key.name === 'tab') return false;
          return;
        }

        if (key.name === 'right' || options.vi && key.name === 'l' || key.name === 'tab') {
          self.moveRight();
          self.screen.render(); // Stop propagation if we're in a form.

          if (key.name === 'tab') return false;
          return;
        }

        if (key.name === 'enter' || options.vi && key.name === 'k' && !key.shift) {
          self.emit(ACTION, self.items[self.selected], self.selected);
          self.emit(SELECT, self.items[self.selected], self.selected);
          const item = self.items[self.selected];

          if (item._.cmd.callback) {
            item._.cmd.callback();
          }

          self.screen.render();
          return;
        }

        if (key.name === 'escape' || options.vi && key.name === 'q') {
          self.emit(ACTION);
          self.emit(CANCEL);
        }
      });
    }

    if (options.autoCommandKeys) {
      this.onScreenEvent(KEYPRESS, function (ch) {
        if (/^[0-9]$/.test(ch)) {
          let i = +ch - 1;
          if (!~i) i = 9;
          return self.selectTab(i);
        }
      });
    }

    this.on(FOCUS, function () {
      self.select(self.selected);
    });
    this.type = 'listbar';
    this.add = Listbar.prototype.appendItem;
    this.addItem = Listbar.prototype.appendItem;
  }

  get selected() {
    return this.leftBase + this.leftOffset;
  }

  setItems(commands) {
    const self = this;

    if (!Array.isArray(commands)) {
      commands = Object.keys(commands).reduce(function (obj, key, i) {
        let cmd = commands[key],
            cb;

        if (typeof cmd === 'function') {
          cb = cmd;
          cmd = {
            callback: cb
          };
        }

        if (cmd.text == null) cmd.text = key;
        if (cmd.prefix == null) cmd.prefix = ++i + '';

        if (cmd.text == null && cmd.callback) {
          cmd.text = cmd.callback.name;
        }

        obj.push(cmd);
        return obj;
      }, []);
    }

    this.items.forEach(function (el) {
      el.detach();
    });
    this.items = [];
    this.ritems = [];
    this.commands = [];
    commands.forEach(function (cmd) {
      self.add(cmd);
    });
    this.emit(SET_ITEMS);
  }

  appendItem(item, callback) {
    const self = this,
          prev = this.items[this.items.length - 1];
    let drawn, cmd, title, len;

    if (!this.parent) {
      drawn = 0;
    } else {
      drawn = prev ? prev.aleft + prev.width : 0;

      if (!this.screen.autoPadding) {
        drawn += this.ileft;
      }
    }

    if (typeof item === 'object') {
      cmd = item;
      if (cmd.prefix == null) cmd.prefix = this.items.length + 1 + '';
    }

    if (typeof item === 'string') {
      cmd = {
        prefix: this.items.length + 1 + '',
        text: item,
        callback: callback
      };
    }

    if (typeof item === 'function') {
      cmd = {
        prefix: this.items.length + 1 + '',
        text: item.name,
        callback: item
      };
    }

    if (cmd.keys && cmd.keys[0]) {
      cmd.prefix = cmd.keys[0];
    }

    const t = helpers.generateTags(this.style.prefix || {
      fg: 'lightblack'
    });
    title = (cmd.prefix != null ? t.open + cmd.prefix + t.close + ':' : '') + cmd.text;
    len = ((cmd.prefix != null ? cmd.prefix + ':' : '') + cmd.text).length;
    const options = {
      screen: this.screen,
      top: 0,
      left: drawn + 1,
      height: 1,
      content: title,
      width: len + 2,
      align: 'center',
      autoFocus: false,
      tags: true,
      mouse: true,
      style: helpers.merge({}, this.style.item),
      noOverflow: true
    };

    if (!this.screen.autoPadding) {
      options.top += this.itop;
      options.left += this.ileft;
    }

    ['bg', 'fg', 'bold', 'underline', 'blink', 'inverse', 'invisible'].forEach(function (name) {
      options.style[name] = function () {
        let attr = self.items[self.selected] === el ? self.style.selected[name] : self.style.item[name];
        if (typeof attr === 'function') attr = attr(el);
        return attr;
      };
    });
    var el = new Box(options);
    this._[cmd.text] = el;
    cmd.element = el;
    el._.cmd = cmd;
    this.ritems.push(cmd.text);
    this.items.push(el);
    this.commands.push(cmd);
    this.append(el);

    if (cmd.callback) {
      if (cmd.keys) {
        this.screen.key(cmd.keys, function () {
          self.emit(ACTION, el, self.selected);
          self.emit(SELECT, el, self.selected);

          if (el._.cmd.callback) {
            el._.cmd.callback();
          }

          self.select(el);
          self.screen.render();
        });
      }
    }

    if (this.items.length === 1) {
      this.select(0);
    } // XXX May be affected by new element.options.mouse option.


    if (this.mouse) {
      el.on(CLICK, function () {
        self.emit(ACTION, el, self.selected);
        self.emit(SELECT, el, self.selected);

        if (el._.cmd.callback) {
          el._.cmd.callback();
        }

        self.select(el);
        self.screen.render();
      });
    }

    this.emit(ADD_ITEM);
  }

  render() {
    const self = this;
    let drawn = 0;

    if (!this.screen.autoPadding) {
      drawn += this.ileft;
    }

    this.items.forEach(function (el, i) {
      if (i < self.leftBase) {
        el.hide();
      } else {
        el.rleft = drawn + 1;
        drawn += el.width + 2;
        el.show();
      }
    });
    return this._render();
  }

  select(offset) {
    if (typeof offset !== 'number') {
      offset = this.items.indexOf(offset);
    }

    if (offset < 0) {
      offset = 0;
    } else if (offset >= this.items.length) {
      offset = this.items.length - 1;
    }

    if (!this.parent) {
      this.emit(SELECT_ITEM, this.items[offset], offset);
      return;
    }

    const lpos = this._getCoords();

    if (!lpos) return;
    const self = this,
          width = lpos.xl - lpos.xi - this.iwidth;
    let drawn = 0,
        visible = 0,
        el;
    el = this.items[offset];
    if (!el) return;
    this.items.forEach(function (el, i) {
      if (i < self.leftBase) return;

      const lpos = el._getCoords();

      if (!lpos) return;
      if (lpos.xl - lpos.xi <= 0) return;
      drawn += lpos.xl - lpos.xi + 2;
      if (drawn <= width) visible++;
    });
    let diff = offset - (this.leftBase + this.leftOffset);

    if (offset > this.leftBase + this.leftOffset) {
      if (offset > this.leftBase + visible - 1) {
        this.leftOffset = 0;
        this.leftBase = offset;
      } else {
        this.leftOffset += diff;
      }
    } else if (offset < this.leftBase + this.leftOffset) {
      diff = -diff;

      if (offset < this.leftBase) {
        this.leftOffset = 0;
        this.leftBase = offset;
      } else {
        this.leftOffset -= diff;
      }
    } // XXX Move `action` and `select` events here.


    this.emit(SELECT_ITEM, el, offset);
  }

  removeItem(child) {
    const i = typeof child !== 'number' ? this.items.indexOf(child) : child;

    if (~i && this.items[i]) {
      child = this.items.splice(i, 1)[0];
      this.ritems.splice(i, 1);
      this.commands.splice(i, 1);
      this.remove(child);

      if (i === this.selected) {
        this.select(i - 1);
      }
    }

    this.emit(REMOVE_ITEM);
  }

  move(offset) {
    this.select(this.selected + offset);
  }

  moveLeft(offset) {
    this.move(-(offset || 1));
  }

  moveRight(offset) {
    this.move(offset || 1);
  }

  selectTab(index) {
    const item = this.items[index];

    if (item) {
      if (item._.cmd.callback) {
        item._.cmd.callback();
      }

      this.select(index);
      this.screen.render();
    }

    this.emit(SELECT_TAB, item, index);
  }

}

/**
 * table.js - table element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Table extends Box {
  /**
   * Table
   */
  constructor(options = {}) {
    options.shrink = true;
    options.style = options.style || {};
    options.style.border = options.style.border || {};
    options.style.header = options.style.header || {};
    options.style.cell = options.style.cell || {};
    options.align = options.align || 'center'; // Regular tables do not get custom height (this would
    // require extra padding). Maybe add in the future.

    delete options.height;
    super(options);
    this.setRows = this.setData;
    const self = this;

    if (!(this instanceof Node)) {
      return new Table(options);
    }

    this.pad = options.pad != null ? options.pad : 2;
    this.setData(options.rows || options.data);
    this.on(ATTACH, function () {
      self.setContent('');
      self.setData(self.rows);
    });
    this.on(RESIZE, function () {
      self.setContent('');
      self.setData(self.rows);
      self.screen.render();
    });
    this.type = 'table';
  }

  _calculateMaxes() {
    const self = this;
    let maxes = [];
    if (this.detached) return;
    this.rows = this.rows || [];
    this.rows.forEach(function (row) {
      row.forEach(function (cell, i) {
        const clen = self.strWidth(cell);

        if (!maxes[i] || maxes[i] < clen) {
          maxes[i] = clen;
        }
      });
    });
    let total = maxes.reduce(function (total, max) {
      return total + max;
    }, 0);
    total += maxes.length + 1; // XXX There might be an issue with resizing where on the first resize event
    // width appears to be less than total if it's a percentage or left/right
    // combination.

    if (this.width < total) {
      delete this.position.width;
    }

    if (this.position.width != null) {
      const missing = this.width - total;
      const w = missing / maxes.length | 0;
      const wr = missing % maxes.length;
      maxes = maxes.map(function (max, i) {
        if (i === maxes.length - 1) {
          return max + w + wr;
        }

        return max + w;
      });
    } else {
      maxes = maxes.map(function (max) {
        return max + self.pad;
      });
    }

    return this._maxes = maxes;
  }

  setData(rows) {
    const self = this;
    let text = '';
    const align = this.align;
    this.rows = rows || [];

    this._calculateMaxes();

    if (!this._maxes) return;
    this.rows.forEach(function (row, i) {
      const isFooter = i === self.rows.length - 1;
      row.forEach(function (cell, i) {
        const width = self._maxes[i];
        let clen = self.strWidth(cell);

        if (i !== 0) {
          text += ' ';
        }

        while (clen < width) {
          if (align === 'center') {
            cell = ' ' + cell + ' ';
            clen += 2;
          } else if (align === 'left') {
            cell = cell + ' ';
            clen += 1;
          } else if (align === 'right') {
            cell = ' ' + cell;
            clen += 1;
          }
        }

        if (clen > width) {
          if (align === 'center') {
            cell = cell.substring(1);
            clen--;
          } else if (align === 'left') {
            cell = cell.slice(0, -1);
            clen--;
          } else if (align === 'right') {
            cell = cell.substring(1);
            clen--;
          }
        }

        text += cell;
      });

      if (!isFooter) {
        text += '\n\n';
      }
    });
    delete this.align;
    this.setContent(text);
    this.align = align;
  }

  render() {
    const self = this;

    const coords = this._render();

    if (!coords) return;

    this._calculateMaxes();

    if (!this._maxes) return coords;
    const lines = this.screen.lines,
          xi = coords.xi,
          yi = coords.yi;
    let rx, ry, i;
    const dattr = this.sattr(this.style),
          hattr = this.sattr(this.style.header),
          cattr = this.sattr(this.style.cell),
          battr = this.sattr(this.style.border);
    const width = coords.xl - coords.xi - this.iright,
          height = coords.yl - coords.yi - this.ibottom; // Apply attributes to header cells and cells.

    for (let y = this.itop; y < height; y++) {
      if (!lines[yi + y]) break;

      for (let x = this.ileft; x < width; x++) {
        if (!lines[yi + y][xi + x]) break; // Check to see if it's not the default attr. Allows for tags:

        if (lines[yi + y][xi + x][0] !== dattr) continue;

        if (y === this.itop) {
          lines[yi + y][xi + x][0] = hattr;
        } else {
          lines[yi + y][xi + x][0] = cattr;
        }

        lines[yi + y].dirty = true;
      }
    }

    if (!this.border || this.options.noCellBorders) return coords; // Draw border with correct angles.

    ry = 0;

    for (i = 0; i < self.rows.length + 1; i++) {
      if (!lines[yi + ry]) break;
      rx = 0;

      self._maxes.forEach(function (max, i) {
        rx += max;

        if (i === 0) {
          if (!lines[yi + ry][xi + 0]) return; // left side

          if (ry === 0) {
            // top
            lines[yi + ry][xi + 0][0] = battr; // lines[yi + ry][xi + 0][1] = '\u250c'; // '┌'
          } else if (ry / 2 === self.rows.length) {
            // bottom
            lines[yi + ry][xi + 0][0] = battr; // lines[yi + ry][xi + 0][1] = '\u2514'; // '└'
          } else {
            // middle
            lines[yi + ry][xi + 0][0] = battr;
            lines[yi + ry][xi + 0][1] = '\u251c'; // '├'
            // XXX If we alter iwidth and ileft for no borders - nothing should be written here

            if (!self.border.left) {
              lines[yi + ry][xi + 0][1] = '\u2500'; // '─'
            }
          }

          lines[yi + ry].dirty = true;
        } else if (i === self._maxes.length - 1) {
          if (!lines[yi + ry][xi + rx + 1]) return; // right side

          if (ry === 0) {
            // top
            rx++;
            lines[yi + ry][xi + rx][0] = battr; // lines[yi + ry][xi + rx][1] = '\u2510'; // '┐'
          } else if (ry / 2 === self.rows.length) {
            // bottom
            rx++;
            lines[yi + ry][xi + rx][0] = battr; // lines[yi + ry][xi + rx][1] = '\u2518'; // '┘'
          } else {
            // middle
            rx++;
            lines[yi + ry][xi + rx][0] = battr;
            lines[yi + ry][xi + rx][1] = '\u2524'; // '┤'
            // XXX If we alter iwidth and iright for no borders - nothing should be written here

            if (!self.border.right) {
              lines[yi + ry][xi + rx][1] = '\u2500'; // '─'
            }
          }

          lines[yi + ry].dirty = true;
          return;
        }

        if (!lines[yi + ry][xi + rx + 1]) return; // center

        if (ry === 0) {
          // top
          rx++;
          lines[yi + ry][xi + rx][0] = battr;
          lines[yi + ry][xi + rx][1] = '\u252c'; // '┬'
          // XXX If we alter iheight and itop for no borders - nothing should be written here

          if (!self.border.top) {
            lines[yi + ry][xi + rx][1] = '\u2502'; // '│'
          }
        } else if (ry / 2 === self.rows.length) {
          // bottom
          rx++;
          lines[yi + ry][xi + rx][0] = battr;
          lines[yi + ry][xi + rx][1] = '\u2534'; // '┴'
          // XXX If we alter iheight and ibottom for no borders - nothing should be written here

          if (!self.border.bottom) {
            lines[yi + ry][xi + rx][1] = '\u2502'; // '│'
          }
        } else {
          // middle
          if (self.options.fillCellBorders) {
            const lbg = (ry <= 2 ? hattr : cattr) & 0x1ff;
            rx++;
            lines[yi + ry][xi + rx][0] = battr & ~0x1ff | lbg;
          } else {
            rx++;
            lines[yi + ry][xi + rx][0] = battr;
          }

          lines[yi + ry][xi + rx][1] = '\u253c'; // '┼'
          // rx++;
        }

        lines[yi + ry].dirty = true;
      });

      ry += 2;
    } // Draw internal borders.


    for (ry = 1; ry < self.rows.length * 2; ry++) {
      if (!lines[yi + ry]) break;
      rx = 0;

      self._maxes.slice(0, -1).forEach(function (max) {
        rx += max;
        if (!lines[yi + ry][xi + rx + 1]) return;

        if (ry % 2 !== 0) {
          if (self.options.fillCellBorders) {
            const lbg = (ry <= 2 ? hattr : cattr) & 0x1ff;
            rx++;
            lines[yi + ry][xi + rx][0] = battr & ~0x1ff | lbg;
          } else {
            rx++;
            lines[yi + ry][xi + rx][0] = battr;
          }

          lines[yi + ry][xi + rx][1] = '\u2502'; // '│'

          lines[yi + ry].dirty = true;
        } else {
          rx++;
        }
      });

      rx = 1;

      self._maxes.forEach(function (max) {
        while (max--) {
          if (ry % 2 === 0) {
            if (!lines[yi + ry]) break;
            if (!lines[yi + ry][xi + rx + 1]) break;

            if (self.options.fillCellBorders) {
              const lbg = (ry <= 2 ? hattr : cattr) & 0x1ff;
              lines[yi + ry][xi + rx][0] = battr & ~0x1ff | lbg;
            } else {
              lines[yi + ry][xi + rx][0] = battr;
            }

            lines[yi + ry][xi + rx][1] = '\u2500'; // '─'

            lines[yi + ry].dirty = true;
          }

          rx++;
        }

        rx++;
      });
    }

    return coords;
  }

}
/**
 * Expose
 */

/**
 * listtable.js - list table element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class ListTable extends List {
  /**
   * ListTable
   */
  constructor(options = {}) {
    // options.shrink = true;
    options.normalShrink = true;
    options.style = options.style || {};
    options.style.border = options.style.border || {};
    options.style.header = options.style.header || {};
    options.style.cell = options.style.cell || {};

    const __align = options.align || 'center';

    delete options.align;
    options.style.selected = options.style.cell.selected;
    options.style.item = options.style.cell;
    const __border = options.border;

    if (__border && __border.top === false && __border.bottom === false && __border.left === false && __border.right === false) {
      delete options.border;
    }

    super(options);
    const self = this;

    if (!(this instanceof Node)) {
      return new ListTable(options);
    }

    this.__align = __align;
    options.border = __border;
    this._header = new Box({
      parent: this,
      left: this.screen.autoPadding ? 0 : this.ileft,
      top: 0,
      width: 'shrink',
      height: 1,
      style: options.style.header,
      tags: options.parseTags || options.tags
    });
    this.on(SCROLL, function () {
      self._header.setFront();

      self._header.rtop = self.childBase;

      if (!self.screen.autoPadding) {
        self._header.rtop = self.childBase + (self.border ? 1 : 0);
      }
    });
    this.pad = options.pad != null ? options.pad : 2;
    this.setData(options.rows || options.data);
    this.on(ATTACH, function () {
      self.setData(self.rows);
    });
    this.on(RESIZE, function () {
      const selected = self.selected;
      self.setData(self.rows);
      self.select(selected);
      self.screen.render();
    });
    this.type = 'list-table';
    this._calculateMaxes = Table.prototype._calculateMaxes;
    this.setRows = ListTable.prototype.setData;
    this._select = ListTable.prototype.select;
  }

  setData(rows) {
    const self = this,
          align = this.__align,
          selected = this.selected,
          original = this.items.slice();
    let sel = this.ritems[this.selected];

    if (this.visible && this.lpos) {
      this.clearPos();
    }

    this.clearItems();
    this.rows = rows || [];

    this._calculateMaxes();

    if (!this._maxes) return;
    this.addItem('');
    this.rows.forEach(function (row, i) {
      const isHeader = i === 0;
      let text = '';
      row.forEach(function (cell, i) {
        const width = self._maxes[i];
        let clen = self.strWidth(cell);

        if (i !== 0) {
          text += ' ';
        }

        while (clen < width) {
          if (align === 'center') {
            cell = ' ' + cell + ' ';
            clen += 2;
          } else if (align === 'left') {
            cell = cell + ' ';
            clen += 1;
          } else if (align === 'right') {
            cell = ' ' + cell;
            clen += 1;
          }
        }

        if (clen > width) {
          if (align === 'center') {
            cell = cell.substring(1);
            clen--;
          } else if (align === 'left') {
            cell = cell.slice(0, -1);
            clen--;
          } else if (align === 'right') {
            cell = cell.substring(1);
            clen--;
          }
        }

        text += cell;
      });

      if (isHeader) {
        self._header.setContent(text);
      } else {
        self.addItem(text);
      }
    });

    this._header.setFront(); // Try to find our old item if it still exists.


    sel = this.ritems.indexOf(sel);

    if (~sel) {
      this.select(sel);
    } else if (this.items.length === original.length) {
      this.select(selected);
    } else {
      this.select(Math.min(selected, this.items.length - 1));
    }
  }

  select(i) {
    if (i === 0) {
      i = 1;
    }

    if (i <= this.childBase) {
      this.setScroll(this.childBase - 1);
    }

    return this._select(i);
  }

  render() {
    const self = this;

    const coords = this._render();

    if (!coords) return;

    this._calculateMaxes();

    if (!this._maxes) return coords;
    const lines = this.screen.lines,
          xi = coords.xi,
          yi = coords.yi;
    let rx, ry, i;
    const battr = this.sattr(this.style.border);
    const height = coords.yl - coords.yi - this.ibottom;
    let border = this.border;

    if (!this.border && this.options.border) {
      border = this.options.border;
    }

    if (!border || this.options.noCellBorders) return coords; // Draw border with correct angles.

    ry = 0;

    for (i = 0; i < height + 1; i++) {
      if (!lines[yi + ry]) break;
      rx = 0;

      self._maxes.slice(0, -1).forEach(function (max) {
        rx += max;
        if (!lines[yi + ry][xi + rx + 1]) return; // center

        if (ry === 0) {
          // top
          rx++;
          lines[yi + ry][xi + rx][0] = battr;
          lines[yi + ry][xi + rx][1] = '\u252c'; // '┬'
          // XXX If we alter iheight and itop for no borders - nothing should be written here

          if (!border.top) {
            lines[yi + ry][xi + rx][1] = '\u2502'; // '│'
          }

          lines[yi + ry].dirty = true;
        } else if (ry === height) {
          // bottom
          rx++;
          lines[yi + ry][xi + rx][0] = battr;
          lines[yi + ry][xi + rx][1] = '\u2534'; // '┴'
          // XXX If we alter iheight and ibottom for no borders - nothing should be written here

          if (!border.bottom) {
            lines[yi + ry][xi + rx][1] = '\u2502'; // '│'
          }

          lines[yi + ry].dirty = true;
        } else {
          // middle
          rx++;
        }
      });

      ry += 1;
    } // Draw internal borders.


    for (ry = 1; ry < height; ry++) {
      if (!lines[yi + ry]) break;
      rx = 0;

      self._maxes.slice(0, -1).forEach(function (max) {
        rx += max;
        if (!lines[yi + ry][xi + rx + 1]) return;

        if (self.options.fillCellBorders !== false) {
          const lbg = lines[yi + ry][xi + rx][0] & 0x1ff;
          rx++;
          lines[yi + ry][xi + rx][0] = battr & ~0x1ff | lbg;
        } else {
          rx++;
          lines[yi + ry][xi + rx][0] = battr;
        }

        lines[yi + ry][xi + rx][1] = '\u2502'; // '│'

        lines[yi + ry].dirty = true;
      });
    }

    return coords;
  }

}

export { List, ListTable, Listbar, Table };
