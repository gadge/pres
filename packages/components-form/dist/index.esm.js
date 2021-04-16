import { KEYPRESS, CLICK, PRESS, FOCUS, BLUR, CHECK, UNCHECK, SELECT, ERROR, CD, FILE, REFRESH, CANCEL, ELEMENT_KEYPRESS, SUBMIT, RESET, RESIZE, MOVE, ACTION, MOUSE } from '@pres/enum-events';
import { Box, Node } from '@pres/components-core';
import { List } from '@pres/components-data';
import { helpers } from '@pres/util-helpers';
import fs from 'fs';
import path from 'path';

/**
 * input.js - abstract input element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Input extends Box {
  constructor(options = {}) {
    super(options);
    this.type = 'input';
  }

}

/**
 * button.js - button element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Button extends Input {
  /**
   * Button
   */
  constructor(options = {}) {
    if (options.autoFocus == null) options.autoFocus = false;
    super(options);
    const self = this; // if (!(this instanceof Node)) return new Button(options)

    this.on(KEYPRESS, function (ch, key) {
      if (key.name === 'enter' || key.name === 'space') {
        return self.press();
      }
    });

    if (this.options.mouse) {
      this.on(CLICK, function () {
        return self.press();
      });
    }

    this.type = 'button';
  }

  press() {
    this.focus();
    this.value = true;
    const result = this.emit(PRESS);
    delete this.value;
    return result;
  }

}

/**
 * checkbox.js - checkbox element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Checkbox extends Input {
  /**
   * Checkbox
   */
  constructor(options = {}) {
    super(options);
    const self = this; // if (!(this instanceof Node)) return new Checkbox(options)

    this.text = options.content || options.text || '';
    this.checked = this.value = options.checked || false;
    this.on(KEYPRESS, function (ch, key) {
      if (key.name === 'enter' || key.name === 'space') {
        self.toggle();
        self.screen.render();
      }
    });

    if (options.mouse) {
      this.on(CLICK, function () {
        self.toggle();
        self.screen.render();
      });
    }

    this.on(FOCUS, function () {
      const lpos = self.lpos;
      if (!lpos) return;
      self.screen.program.lsaveCursor('checkbox');
      self.screen.program.cup(lpos.yi, lpos.xi + 1);
      self.screen.program.showCursor();
    });
    this.on(BLUR, function () {
      self.screen.program.lrestoreCursor('checkbox', true);
    });
    this.type = 'checkbox';
  }

  render() {
    this.clearPos(true);
    this.setContent('[' + (this.checked ? 'x' : ' ') + '] ' + this.text, true);
    return this._render();
  }

  check() {
    if (this.checked) return;
    this.checked = this.value = true;
    this.emit(CHECK);
  }

  uncheck() {
    if (!this.checked) return;
    this.checked = this.value = false;
    this.emit(UNCHECK);
  }

  toggle() {
    return this.checked ? this.uncheck() : this.check();
  }

}

