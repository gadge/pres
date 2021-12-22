import { MUTATE_PIGMENT } from '@palett/enum-colorant-modes';
import { COLUMNWISE } from '@palett/fluo';
import { fluoMatrix } from '@palett/fluo-matrix';
import { fluoVector } from '@palett/fluo-vector';
import { FRESH, METRO, SUBTLE } from '@palett/presets';
import { Box } from '@pres/components-core';
import { ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, KEYPRESS, RESIZE, ADOPT, REMOVE, CLICK, ACTION, SELECT, CREATE_ITEM, ADD_ITEM, REMOVE_ITEM, INSERT_ITEM, SET_ITEMS, SELECT_ITEM, CANCEL, ATTACH, FOCUS, SELECT_TAB, SCROLL } from '@pres/enum-events';
import { tablePadder } from '@spare/table-padder';
import { clearAnsi } from '@texting/charset-ansi';
import { SP } from '@texting/enum-chars';
import { FUN, STR, NUM, OBJ, UND } from '@typen/enum-data-types';
import { mapper as mapper$1 } from '@vect/matrix-mapper';
import { mapper } from '@vect/vector-mapper';
import { UP, DOWN, ENTER, ESCAPE, LEFT, TAB, RIGHT, RETURN } from '@pres/enum-key-names';
import * as helpers from '@pres/util-helpers';
import { last } from '@vect/vector';
import { styleToAttr } from '@pres/util-sgr-attr';