/**
 * filemanager.js - file manager element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class FileManager extends List {
  /**
   * FileManager
   */
  constructor(options = {}) {
    options.parseTags = true;
    super(options);
    const self = this; // if (!(this instanceof Node)) return new FileManager(options)
    // options.label = ' {blue-fg}%path{/blue-fg} ';
    // List.call(this, options)

    this.cwd = options.cwd || process.cwd();
    this.file = this.cwd;
    this.value = this.cwd;

    if (options.label && ~options.label.indexOf('%path')) {
      this._label.setContent(options.label.replace('%path', this.cwd));
    }

    this.on(SELECT, function (item) {
      const value = item.content.replace(/\{[^{}]+\}/g, '').replace(/@$/, ''),
            file = path.resolve(self.cwd, value);
      return fs.stat(file, function (err, stat) {
        if (err) {
          return self.emit(ERROR, err, file);
        }

        self.file = file;
        self.value = file;

        if (stat.isDirectory()) {
          self.emit(CD, file, self.cwd);
          self.cwd = file;

          if (options.label && ~options.label.indexOf('%path')) {
            self._label.setContent(options.label.replace('%path', file));
          }

          self.refresh();
        } else {
          self.emit(FILE, file);
        }
      });
    });
    this.type = 'file-manager';
  }

  refresh(cwd, callback) {
    if (!callback) {
      callback = cwd;
      cwd = null;
    }

    const self = this;
    if (cwd) this.cwd = cwd;else cwd = this.cwd;
    return fs.readdir(cwd, function (err, list) {
      if (err && err.code === 'ENOENT') {
        self.cwd = cwd !== process.env.HOME ? process.env.HOME : '/';
        return self.refresh(callback);
      }

      if (err) {
        if (callback) return callback(err);
        return self.emit(ERROR, err, cwd);
      }

      let dirs = [],
          files = [];
      list.unshift('..');
      list.forEach(function (name) {
        const f = path.resolve(cwd, name);
        let stat;

        try {
          stat = fs.lstatSync(f);
        } catch (e) {}

        if (stat && stat.isDirectory() || name === '..') {
          dirs.push({
            name: name,
            text: '{light-blue-fg}' + name + '{/light-blue-fg}/',
            dir: true
          });
        } else if (stat && stat.isSymbolicLink()) {
          files.push({
            name: name,
            text: '{light-cyan-fg}' + name + '{/light-cyan-fg}@',
            dir: false
          });
        } else {
          files.push({
            name: name,
            text: name,
            dir: false
          });
        }
      });
      dirs = helpers.asort(dirs);
      files = helpers.asort(files);
      list = dirs.concat(files).map(function (data) {
        return data.text;
      });
      self.setItems(list);
      self.select(0);
      self.screen.render();
      self.emit(REFRESH);
      if (callback) callback();
    });
  }

  pick(cwd, callback) {
    if (!callback) {
      callback = cwd;
      cwd = null;
    }

    const self = this,
          focused = this.screen.focused === this,
          hidden = this.hidden;
    let onfile, oncancel;

    function resume() {
      self.removeListener(FILE, onfile);
      self.removeListener(CANCEL, oncancel);

      if (hidden) {
        self.hide();
      }

      if (!focused) {
        self.screen.restoreFocus();
      }

      self.screen.render();
    }

    this.on(FILE, onfile = function (file) {
      resume();
      return callback(null, file);
    });
    this.on(CANCEL, oncancel = function () {
      resume();
      return callback();
    });
    this.refresh(cwd, function (err) {
      if (err) return callback(err);

      if (hidden) {
        self.show();
      }

      if (!focused) {
        self.screen.saveFocus();
        self.focus();
      }

      self.screen.render();
    });
  }

  reset(cwd, callback) {
    if (!callback) {
      callback = cwd;
      cwd = null;
    }

    this.cwd = cwd || this.options.cwd;
    this.refresh(callback);
  }

}

/**
 * form.js - form element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Form extends Box {
  constructor(options = {}) {
    options.ignoreKeys = true;
    super(options);
    const self = this; // if (!(this instanceof Node)) return new Form(options)

    if (options.keys) {
      this.screen._listenKeys(this);

      this.on(ELEMENT_KEYPRESS, function (el, ch, key) {
        if (key.name === 'tab' && !key.shift || el.type === 'textbox' && options.autoNext && key.name === 'enter' || key.name === 'down' || options.vi && key.name === 'j') {
          if (el.type === 'textbox' || el.type === 'textarea') {
            if (key.name === 'j') return;

            if (key.name === 'tab') {
              // Workaround, since we can't stop the tab from  being added.
              el.emit(KEYPRESS, null, {
                name: 'backspace'
              });
            }

            el.emit(KEYPRESS, '\x1b', {
              name: 'escape'
            });
          }

          self.focusNext();
          return;
        }

        if (key.name === 'tab' && key.shift || key.name === 'up' || options.vi && key.name === 'k') {
          if (el.type === 'textbox' || el.type === 'textarea') {
            if (key.name === 'k') return;
            el.emit(KEYPRESS, '\x1b', {
              name: 'escape'
            });
          }

          self.focusPrevious();
          return;
        }

        if (key.name === 'escape') {
          self.focus();
        }
      });
    }

    this.type = 'form';
  }

  _refresh() {
    // XXX Possibly remove this if statement and refresh on every focus.
    // Also potentially only include *visible* focusable elements.
    // This would remove the need to check for _selected.visible in previous()
    // and next().
    if (!this._children) {
      const out = [];
      this.children.forEach(function fn(el) {
        if (el.keyable) out.push(el);
        el.children.forEach(fn);
      });
      this._children = out;
    }
  }

  _visible() {
    return !!this._children.filter(function (el) {
      return el.visible;
    }).length;
  }

  next() {
    this._refresh();

    if (!this._visible()) return;

    if (!this._selected) {
      this._selected = this._children[0];
      if (!this._selected.visible) return this.next();
      if (this.screen.focused !== this._selected) return this._selected;
    }

    const i = this._children.indexOf(this._selected);

    if (!~i || !this._children[i + 1]) {
      this._selected = this._children[0];
      if (!this._selected.visible) return this.next();
      return this._selected;
    }

    this._selected = this._children[i + 1];
    if (!this._selected.visible) return this.next();
    return this._selected;
  }

  previous() {
    this._refresh();

    if (!this._visible()) return;

    if (!this._selected) {
      this._selected = this._children[this._children.length - 1];
      if (!this._selected.visible) return this.previous();
      if (this.screen.focused !== this._selected) return this._selected;
    }

    const i = this._children.indexOf(this._selected);

    if (!~i || !this._children[i - 1]) {
      this._selected = this._children[this._children.length - 1];
      if (!this._selected.visible) return this.previous();
      return this._selected;
    }

    this._selected = this._children[i - 1];
    if (!this._selected.visible) return this.previous();
    return this._selected;
  }

  focusNext() {
    const next = this.next();
    if (next) next.focus();
  }

  focusPrevious() {
    const previous = this.previous();
    if (previous) previous.focus();
  }

  resetSelected() {
    this._selected = null;
  }

  focusFirst() {
    this.resetSelected();
    this.focusNext();
  }

  focusLast() {
    this.resetSelected();
    this.focusPrevious();
  }

  submit() {
    const out = {};
    this.children.forEach(function fn(el) {
      if (el.value != null) {
        const name = el.name || el.type;

        if (Array.isArray(out[name])) {
          out[name].push(el.value);
        } else if (out[name]) {
          out[name] = [out[name], el.value];
        } else {
          out[name] = el.value;
        }
      }

      el.children.forEach(fn);
    });
    this.emit(SUBMIT, out);
    return this.submission = out;
  }

  cancel() {
    this.emit(CANCEL);
  }

  reset() {
    this.children.forEach(function fn(el) {
      switch (el.type) {
        case 'screen':
          break;

        case 'box':
          break;

        case 'text':
          break;

        case 'line':
          break;

        case 'scrollable-box':
          break;

        case 'list':
          el.select(0);
          return;

        case 'form':
          break;

        case 'input':
          break;

        case 'textbox':
          el.clearInput();
          return;

        case 'textarea':
          el.clearInput();
          return;

        case 'button':
          delete el.value;
          break;

        case 'progress-bar':
          el.setProgress(0);
          break;

        case 'file-manager':
          el.refresh(el.options.cwd);
          return;

        case 'checkbox':
          el.uncheck();
          return;

        case 'radio-set':
          break;

        case 'radio-button':
          el.uncheck();
          return;

        case 'prompt':
          break;

        case 'question':
          break;

        case 'message':
          break;

        case 'info':
          break;

        case 'loading':
          break;

        case 'list-bar':
          //el.select(0);
          break;

        case 'dir-manager':
          el.refresh(el.options.cwd);
          return;

        case 'terminal':
          el.write('');
          return;

        case 'image':
          //el.clearImage();
          return;
      }

      el.children.forEach(fn);
    });
    this.emit(RESET);
  }

}

/**
 * unicode.js - east asian width and surrogate pairs
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 * Borrowed from vangie/east-asian-width, komagata/eastasianwidth,
 * and mathiasbynens/String.prototype.codePointAt. Licenses below.
 */
const stringFromCharCode = String.fromCharCode;
const floor = Math.floor;

function isSurrogate(str, i) {
  const point = typeof str !== 'number' ? codePointAt(str, i || 0) : str;
  return point > 0x00ffff;
}