const EFFECT_COLLECTION = ['bg', 'fg', 'bold', 'underline', 'blink', 'inverse', 'invisible'];

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
    if (!options.sku) options.sku = 'list';
    super(options);
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


    EFFECT_COLLECTION.forEach(name => {
      if (self.style[name] != null && self.style.item[name] == null) {
        self.style.item[name] = self.style[name];
      }
    });
    if (this.options.itemHoverBg) this.options.itemHoverEffects = {
      bg: this.options.itemHoverBg
    };
    if (this.options.itemHoverEffects) this.style.item.hover = this.options.itemHoverEffects;
    if (this.options.itemFocusEffects) this.style.item.focus = this.options.itemFocusEffects;
    this.interactive = options.interactive !== false;
    this.mouse = options.mouse || false;

    if (options.items) {
      this.ritems = options.items;
      options.items.forEach(this.add.bind(this));
    }

    this.select(0);

    if (options.mouse) {
      this.screen._listenMouse(this);

      this.on(ELEMENT_WHEELDOWN, () => {
        self.select(self.selected + 2);
        self.screen.render();
      });
      this.on(ELEMENT_WHEELUP, () => {
        self.select(self.selected - 2);
        self.screen.render();
      });
    }

    if (options.keys) {
      this.on(KEYPRESS, (ch, key) => {
        if (key.name === UP || options.vi && key.name === 'k') {
          self.up();
          self.screen.render();
          return;
        }

        if (key.name === DOWN || options.vi && key.name === 'j') {
          self.down();
          self.screen.render();
          return;
        }

        if (key.name === ENTER || options.vi && key.name === 'l' && !key.shift) {
          self.enterSelected();
          return;
        }

        if (key.name === ESCAPE || options.vi && key.name === 'q') {
          self.cancelSelected();
          return;
        }

        if (options.vi && key.name === 'u' && key.ctrl) {
          self.move(-((self.height - self.intH) / 2) | 0);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'd' && key.ctrl) {
          self.move((self.height - self.intH) / 2 | 0);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'b' && key.ctrl) {
          self.move(-(self.height - self.intH));
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'f' && key.ctrl) {
          self.move(self.height - self.intH);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'h' && key.shift) {
          self.move(self.subBase - self.selected);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'm' && key.shift) {
          // TODO: Maybe use Math.min(this.items.length,
          // ... for calculating visible items elsewhere.
          const visible = Math.min(self.height - self.intH, self.items.length) / 2 | 0;
          self.move(self.subBase + visible - self.selected);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'l' && key.shift) {
          // XXX This goes one too far on lists with an odd number of items.
          self.down(self.subBase + Math.min(self.height - self.intH, self.items.length) - self.selected);
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
          if (typeof self.options.search !== FUN) return;
          return self.options.search((err, value) => {
            var _err;

            if (typeof err === STR || typeof err === FUN || typeof err === NUM || (_err = err) !== null && _err !== void 0 && _err.test) {
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

    this.on(RESIZE, () => {
      const visible = self.height - self.intH; // if (self.selected < visible - 1) {

      if (visible >= self.selected + 1) {
        self.subBase = 0;
        self.subOffset = self.selected;
      } else {
        // Is this supposed to be: self.subBase = visible - self.selected + 1; ?
        self.subBase = self.selected - visible + 1;
        self.subOffset = visible - 1;
      }
    });
    this.on(ADOPT, el => {
      if (!~self.items.indexOf(el)) el.fixed = true;
    }); // Ensure sub are removed from the
    // item list if they are items.

    this.on(REMOVE, el => self.removeItem(el));
    this.type = 'list';
  }

  static build(options) {
    return new List(options);
  }

  createItem(content) {
    const self = this; // Note: Could potentially use Button here.

    const options = {
      screen: this.screen,
      content: content,
      align: this.align || LEFT,
      top: 0,
      left: 0,
      right: this.scrollbar ? 1 : 0,
      tags: this.parseTags,
      height: 1,
      hoverEffects: this.mouse ? this.style.item.hover : null,
      focusEffects: this.mouse ? this.style.item.focus : null,
      autoFocus: false // sup: self

    };

    if (!this.screen.autoPadding) {
      options.top = 1;
      options.left = this.intL;
      options.right = this.intR + (this.scrollbar ? 1 : 0);
    } // if (this.shrink) {
    // XXX NOTE: Maybe just do this on all shrinkage once autoPadding is default?


    if (this.shrink && this.options.normalShrink) {
      delete options.right;
      options.width = 'shrink';
    }

    EFFECT_COLLECTION.forEach(name => {
      options[name] = () => {
        let attr = self.items[self.selected] === item && self.interactive ? self.style.selected[name] : self.style.item[name];
        if (typeof attr === FUN) attr = attr(item);
        return attr;
      };
    });
    if (this.style.transparent) options.transparent = true;
    const item = new Box(options);

    if (this.mouse) {
      item.on(CLICK, () => {
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

  add = this.appendItem;
  addItem = this.appendItem;

  appendItem(content) {
    content = typeof content === STR ? content : content.getContent();
    const item = this.createItem(content);
    item.pos.top = this.items.length;
    if (!this.screen.autoPadding) item.pos.top = this.intT + this.items.length;
    this.ritems.push(content);
    this.items.push(item);
    this.append(item);
    if (this.items.length === 1) this.select(0);
    this.emit(ADD_ITEM);
    return item;
  }

  removeItem(child) {
    const i = this.getItemIndex(child);

    if (~i && this.items[i]) {
      child = this.items.splice(i, 1)[0];
      this.ritems.splice(i, 1);
      this.remove(child);

      for (let j = i; j < this.items.length; j++) this.items[j].pos.top--;

      if (i === this.selected) this.select(i - 1);
    }

    this.emit(REMOVE_ITEM);
    return child;
  }

  insertItem(child, content) {
    content = typeof content === STR ? content : content.getContent();
    const i = this.getItemIndex(child);
    if (!~i) return;
    if (i >= this.items.length) return this.appendItem(content);
    const item = this.createItem(content);

    for (let j = i; j < this.items.length; j++) this.items[j].pos.top++;

    item.pos.top = i + (!this.screen.autoPadding ? 1 : 0);
    this.ritems.splice(i, 0, content);
    this.items.splice(i, 0, item);
    this.append(item);
    if (i === this.selected) this.select(i + 1);
    this.emit(INSERT_ITEM);
  }

  getItem(child) {
    return this.items[this.getItemIndex(child)];
  }

  setItem(child, content) {
    content = typeof content === STR ? content : content.getContent();
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
      this.items[i] ? this.items[i].setContent(items[i]) : this.add(items[i]);
    }

    for (; i < original.length; i++) {
      this.remove(original[i]);
    }

    this.ritems = items; // Try to find our old item if it still exists.

    sel = items.indexOf(sel);
    ~sel ? this.select(sel) : items.length === original.length ? this.select(selected) : this.select(Math.min(selected, items.length - 1));
    this.emit(SET_ITEMS);
  }

  pushItem(content) {
    return this.appendItem(content), this.items.length;
  }

  popItem() {
    return this.removeItem(this.items.length - 1);
  }

  unshiftItem(content) {
    return this.insertItem(0, content), this.items.length;
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

    items.forEach(item => self.insertItem(i++, item));
    return removed;
  }

  find = this.fuzzyFind;

  fuzzyFind(search, back) {
    const start = this.selected + (back ? -1 : 1);
    let i;
    if (typeof search === NUM) search += '';
    if (search && search[0] === '/' && search[search.length - 1] === '/') try {
      search = new RegExp(search.slice(1, -1));
    } catch (e) {}
    const test = typeof search === STR ? item => !!~item.indexOf(search) : search.test ? search.test.bind(search) : search;

    if (typeof test !== FUN) {
      if (this.screen.options.debug) {
        throw new Error('fuzzyFind(): `test` is not a function.');
      }

      return this.selected;
    }

    if (!back) {
      for (i = start; i < this.ritems.length; i++) if (test(helpers.cleanTags(this.ritems[i]))) return i;

      for (i = 0; i < start; i++) if (test(helpers.cleanTags(this.ritems[i]))) return i;
    } else {
      for (i = start; i >= 0; i--) if (test(helpers.cleanTags(this.ritems[i]))) return i;

      for (i = this.ritems.length - 1; i > start; i--) if (test(helpers.cleanTags(this.ritems[i]))) return i;
    }

    return this.selected;
  }

  getItemIndex(child) {
    if (typeof child === NUM) {
      return child;
    } else if (typeof child === STR) {
      let i = this.ritems.indexOf(child);
      if (~i) return i;

      for (i = 0; i < this.ritems.length; i++) if (helpers.cleanTags(this.ritems[i]) === child) return i;

      return -1;
    } else {
      return this.items.indexOf(child);
    }
  }

  select(index) {
    if (!this.interactive) return;

    if (!this.items.length) {
      this.selected = 0;
      this.value = '';
      this.scrollTo(0);
      return;
    }

    if (typeof index === OBJ) {
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
    if (!this.sup) return;
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
    // var sup = this.sup;
    // this.detach();
    // sup.append(this);

    this.focus();
    this.show();
    this.select(0);
    if (label) this.setLabel(label);
    this.screen.render();
    this.once(ACTION, (el, selected) => {
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

class DataTable extends Box {
  constructor(options) {
    // if (!(this instanceof Node)) { return new Table(options) }
    if (Array.isArray(options.columnSpacing)) throw 'Error: columnSpacing cannot be an array.\r\n' + 'Note: From release 2.0.0 use property columnWidth instead of columnSpacing.\r\n' + 'Please refere to the README or to https://github.com/yaronn/blessed-contrib/issues/39';
    if (!options.columnWidth) throw 'Error: A table must get columnWidth as a property. Please refer to the README.'; // options = options || {}

    options.columnSpacing = options.columnSpacing ?? 10;
    options.bold = true;
    options.selectedFg = options.selectedFg || 'white';
    options.selectedBg = options.selectedBg || 'blue';
    options.fg = options.fg || 'green';
    options.bg = options.bg || '';
    options.interactive = typeof options.interactive === UND ? true : options.interactive;
    if (!options.sku) options.sku = 'data-table'; // this.options = options

    super(options); // Mixin.assign(this, new Box(options)) // Box.call(this, options)

    const self = this;
    this.rows = new List({
      //height: 0,
      top: 2,
      width: 0,
      left: 1,
      style: {
        selected: {
          fg: options.selectedFg,
          bg: options.selectedBg
        },
        item: {
          fg: options.fg,
          bg: options.bg
        }
      },
      keys: options.keys,
      vi: options.vi,
      mouse: options.mouse,
      tags: true,
      interactive: options.interactive,
      screen: this.screen,
      sup: self
    });
    this.append(this.rows);
    this.on(ATTACH, () => {
      if (self.options.data) {
        self.setData(self.options.data);
      }
    });
    this.type = 'data-table';
  }

  static build(options) {
    return new DataTable(options);
  }

  focus() {
    this.rows.focus();
  }

  render() {
    if (this.screen.focused === this.rows) this.rows.focus();
    this.rows.width = this.width - 3;
    this.rows.height = this.height - 4;
    Box.prototype.render.call(this);
  }

  setData(table) {
    this.update(table);
  }

  update(table) {
    const self = this;
    let head = mapper(table.head ?? table.headers, String),
        rows = mapper$1(table.rows ?? table.data, String);
    const presets = [FRESH, METRO, SUBTLE];
    const padTable = tablePadder({
      head,
      rows
    }, {
      ansi: true,
      full: true
    }); // use: ansi, fullAngle

    if (presets) {
      const [alpha, beta, gamma] = presets;
      head = fluoVector.call(MUTATE_PIGMENT, padTable.head, [alpha, gamma ?? beta]);
      rows = fluoMatrix.call(MUTATE_PIGMENT, padTable.rows, COLUMNWISE, [alpha, beta]);
    }

    const space = self.options.columnSpacing ? SP.repeat(self.options.columnSpacing) : SP;
    this.setContent(head.join(space));
    this.rows.setItems(rows.map(row => row.join(space)));
  }

  setDataAutoFlat(table) {
    const self = this;
    let head = mapper(table.head ?? table.headers, String),
        rows = mapper$1(table.rows ?? table.data, String);
    const padTable = tablePadder({
      head,
      rows
    }, {
      ansi: true,
      full: true
    });
    const space = self.options.columnSpacing ? SP.repeat(self.options.columnSpacing) : SP;
    this.setContent(padTable.head.join(space));
    this.rows.setItems(padTable.rows.map(row => row.join(space)));
  }

  setDataManual(table) {
    const self = this;

    const dataToString = row => {
      let str = '';
      row.forEach((cell, i) => {
        const text = String(cell),
              colSize = self.options.columnWidth[i],
              strip = clearAnsi(text),
              ansiLen = text.length - strip.length;
        let spaceLength = colSize - strip.length + self.options.columnSpacing;
        cell = text.substring(0, colSize + ansiLen); //compensate for ansi len

        if (spaceLength < 0) spaceLength = 0;
        const spaces = new Array(spaceLength).join(' ');
        str += cell + spaces;
      });
      return str;
    };

    const formatted = [];
    (table.rows ?? table.data).forEach(row => formatted.push(dataToString(row)));
    this.setContent(dataToString(table.head ?? table.headers));
    this.rows.setItems(formatted);
  }

  getOptionsPrototype() {
    return {
      keys: true,
      fg: 'white',
      interactive: false,
      label: 'Active Processes',
      width: '30%',
      height: '30%',
      border: {
        type: 'line',
        fg: 'cyan'
      },
      columnSpacing: 10,
      columnWidth: [16, 12],
      data: {
        headers: ['col1', 'col2'],
        data: [['a', 'b'], ['5', 'u'], ['x', '16.1']]
      }
    };
  }

}

const nullish = x => x === null || x === void 0;

/**
 * listbar.js - listbar element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class ListBar extends Box {
  /**
   * Listbar / HorizontalList
   */
  constructor(options = {}) {
    if (!options.sku) options.sku = 'list-bar';
    super(options);
    const self = this;
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
      this.on(KEYPRESS, (ch, key) => {
        if (key.name === LEFT || options.vi && key.name === 'h' || key.shift && key.name === TAB) {
          self.moveLeft();
          self.screen.render(); // Stop propagation if we're in a form.

          if (key.name === TAB) return false;
          return void 0;
        }

        if (key.name === RIGHT || options.vi && key.name === 'l' || key.name === TAB) {
          self.moveRight();
          self.screen.render(); // Stop propagation if we're in a form.

          if (key.name === TAB) return false;
          return void 0;
        }

        if (key.name === ENTER || key.name === RETURN || options.vi && key.name === 'k' && !key.shift) {
          self.emit(ACTION, self.items[self.selected], self.selected);
          self.emit(SELECT, self.items[self.selected], self.selected);
          const item = self.items[self.selected];
          if (item.data.callback) item.data.callback();
          self.screen.render();
          return void 0;
        }

        if (key.name === ESCAPE || options.vi && key.name === 'q') {
          self.emit(ACTION);
          self.emit(CANCEL);
          return void 0;
        }
      });
    }

    if (options.autoCommandKeys) {
      this.onScreenEvent(KEYPRESS, ch => {
        if (/^[0-9]$/.test(ch)) {
          let i = +ch - 1;
          if (!~i) i = 9;
          return self.selectTab(i);
        }
      });
    }

    this.on(FOCUS, () => self.select(self.selected));
    this.type = 'list-bar';
  }

  static build(options) {
    return new ListBar(options);
  }

  get selected() {
    return this.leftBase + this.leftOffset;
  }

  setItems(commands) {
    const self = this;
    if (!Array.isArray(commands)) commands = mapper(Object.entries(commands), ([key, conf], i) => {
      if (typeof conf === FUN) conf = {
        callback: conf
      };
      if (nullish(conf.text)) conf.text = key;
      if (nullish(conf.prefix)) conf.prefix = ++i + '';
      if (nullish(conf.text) && conf.callback) conf.text = conf.callback.name;
      return conf;
    });

    for (const item of this.items) {
      item.detach();
    }

    this.items = [];
    this.ritems = [];
    this.commands = [];

    for (const cmd of commands) {
      self.add(cmd);
    }

    this.emit(SET_ITEMS);
  }

  parseItemConfig(item, callback) {
    const items = this.items;
    const conf = typeof item === OBJ ? (item.prefix = item.prefix ?? String(items.length + 1), item) : typeof item === STR ? {
      prefix: String(items.length + 1),
      text: item,
      callback: callback
    } : typeof item === FUN ? {
      prefix: String(items.length + 1),
      text: item.name,
      callback: item
    } : {};

    if (conf.keys && conf.keys[0]) {
      conf.prefix = conf.keys[0];
    }

    return conf;
  }

  add = this.appendItem;
  addItem = this.appendItem;

  appendItem(item, callback) {
    const self = this;
    const conf = this.parseItemConfig(item, callback);
    const prev = last(this.items);
    const drawn = this.sup ? (prev ? prev.absL + prev.width : 0) + (!this.screen.autoPadding ? this.intL : 0) : 0;
    const tags = helpers.generateTags(this.style.prefix ?? {
      fg: 'light-black'
    });
    const pseudoTitle = (nullish(conf.prefix) ? '' : `${conf.prefix}:`) + conf.text;
    const formatTitle = (nullish(conf.prefix) ? '' : `${tags.open}${conf.prefix}${tags.close}:`) + conf.text;
    const opts = {
      sup: this,
      top: 'center',
      left: drawn + 1,
      height: 1,
      //'50%',
      content: formatTitle,
      width: pseudoTitle.length + 2,
      align: 'center',
      valign: 'middle',
      autoFocus: false,
      tags: true,
      mouse: true,
      style: Object.assign({}, this.style.item),
      noOverflow: true
    };

    if (!this.screen.autoPadding) {
      // console.log('list-bar config', 'not autoPadding', !this.screen.autoPadding, this.intT, this.intL)
      if (typeof opts.top === NUM) opts.top += this.intT;
      if (typeof opts.left === NUM) opts.left += this.intL;
    }

    const box = this.data[conf.text] = conf.element = new Box(opts);

    for (const effect of EFFECT_COLLECTION) {
      opts.style[effect] = () => {
        const attr = box === self.items[self.selected] ? self.style.selected[effect] : self.style.item[effect];
        return typeof attr === FUN ? attr(box) : attr;
      };
    }

    Object.assign(box.data, conf);
    this.ritems.push(conf.text);
    this.items.push(box);
    this.commands.push(conf); // this.append(box)

    if (conf.callback && conf.keys) {
      this.screen.key(conf.keys, () => {
        self.emit(ACTION, box, self.selected);
        self.emit(SELECT, box, self.selected);
        if (box.data.callback) box.data.callback();
        self.select(box);
        self.screen.render();
      });
    }

    if (this.items.length === 1) {
      this.select(0);
    } // XXX May be affected by new element.options.mouse option.


    if (this.mouse) {
      box.on(CLICK, () => {
        self.emit(ACTION, box, self.selected);
        self.emit(SELECT, box, self.selected);

        if (box.data.callback) {
          box.data.callback();
        }

        self.select(box);
        self.screen.render();
      });
    }

    this.emit(ADD_ITEM);
  }

  render() {
    const self = this;
    let drawn = 0;
    if (!this.screen.autoPadding) drawn += this.intL;
    this.items.forEach((item, i) => {
      if (i < self.leftBase) {
        item.hide();
      } else {
        item.relL = drawn + 1;
        drawn += item.width + 2;
        item.show();
      }
    });
    return this._render();
  }

  select(offset) {
    if (typeof offset !== NUM) offset = this.items.indexOf(offset);
    offset = offset < 0 ? 0 : offset >= this.items.length ? this.items.length - 1 : offset;

    if (!this.sup) {
      this.emit(SELECT_ITEM, this.items[offset], offset);
      return;
    }

    const prevPos = this.calcCoord();
    if (!prevPos) return;
    const self = this,
          width = prevPos.xHi - prevPos.xLo - this.intW;
    let drawn = 0,
        visible = 0;
    let item = this.items[offset];
    if (!item) return;
    this.items.forEach((item, i) => {
      if (i < self.leftBase) return;
      const prevPos = item.calcCoord();
      if (!prevPos || prevPos.xHi <= prevPos.xLo) return;
      drawn += prevPos.xHi - prevPos.xLo + 2;
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


    this.emit(SELECT_ITEM, item, offset);
  }

  removeItem(item) {
    const index = typeof item === NUM ? item : this.items.indexOf(item);

    if (~index && this.items[index]) {
      item = this.items.splice(index, 1)[0];
      this.ritems.splice(index, 1);
      this.commands.splice(index, 1);
      this.remove(item);

      if (index === this.selected) {
        this.select(index - 1);
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
      if (item.data.callback) {
        item.data.callback();
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
  setRows = this.setData;
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
    if (!options.sku) options.sku = 'table';
    super(options);
    const self = this; // if (!(this instanceof Node)) { return new Table(options) }

    this.pad = options.pad ?? 2;
    this.setData(options.rows || options.data);
    this.on(ATTACH, () => {
      self.setContent('');
      self.setData(self.rows);
    });
    this.on(RESIZE, () => {
      self.setContent('');
      self.setData(self.rows);
      self.screen.render();
    });
    this.type = 'table';
  }

  static build(options) {
    return new Table(options);
  }

  _calculateMaxes() {
    const self = this;
    let maxes = [];
    if (this.detached) return;
    this.rows = this.rows || [];
    this.rows.forEach(row => {
      row.forEach((cell, i) => {
        const clen = self.strWidth(cell);

        if (!maxes[i] || maxes[i] < clen) {
          maxes[i] = clen;
        }
      });
    });
    let total = maxes.reduce((total, max) => total + max, 0);
    total += maxes.length + 1; // XXX There might be an issue with resizing where on the first resize event
    // width appears to be less than total if it's a percentage or left/right
    // combination.

    if (this.width < total) delete this.pos.width;

    if (this.pos.width != null) {
      const missing = this.width - total;
      const w = missing / maxes.length | 0;
      const wr = missing % maxes.length;
      maxes = maxes.map((max, i) => i === maxes.length - 1 ? max + w + wr : max + w);
    } else {
      maxes = maxes.map(max => max + self.pad);
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
    this.rows.forEach((row, i) => {
      const isFooter = i === self.rows.length - 1;
      row.forEach((cell, i) => {
        const width = self._maxes[i];
        let clen = self.strWidth(cell);

        if (i !== 0) {
          text += ' ';
        }

        while (clen < width) {
          if (align === 'center') {
            cell = ' ' + cell + ' ';
            clen += 2;
          } else if (align === LEFT) {
            cell = cell + ' ';
            clen += 1;
          } else if (align === RIGHT) {
            cell = ' ' + cell;
            clen += 1;
          }
        }

        if (clen > width) {
          if (align === 'center') {
            cell = cell.substring(1);
            clen--;
          } else if (align === LEFT) {
            cell = cell.slice(0, -1);
            clen--;
          } else if (align === RIGHT) {
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
    // console.log(`>>> calling table.render`)
    const self = this;

    const coords = this._render();

    if (!coords) return;

    this._calculateMaxes();

    if (!this._maxes) return coords;
    const lines = this.screen.lines,
          xLo = coords.xLo,
          yLo = coords.yLo;
    let rx, ry;
    const normAttr = styleToAttr(this.style),
          headAttr = styleToAttr(this.style.header),
          cellAttr = styleToAttr(this.style.cell),
          borderAttr = styleToAttr(this.style.border);
    const width = coords.xHi - coords.xLo - this.intR,
          height = coords.yHi - coords.yLo - this.intB; // Apply attributes to header cells and cells.

    for (let y = this.intT, line; y < height; y++) {
      if (!(line = lines[yLo + y])) break;

      for (let x = this.intL, cell; x < width; x++) {
        if (!(cell = line[xLo + x])) break; // Check to see if it's not the default attr. Allows for tags:

        if (cell.at !== normAttr) continue;
        cell.at = y === this.intT ? headAttr : cellAttr;
        line.dirty = true;
      }
    }

    if (!this.border || this.options.noCellBorders) return coords; // Draw border with correct angles.

    ry = 0;

    for (let i = 0, line; i < self.rows.length + 1; i++) {
      if (!(line = lines[yLo + ry])) break;
      rx = 0;

      self._maxes.forEach((max, i) => {
        rx += max;

        if (i === 0) {
          if (!line[xLo + 0]) return; // left side

          if (ry === 0) {
            // top
            line[xLo + 0].at = borderAttr; // line[xLo + 0].ch = '\u250c'; // '┌'
          } else if (ry / 2 === self.rows.length) {
            // bottom
            line[xLo + 0].at = borderAttr; // line[xLo + 0].ch = '\u2514'; // '└'
          } else {
            // middle
            line[xLo + 0].inject(borderAttr, '\u251c'); // '├'
            // XXX If we alter intW and intL for no borders - nothing should be written here

            if (!self.border.left) line[xLo + 0].ch = '\u2500'; // '─'
          }

          line.dirty = true;
        } else if (i === self._maxes.length - 1) {
          if (!line[xLo + rx + 1]) return; // right side

          if (ry === 0) {
            // top
            rx++;
            line[xLo + rx].at = borderAttr; // line[xLo + rx].ch = '\u2510'; // '┐'
          } else if (ry / 2 === self.rows.length) {
            // bottom
            rx++;
            line[xLo + rx].at = borderAttr; // line[xLo + rx].ch = '\u2518'; // '┘'
          } else {
            // middle
            rx++;
            line[xLo + rx].inject(borderAttr, '\u2524'); // '┤'
            // XXX If we alter intW and intR for no borders - nothing should be written here

            if (!self.border.right) line[xLo + rx].ch = '\u2500'; // '─'
          }

          line.dirty = true;
          return;
        }

        if (!line[xLo + rx + 1]) return; // center

        if (ry === 0) {
          // top
          rx++;
          line[xLo + rx].inject(borderAttr, '\u252c'); // '┬'
          // XXX If we alter intH and intT for no borders - nothing should be written here

          if (!self.border.top) line[xLo + rx].ch = '\u2502'; // '│'
        } else if (ry / 2 === self.rows.length) {
          // bottom
          rx++;
          line[xLo + rx].inject(borderAttr, '\u2534'); // '┴'
          // XXX If we alter intH and intB for no borders - nothing should be written here

          if (!self.border.bottom) line[xLo + rx].ch = '\u2502'; // '│'
        } else {
          // middle
          if (self.options.fillCellBorders) {
            const lineBackColor = (ry <= 2 ? headAttr : cellAttr) & 0x1ff;
            rx++;
            line[xLo + rx].at = borderAttr & ~0x1ff | lineBackColor;
          } else {
            rx++;
            line[xLo + rx].at = borderAttr;
          }

          line[xLo + rx].ch = '\u253c'; // '┼'
          // rx++;
        }

        line.dirty = true;
      });

      ry += 2;
    } // Draw internal borders.


    for (let ry = 1, line; ry < self.rows.length * 2; ry++) {
      if (!(line = lines[yLo + ry])) break;
      rx = 0;

      self._maxes.slice(0, -1).forEach(max => {
        rx += max;
        if (!line[xLo + rx + 1]) return;

        if (ry % 2 !== 0) {
          if (self.options.fillCellBorders) {
            const lineBackColor = (ry <= 2 ? headAttr : cellAttr) & 0x1ff;
            rx++;
            line[xLo + rx].at = borderAttr & ~0x1ff | lineBackColor;
          } else {
            rx++;
            line[xLo + rx].at = borderAttr;
          }

          line[xLo + rx].ch = '\u2502'; // '│'

          line.dirty = true;
        } else {
          rx++;
        }
      });

      rx = 1;

      self._maxes.forEach(max => {
        while (max--) {
          if (ry % 2 === 0) {
            if (!line) break;
            if (!line[xLo + rx + 1]) break;

            if (self.options.fillCellBorders) {
              const lineBackColor = (ry <= 2 ? headAttr : cellAttr) & 0x1ff;
              line[xLo + rx].at = borderAttr & ~0x1ff | lineBackColor;
            } else {
              line[xLo + rx].at = borderAttr;
            }

            line[xLo + rx].ch = '\u2500'; // '─'

            line.dirty = true;
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

    if (!options.sku) options.sku = 'list-table';
    super(options);
    const self = this; // if (!( this instanceof Node )) { return new ListTable(options) }

    this.__align = __align;
    options.border = __border;
    this._header = new Box({
      sup: this,
      left: this.screen.autoPadding ? 0 : this.intL,
      top: 0,
      width: 'shrink',
      height: 1,
      style: options.style.header,
      tags: options.parseTags || options.tags
    });
    this.on(SCROLL, () => {
      self._header.setFront();

      self._header.relT = self.subBase;

      if (!self.screen.autoPadding) {
        self._header.relT = self.subBase + (self.border ? 1 : 0);
      }
    });
    this.pad = options.pad != null ? options.pad : 2;
    this.setData(options.rows || options.data);
    this.on(ATTACH, () => self.setData(self.rows));
    this.on(RESIZE, () => {
      const selected = self.selected;
      self.setData(self.rows);
      self.select(selected);
      self.screen.render();
    });
    this.type = 'list-table';
  }

  static build(options) {
    return new ListTable(options);
  }

  _calculateMaxes() {
    return Table.prototype._calculateMaxes.call(this);
  }

  setRows(rows) {
    return this.setData(rows);
  }

  setData(rows) {
    const self = this,
          align = this.__align,
          selected = this.selected,
          original = this.items.slice();
    let sel = this.ritems[this.selected];
    if (this.visible && this.prevPos) this.clearPos();
    this.clearItems();
    this.rows = rows || [];

    this._calculateMaxes();

    if (!this._maxes) return;
    this.addItem('');
    this.rows.forEach((row, i) => {
      const isHeader = i === 0;
      let text = '';
      row.forEach((cell, i) => {
        const width = self._maxes[i];
        let clen = self.strWidth(cell);

        if (i !== 0) {
          text += ' ';
        }

        while (clen < width) {
          if (align === 'center') {
            cell = ' ' + cell + ' ';
            clen += 2;
          } else if (align === LEFT) {
            cell = cell + ' ';
            clen += 1;
          } else if (align === RIGHT) {
            cell = ' ' + cell;
            clen += 1;
          }
        }

        if (clen > width) {
          if (align === 'center') {
            cell = cell.substring(1);
            clen--;
          } else if (align === LEFT) {
            cell = cell.slice(0, -1);
            clen--;
          } else if (align === RIGHT) {
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

  _select(i) {
    return List.prototype.select.call(this, i);
  }

  select(i) {
    if (i === 0) i = 1;
    if (i <= this.subBase) this.setScroll(this.subBase - 1);
    return this._select(i);
  }

  render() {
    const self = this;

    const coords = this._render();

    if (!coords) return;

    this._calculateMaxes();

    if (!this._maxes) return coords;
    const lines = this.screen.lines,
          xLo = coords.xLo,
          yLo = coords.yLo;
    let rx, ry;
    const borderAttr = styleToAttr(this.style.border);
    const height = coords.yHi - coords.yLo - this.intB;
    let border = this.border;
    if (!this.border && this.options.border) border = this.options.border;
    if (!border || this.options.noCellBorders) return coords; // Draw border with correct angles.

    ry = 0;

    for (let i = 0, line; i < height + 1; i++) {
      if (!(line = lines[yLo + ry])) break;
      rx = 0;

      self._maxes.slice(0, -1).forEach(max => {
        rx += max;
        if (!line[xLo + rx + 1]) return; // center

        if (ry === 0) {
          // top
          rx++;
          line[xLo + rx].inject(borderAttr, '\u252c'); // '┬'
          // XXX If we alter intH and intT for no borders - nothing should be written here

          if (!border.top) line[xLo + rx].ch = '\u2502'; // '│'

          line.dirty = true;
        } else if (ry === height) {
          // bottom
          rx++;
          line[xLo + rx].inject(borderAttr, '\u2534'); // '┴'
          // XXX If we alter intH and intB for no borders - nothing should be written here

          if (!border.bottom) line[xLo + rx].ch = '\u2502'; // '│'

          line.dirty = true;
        } else {
          // middle
          rx++;
        }
      });

      ry += 1;
    } // Draw internal borders.


    for (let ry = 1, line; ry < height; ry++) {
      if (!(line = lines[yLo + ry])) break;
      rx = 0;

      self._maxes.slice(0, -1).forEach(max => {
        rx += max;
        if (!line[xLo + rx + 1]) return;

        if (self.options.fillCellBorders !== false) {
          const lbg = line[xLo + rx].at & 0x1ff;
          rx++;
          line[xLo + rx].at = borderAttr & ~0x1ff | lbg;
        } else {
          rx++;
          line[xLo + rx].at = borderAttr;
        }

        line[xLo + rx].ch = '\u2502'; // '│'

        line.dirty = true;
      });
    }

    return coords;
  }

}

class Tree extends Box {
  constructor(options) {
    // if (!(this instanceof Node)) { return new Tree(options) }
    // options = options || {}
    options.bold = true; // this.options = options

    if (!options.sku) options.sku = 'tree';
    super(options); // Mixin.assign(this, new Box(options)) // Box.call(this, options)

    const self = this;
    this.data = {};
    this.nodeLines = [];
    this.lineNbr = 0;
    options.extended = options.extended || false;
    options.keys = options.keys || ['+', 'space', 'enter'];
    options.template = options.template || {};
    options.template.extend = options.template.extend || ' [+]';
    options.template.retract = options.template.retract || ' [-]';
    options.template.lines = options.template.lines || false; // Do not set height, since this create a bug where the first line is not always displayed

    this.rows = new List({
      top: 1,
      width: 0,
      left: 1,
      style: options.style,
      padding: options.padding,
      keys: true,
      tags: options.tags,
      input: options.input,
      vi: options.vi,
      ignoreKeys: options.ignoreKeys,
      scrollable: options.scrollable,
      mouse: options.mouse,
      selectedBg: 'blue'
    });
    this.append(this.rows);
    this.rows.key(options.keys, function () {
      const selectedNode = self.nodeLines[this.getItemIndex(this.selected)];

      if (selectedNode.sub) {
        selectedNode.extended = !selectedNode.extended;
        self.setData(self.data);
        self.screen.render();
      }

      self.emit('select', selectedNode, this.getItemIndex(this.selected));
    });
    this.type = 'tree';
  }

  static build(options) {
    return new Tree(options);
  }

  walk(node, treeDepth) {
    let lines = [];

    if (!node.sup) {
      // root level
      this.lineNbr = 0;
      this.nodeLines.length = 0;
      node.sup = null;
    }

    if (treeDepth === '' && node.name) {
      this.lineNbr = 0;
      this.nodeLines[this.lineNbr++] = node;
      lines.push(node.name);
      treeDepth = ' ';
    }

    node.depth = treeDepth.length - 1;

    if (node.sub && node.extended) {
      let i = 0;
      if (typeof node.sub === FUN) node.subContent = node.sub(node);
      if (!node.subContent) node.subContent = node.sub;

      for (let unit in node.subContent) {
        if (!node.subContent[unit].name) node.subContent[unit].name = unit;
        unit = node.subContent[unit];
        unit.sup = node;
        unit.pos = i++;
        if (typeof unit.extended === 'undefined') unit.extended = this.options.extended;
        if (typeof unit.sub === FUN) unit.subContent = unit.sub(unit);else unit.subContent = unit.sub;
        const isLastChild = unit.pos === Object.keys(unit.sup.subContent).length - 1;
        let treePrefix;
        let suffix = '';
        treePrefix = isLastChild ? '└' : '├';

        if (!unit.subContent || Object.keys(unit.subContent).length === 0) {
          treePrefix += '─';
        } else if (unit.extended) {
          treePrefix += '┬';
          suffix = this.options.template.retract;
        } else {
          treePrefix += '─';
          suffix = this.options.template.extend;
        }

        if (!this.options.template.lines) treePrefix = '|-';
        if (this.options.template.spaces) treePrefix = ' ';
        lines.push(treeDepth + treePrefix + unit.name + suffix);
        this.nodeLines[this.lineNbr++] = unit;
        let parentTree;
        parentTree = isLastChild || !this.options.template.lines ? treeDepth + ' ' : treeDepth + '│';
        lines = lines.concat(this.walk(unit, parentTree));
      }
    }

    return lines;
  }

  focus() {
    this.rows.focus();
  }

  render() {
    if (this.screen.focused === this.rows) this.rows.focus();
    this.rows.width = this.width - 3;
    this.rows.height = this.height - 3;
    Box.prototype.render.call(this);
  }

  setData(nodes) {
    this.data = nodes;
    this.rows.setItems(this.walk(nodes, ''));
  }

}

export { DataTable, List, ListBar, ListTable, Table, Tree };