const combiningTable = [[0x0300, 0x036F], [0x0483, 0x0486], [0x0488, 0x0489], [0x0591, 0x05BD], [0x05BF, 0x05BF], [0x05C1, 0x05C2], [0x05C4, 0x05C5], [0x05C7, 0x05C7], [0x0600, 0x0603], [0x0610, 0x0615], [0x064B, 0x065E], [0x0670, 0x0670], [0x06D6, 0x06E4], [0x06E7, 0x06E8], [0x06EA, 0x06ED], [0x070F, 0x070F], [0x0711, 0x0711], [0x0730, 0x074A], [0x07A6, 0x07B0], [0x07EB, 0x07F3], [0x0901, 0x0902], [0x093C, 0x093C], [0x0941, 0x0948], [0x094D, 0x094D], [0x0951, 0x0954], [0x0962, 0x0963], [0x0981, 0x0981], [0x09BC, 0x09BC], [0x09C1, 0x09C4], [0x09CD, 0x09CD], [0x09E2, 0x09E3], [0x0A01, 0x0A02], [0x0A3C, 0x0A3C], [0x0A41, 0x0A42], [0x0A47, 0x0A48], [0x0A4B, 0x0A4D], [0x0A70, 0x0A71], [0x0A81, 0x0A82], [0x0ABC, 0x0ABC], [0x0AC1, 0x0AC5], [0x0AC7, 0x0AC8], [0x0ACD, 0x0ACD], [0x0AE2, 0x0AE3], [0x0B01, 0x0B01], [0x0B3C, 0x0B3C], [0x0B3F, 0x0B3F], [0x0B41, 0x0B43], [0x0B4D, 0x0B4D], [0x0B56, 0x0B56], [0x0B82, 0x0B82], [0x0BC0, 0x0BC0], [0x0BCD, 0x0BCD], [0x0C3E, 0x0C40], [0x0C46, 0x0C48], [0x0C4A, 0x0C4D], [0x0C55, 0x0C56], [0x0CBC, 0x0CBC], [0x0CBF, 0x0CBF], [0x0CC6, 0x0CC6], [0x0CCC, 0x0CCD], [0x0CE2, 0x0CE3], [0x0D41, 0x0D43], [0x0D4D, 0x0D4D], [0x0DCA, 0x0DCA], [0x0DD2, 0x0DD4], [0x0DD6, 0x0DD6], [0x0E31, 0x0E31], [0x0E34, 0x0E3A], [0x0E47, 0x0E4E], [0x0EB1, 0x0EB1], [0x0EB4, 0x0EB9], [0x0EBB, 0x0EBC], [0x0EC8, 0x0ECD], [0x0F18, 0x0F19], [0x0F35, 0x0F35], [0x0F37, 0x0F37], [0x0F39, 0x0F39], [0x0F71, 0x0F7E], [0x0F80, 0x0F84], [0x0F86, 0x0F87], [0x0F90, 0x0F97], [0x0F99, 0x0FBC], [0x0FC6, 0x0FC6], [0x102D, 0x1030], [0x1032, 0x1032], [0x1036, 0x1037], [0x1039, 0x1039], [0x1058, 0x1059], [0x1160, 0x11FF], [0x135F, 0x135F], [0x1712, 0x1714], [0x1732, 0x1734], [0x1752, 0x1753], [0x1772, 0x1773], [0x17B4, 0x17B5], [0x17B7, 0x17BD], [0x17C6, 0x17C6], [0x17C9, 0x17D3], [0x17DD, 0x17DD], [0x180B, 0x180D], [0x18A9, 0x18A9], [0x1920, 0x1922], [0x1927, 0x1928], [0x1932, 0x1932], [0x1939, 0x193B], [0x1A17, 0x1A18], [0x1B00, 0x1B03], [0x1B34, 0x1B34], [0x1B36, 0x1B3A], [0x1B3C, 0x1B3C], [0x1B42, 0x1B42], [0x1B6B, 0x1B73], [0x1DC0, 0x1DCA], [0x1DFE, 0x1DFF], [0x200B, 0x200F], [0x202A, 0x202E], [0x2060, 0x2063], [0x206A, 0x206F], [0x20D0, 0x20EF], [0x302A, 0x302F], [0x3099, 0x309A], [0xA806, 0xA806], [0xA80B, 0xA80B], [0xA825, 0xA826], [0xFB1E, 0xFB1E], [0xFE00, 0xFE0F], [0xFE20, 0xFE23], [0xFEFF, 0xFEFF], [0xFFF9, 0xFFFB], [0x10A01, 0x10A03], [0x10A05, 0x10A06], [0x10A0C, 0x10A0F], [0x10A38, 0x10A3A], [0x10A3F, 0x10A3F], [0x1D167, 0x1D169], [0x1D173, 0x1D182], [0x1D185, 0x1D18B], [0x1D1AA, 0x1D1AD], [0x1D242, 0x1D244], [0xE0001, 0xE0001], [0xE0020, 0xE007F], [0xE0100, 0xE01EF]];
combiningTable.reduce(function (out, row) {
  for (let i = row[0]; i <= row[1]; i++) {
    out[i] = true;
  }

  return out;
}, {});
/**
 * Code Point Helpers
 */


function codePointAt(str, position) {
  if (str == null) {
    throw TypeError();
  }

  const string = String(str);

  if (string.codePointAt) {
    return string.codePointAt(position);
  }

  const size = string.length; // `ToInteger`

  let index = position ? Number(position) : 0;

  if (index !== index) {
    // better `isNaN`
    index = 0;
  } // Account for out-of-bounds indices:


  if (index < 0 || index >= size) {
    return undefined;
  } // Get the first code unit


  const first = string.charCodeAt(index);
  let second;

  if ( // check if it’s the start of a surrogate pair
  first >= 0xD800 && first <= 0xDBFF && // high surrogate
  size > index + 1 // there is a next code unit
  ) {
      second = string.charCodeAt(index + 1);

      if (second >= 0xDC00 && second <= 0xDFFF) {
        // low surrogate
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }

  return first;
} // exports.codePointAt = function(str, position) {
//   position = +position || 0;
//   var x = str.charCodeAt(position);
//   var y = str.length > 1 ? str.charCodeAt(position + 1) : 0;
//   var point = x;
//   if ((0xD800 <= x && x <= 0xDBFF) && (0xDC00 <= y && y <= 0xDFFF)) {
//     x &= 0x3FF;
//     y &= 0x3FF;
//     point = (x << 10) | y;
//     point += 0x10000;
//   }
//   return point;
// };


function fromCodePoint() {
  if (String.fromCodePoint) {
    return String.fromCodePoint.apply(String, arguments);
  }

  const MAX_SIZE = 0x4000;
  const codeUnits = [];
  let highSurrogate;
  let lowSurrogate;
  let index = -1;
  const length = arguments.length;

  if (!length) {
    return '';
  }

  let result = '';

  while (++index < length) {
    let codePoint = Number(arguments[index]);

    if (!isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
    codePoint < 0 || // not a valid Unicode code point
    codePoint > 0x10FFFF || // not a valid Unicode code point
    floor(codePoint) !== codePoint // not an integer
    ) {
        throw RangeError('Invalid code point: ' + codePoint);
      }

    if (codePoint <= 0xFFFF) {
      // BMP code point
      codeUnits.push(codePoint);
    } else {
      // Astral code point; split in surrogate halves
      // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      codePoint -= 0x10000;
      highSurrogate = (codePoint >> 10) + 0xD800;
      lowSurrogate = codePoint % 0x400 + 0xDC00;
      codeUnits.push(highSurrogate, lowSurrogate);
    }

    if (index + 1 === length || codeUnits.length > MAX_SIZE) {
      result += stringFromCharCode.apply(null, codeUnits);
      codeUnits.length = 0;
    }
  }

  return result;
}
/**
 * Regexes
 */


const chars = {}; // Double width characters that are _not_ surrogate pairs.
// NOTE: 0x20000 - 0x2fffd and 0x30000 - 0x3fffd are not necessary for this
// regex anyway. This regex is used to put a blank char after wide chars to
// be eaten, however, if this is a surrogate pair, parseContent already adds
// the extra one char because its length equals 2 instead of 1.

chars.wide = new RegExp('([' + '\\u1100-\\u115f' // Hangul Jamo init. consonants
+ '\\u2329\\u232a' + '\\u2e80-\\u303e\\u3040-\\ua4cf' // CJK ... Yi
+ '\\uac00-\\ud7a3' // Hangul Syllables
+ '\\uf900-\\ufaff' // CJK Compatibility Ideographs
+ '\\ufe10-\\ufe19' // Vertical forms
+ '\\ufe30-\\ufe6f' // CJK Compatibility Forms
+ '\\uff00-\\uff60' // Fullwidth Forms
+ '\\uffe0-\\uffe6' + '])', 'g'); // All surrogate pair wide chars.

chars.swide = new RegExp('(' // 0x20000 - 0x2fffd:
+ '[\\ud840-\\ud87f][\\udc00-\\udffd]' + '|' // 0x30000 - 0x3fffd:
+ '[\\ud880-\\ud8bf][\\udc00-\\udffd]' + ')', 'g'); // All wide chars including surrogate pairs.

chars.all = new RegExp('(' + chars.swide.source.slice(1, -1) + '|' + chars.wide.source.slice(1, -1) + ')', 'g'); // Regex to detect a surrogate pair.

chars.surrogate = /[\ud800-\udbff][\udc00-\udfff]/g; // Regex to find combining characters.

chars.combining = combiningTable.reduce(function (out, row) {
  let low, high, range;

  if (row[0] > 0x00ffff) {
    low = fromCodePoint(row[0]);
    low = [hexify(low.charCodeAt(0)), hexify(low.charCodeAt(1))];
    high = fromCodePoint(row[1]);
    high = [hexify(high.charCodeAt(0)), hexify(high.charCodeAt(1))];
    range = '[\\u' + low[0] + '-' + '\\u' + high[0] + ']' + '[\\u' + low[1] + '-' + '\\u' + high[1] + ']';
    if (!~out.indexOf('|')) out += ']';
    out += '|' + range;
  } else {
    low = hexify(row[0]);
    high = hexify(row[1]);
    low = '\\u' + low;
    high = '\\u' + high;
    out += low + '-' + high;
  }

  return out;
}, '[');
chars.combining = new RegExp(chars.combining, 'g');

function hexify(n) {
  n = n.toString(16);

  while (n.length < 4) n = '0' + n;

  return n;
}

/**
 * textarea.js - textarea element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
const nextTick = global.setImmediate || process.nextTick.bind(process);
class Textarea extends Input {
  /**
   * Textarea
   */
  constructor(options = {}) {
    options.scrollable = options.scrollable !== false;
    super(options);
    this.input = this.readInput;
    this.setInput = this.readInput;
    this.clearInput = this.clearValue;
    this.editor = this.readEditor;
    this.setEditor = this.readEditor;
    const self = this;

    if (!(this instanceof Node)) {
      return new Textarea(options);
    }

    this.screen._listenKeys(this);

    this.value = options.value || '';
    this.__updateCursor = this._updateCursor.bind(this);
    this.on(RESIZE, this.__updateCursor);
    this.on(MOVE, this.__updateCursor);

    if (options.inputOnFocus) {
      this.on(FOCUS, this.readInput.bind(this, null));
    }

    if (!options.inputOnFocus && options.keys) {
      this.on(KEYPRESS, function (ch, key) {
        if (self._reading) return;

        if (key.name === 'enter' || options.vi && key.name === 'i') {
          return self.readInput();
        }

        if (key.name === 'e') {
          return self.readEditor();
        }
      });
    }

    if (options.mouse) {
      this.on(CLICK, function (data) {
        if (self._reading) return;
        if (data.button !== 'right') return;
        self.readEditor();
      });
    }

    this.type = 'textarea';
  }

  _updateCursor(get) {
    if (this.screen.focused !== this) {
      return;
    }

    const lpos = get ? this.lpos : this._getCoords();
    if (!lpos) return;
    let last = this._clines[this._clines.length - 1];
    const program = this.screen.program;
    let line, cx, cy; // Stop a situation where the textarea begins scrolling
    // and the last cline appears to always be empty from the
    // _typeScroll `+ '\n'` thing.
    // Maybe not necessary anymore?

    if (last === '' && this.value[this.value.length - 1] !== '\n') {
      last = this._clines[this._clines.length - 2] || '';
    }

    line = Math.min(this._clines.length - 1 - (this.childBase || 0), lpos.yl - lpos.yi - this.iheight - 1); // When calling clearValue() on a full textarea with a border, the first
    // argument in the above Math.min call ends up being -2. Make sure we stay
    // positive.

    line = Math.max(0, line);
    cy = lpos.yi + this.itop + line;
    cx = lpos.xi + this.ileft + this.strWidth(last); // XXX Not sure, but this may still sometimes
    // cause problems when leaving editor.

    if (cy === program.y && cx === program.x) {
      return;
    }

    if (cy === program.y) {
      if (cx > program.x) {
        program.cuf(cx - program.x);
      } else if (cx < program.x) {
        program.cub(program.x - cx);
      }
    } else if (cx === program.x) {
      if (cy > program.y) {
        program.cud(cy - program.y);
      } else if (cy < program.y) {
        program.cuu(program.y - cy);
      }
    } else {
      program.cup(cy, cx);
    }
  }

  readInput(callback) {
    const self = this,
          focused = this.screen.focused === this;
    if (this._reading) return;
    this._reading = true;
    this._callback = callback;

    if (!focused) {
      this.screen.saveFocus();
      this.focus();
    }

    this.screen.grabKeys = true;

    this._updateCursor();

    this.screen.program.showCursor(); //this.screen.program.sgr('normal');

    this._done = function fn(err, value) {
      if (!self._reading) return;
      if (fn.done) return;
      fn.done = true;
      self._reading = false;
      delete self._callback;
      delete self._done;
      self.removeListener(KEYPRESS, self.__listener);
      delete self.__listener;
      self.removeListener(BLUR, self.__done);
      delete self.__done;
      self.screen.program.hideCursor();
      self.screen.grabKeys = false;

      if (!focused) {
        self.screen.restoreFocus();
      }

      if (self.options.inputOnFocus) {
        self.screen.rewindFocus();
      } // Ugly


      if (err === 'stop') return;

      if (err) {
        self.emit(ERROR, err);
      } else if (value != null) {
        self.emit(SUBMIT, value);
      } else {
        self.emit(CANCEL, value);
      }

      self.emit(ACTION, value);
      if (!callback) return;
      return err ? callback(err) : callback(null, value);
    }; // Put this in a nextTick so the current
    // key event doesn't trigger any keys input.


    nextTick(function () {
      self.__listener = self._listener.bind(self);
      self.on(KEYPRESS, self.__listener);
    });
    this.__done = this._done.bind(this, null, null);
    this.on(BLUR, this.__done);
  }

  _listener(ch, key) {
    const done = this._done,
          value = this.value;
    if (key.name === 'return') return;

    if (key.name === 'enter') {
      ch = '\n';
    } // TODO: Handle directional keys.


    if (key.name === 'left' || key.name === 'right' || key.name === 'up' || key.name === 'down') ;

    if (this.options.keys && key.ctrl && key.name === 'e') {
      return this.readEditor();
    } // TODO: Optimize typing by writing directly
    // to the screen and screen buffer here.


    if (key.name === 'escape') {
      done(null, null);
    } else if (key.name === 'backspace') {
      if (this.value.length) {
        if (this.screen.fullUnicode) {
          if (isSurrogate(this.value, this.value.length - 2)) {
            // || unicode.isCombining(this.value, this.value.length - 1)) {
            this.value = this.value.slice(0, -2);
          } else {
            this.value = this.value.slice(0, -1);
          }
        } else {
          this.value = this.value.slice(0, -1);
        }
      }
    } else if (ch) {
      if (!/^[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]$/.test(ch)) {
        this.value += ch;
      }
    }

    if (this.value !== value) {
      this.screen.render();
    }
  }

  _typeScroll() {
    // XXX Workaround
    const height = this.height - this.iheight;

    if (this._clines.length - this.childBase > height) {
      this.scroll(this._clines.length);
    }
  }

  getValue() {
    return this.value;
  }

  setValue(value) {
    if (value == null) {
      value = this.value;
    }

    if (this._value !== value) {
      this.value = value;
      this._value = value;
      this.setContent(this.value);

      this._typeScroll();

      this._updateCursor();
    }
  }

  clearValue() {
    return this.setValue('');
  }

  submit() {
    if (!this.__listener) return;
    return this.__listener('\x1b', {
      name: 'escape'
    });
  }

  cancel() {
    if (!this.__listener) return;
    return this.__listener('\x1b', {
      name: 'escape'
    });
  }

  render() {
    this.setValue();
    return this._render();
  }

  readEditor(callback) {
    const self = this;

    if (this._reading) {
      const _cb = this._callback,
            cb = callback;

      this._done('stop');

      callback = function (err, value) {
        if (_cb) _cb(err, value);
        if (cb) cb(err, value);
      };
    }

    if (!callback) {
      callback = function () {};
    }

    return this.screen.readEditor({
      value: this.value
    }, function (err, value) {
      if (err) {
        if (err.message === 'Unsuccessful.') {
          self.screen.render();
          return self.readInput(callback);
        }

        self.screen.render();
        self.readInput(callback);
        return callback(err);
      }

      self.setValue(value);
      self.screen.render();
      return self.readInput(callback);
    });
  }

}

/**
 * textbox.js - textbox element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Textbox extends Textarea {
  /**
   * Textbox
   */
  constructor(options = {}) {
    options.scrollable = false;
    super(options); // if (!(this instanceof Node)) { return new Textbox(options) }

    this.secret = options.secret;
    this.censor = options.censor;
    this.type = 'textbox';
    this.__olistener = Textbox.prototype._listener;
  }

  _listener(ch, key) {
    if (key.name === 'enter') {
      this._done(null, this.value);

      return;
    }

    return this.__olistener(ch, key);
  }

  setValue(value) {
    let visible, val;

    if (value == null) {
      value = this.value;
    }

    if (this._value !== value) {
      value = value.replace(/\n/g, '');
      this.value = value;
      this._value = value;

      if (this.secret) {
        this.setContent('');
      } else if (this.censor) {
        this.setContent(Array(this.value.length + 1).join('*'));
      } else {
        visible = -(this.width - this.iwidth - 1);
        val = this.value.replace(/\t/g, this.screen.tabc);
        this.setContent(val.slice(visible));
      }

      this._updateCursor();
    }
  }

  submit() {
    if (!this.__listener) return;
    return this.__listener('\r', {
      name: 'enter'
    });
  }

}
/**
 * Expose
 */

/**
 * prompt.js - prompt element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Prompt extends Box {
  /**
   * Prompt
   */
  constructor(options = {}) {
    options.hidden = true;
    super(options); // if (!(this instanceof Node)) return new Prompt(options)

    this.input = this.readInput;
    this.setInput = this.readInput;
    this._.input = new Textbox({
      parent: this,
      top: 3,
      height: 1,
      left: 2,
      right: 2,
      bg: 'black'
    });
    this._.okay = new Button({
      parent: this,
      top: 5,
      height: 1,
      left: 2,
      width: 6,
      content: 'Okay',
      align: 'center',
      bg: 'black',
      hoverBg: 'blue',
      autoFocus: false,
      mouse: true
    });
    this._.cancel = new Button({
      parent: this,
      top: 5,
      height: 1,
      shrink: true,
      left: 10,
      width: 8,
      content: 'Cancel',
      align: 'center',
      bg: 'black',
      hoverBg: 'blue',
      autoFocus: false,
      mouse: true
    });
    this.type = 'prompt';
  }

  readInput(text, value, callback) {
    const self = this;
    let okay, cancel;

    if (!callback) {
      callback = value;
      value = '';
    } // Keep above:
    // var parent = this.parent;
    // this.detach();
    // parent.append(this);


    this.show();
    this.setContent(' ' + text);
    this._.input.value = value;
    this.screen.saveFocus();

    this._.okay.on(PRESS, okay = function () {
      self._.input.submit();
    });

    this._.cancel.on(PRESS, cancel = function () {
      self._.input.cancel();
    });

    this._.input.readInput(function (err, data) {
      self.hide();
      self.screen.restoreFocus();

      self._.okay.removeListener(PRESS, okay);

      self._.cancel.removeListener(PRESS, cancel);

      return callback(err, data);
    });

    this.screen.render();
  }

}

/**
 * question.js - question element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Question extends Box {
  /**
   * Question
   */
  constructor(options = {}) {
    options.hidden = true;
    super(options); // if (!(this instanceof Node)) return new Question(options)

    this._.okay = new Button({
      screen: this.screen,
      parent: this,
      top: 2,
      height: 1,
      left: 2,
      width: 6,
      content: 'Okay',
      align: 'center',
      bg: 'black',
      hoverBg: 'blue',
      autoFocus: false,
      mouse: true
    });
    this._.cancel = new Button({
      screen: this.screen,
      parent: this,
      top: 2,
      height: 1,
      shrink: true,
      left: 10,
      width: 8,
      content: 'Cancel',
      align: 'center',
      bg: 'black',
      hoverBg: 'blue',
      autoFocus: false,
      mouse: true
    });
    this.type = 'question';
  }

  ask(text, callback) {
    const self = this;
    let press, okay, cancel; // Keep above:
    // var parent = this.parent;
    // this.detach();
    // parent.append(this);

    this.show();
    this.setContent(' ' + text);
    this.onScreenEvent(KEYPRESS, press = function (ch, key) {
      if (key.name === MOUSE) return;

      if (key.name !== 'enter' && key.name !== 'escape' && key.name !== 'q' && key.name !== 'y' && key.name !== 'n') {
        return;
      }

      done(null, key.name === 'enter' || key.name === 'y');
    });

    this._.okay.on(PRESS, okay = function () {
      done(null, true);
    });

    this._.cancel.on(PRESS, cancel = function () {
      done(null, false);
    });

    this.screen.saveFocus();
    this.focus();

    function done(err, data) {
      self.hide();
      self.screen.restoreFocus();
      self.removeScreenEvent(KEYPRESS, press);

      self._.okay.removeListener(PRESS, okay);

      self._.cancel.removeListener(PRESS, cancel);

      return callback(err, data);
    }

    this.screen.render();
  }

}

/**
 * radiobutton.js - radio button element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class RadioButton extends Checkbox {
  /**
   * RadioButton
   */
  constructor(options = {}) {
    super(options);
    const self = this; // if (!(this instanceof Node)) return new RadioButton(options)

    this.on(CHECK, function () {
      let el = self;

      while (el = el.parent) {
        if (el.type === 'radio-set' || el.type === 'form') break;
      }

      el = el || self.parent;
      el.forDescendants(function (el) {
        if (el.type !== 'radio-button' || el === self) {
          return;
        }

        el.uncheck();
      });
    });
    this.type = 'radio-button';
    this.toggle = RadioButton.prototype.check;
  }

  render() {
    this.clearPos(true);
    this.setContent('(' + (this.checked ? '*' : ' ') + ') ' + this.text, true);
    return this._render();
  }

}

/**
 * radioset.js - radio set element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class RadioSet extends Box {
  /**
   * RadioSet
   */
  constructor(options = {}) {
    super(options); // if (!(this instanceof Node)) return new RadioSet(options)
    // Possibly inherit parent's style.
    // options.style = this.parent.style;

    this.type = 'radio-set';
  }

}

export { Button, Checkbox, FileManager, Form, Input, Prompt, Question, RadioButton, RadioSet };
