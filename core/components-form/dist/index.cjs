'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var enumEvents = require('@pres/enum-events');
var enumKeyNames = require('@pres/enum-key-names');
var componentsCore = require('@pres/components-core');
var componentsData = require('@pres/components-data');
var helpers = require('@pres/util-helpers');
var fs = require('fs');
var path = require('path');
var unicode = require('@pres/util-unicode');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var helpers__namespace = /*#__PURE__*/_interopNamespace(helpers);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var unicode__namespace = /*#__PURE__*/_interopNamespace(unicode);

/**
 * input.js - abstract input element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Input extends componentsCore.Box {
  constructor(options = {}) {
    if (!options.sku) options.sku = 'input';
    super(options);
    this.type = 'input';
  }

  static build(options) {
    return new Input(options);
  }

}

/**
 * button.js - button element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Button extends Input {
  constructor(options = {}) {
    if (!options.sku) options.sku = 'button';
    if (options.autoFocus == null) options.autoFocus = false;
    super(options);
    const self = this; // if (!(this instanceof Node)) return new Button(options)

    this.on(enumEvents.KEYPRESS, (ch, key) => {
      const name = key.name;
      if (name === enumKeyNames.ENTER || name === enumKeyNames.SPACE || name === enumKeyNames.RETURN) return self.press();
    });

    if (this.options.mouse) {
      this.on(enumEvents.CLICK, () => self.press());
    }

    this.type = 'button';
  }

  static build(options) {
    return new Button(options);
  }

  press() {
    this.focus();
    this.value = true;
    const result = this.emit(enumEvents.PRESS);
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
    this.on(enumEvents.KEYPRESS, (ch, key) => {
      if (key.name === enumKeyNames.ENTER || key.name === enumKeyNames.SPACE) self.toggle(), self.screen.render();
    });
    if (options.mouse) this.on(enumEvents.CLICK, () => {
      self.toggle(), self.screen.render();
    });
    this.on(enumEvents.FOCUS, function () {
      const prevPos = self.prevPos;
      if (!prevPos) return;
      const program = self.screen.program;
      program.lsaveCursor('checkbox');
      program.cup(prevPos.yLo, prevPos.xLo + 1);
      program.showCursor();
    });
    this.on(enumEvents.BLUR, () => self.screen.program.lrestoreCursor('checkbox', true));
    this.type = 'checkbox'; // console.log(`>>> ${this.type} created, uid = ${this.uid}`)
  }

  static build(options) {
    return new Checkbox(options);
  }

  render() {
    // console.log('>>> checkbox rendered')
    this.clearPos(true);
    this.setContent('[' + (this.checked ? 'x' : ' ') + '] ' + this.text, true);
    return this._render();
  }

  check() {
    if (this.checked) return;
    this.checked = this.value = true;
    this.emit(enumEvents.CHECK);
  }

  uncheck() {
    if (!this.checked) return;
    this.checked = this.value = false;
    this.emit(enumEvents.UNCHECK);
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
class FileManager extends componentsData.List {
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
    if (options.label && ~options.label.indexOf('%path')) this._label.setContent(options.label.replace('%path', this.cwd));
    this.on(enumEvents.SELECT, function (item) {
      const value = item.content.replace(/\{[^{}]+\}/g, '').replace(/@$/, ''),
            file = path__default["default"].resolve(self.cwd, value);
      return fs__default["default"].stat(file, function (err, stat) {
        if (err) return self.emit(enumEvents.ERROR, err, file);
        self.file = file;
        self.value = file;

        if (stat.isDirectory()) {
          self.emit(enumEvents.CD, file, self.cwd);
          self.cwd = file;

          if (options.label && ~options.label.indexOf('%path')) {
            self._label.setContent(options.label.replace('%path', file));
          }

          self.refresh();
        } else {
          self.emit(enumEvents.FILE, file);
        }
      });
    });
    this.type = 'file-manager';
  }

  static build(options) {
    return new FileManager(options);
  }

  refresh(cwd, callback) {
    if (!callback) {
      callback = cwd;
      cwd = null;
    }

    const self = this;
    if (cwd) this.cwd = cwd;else cwd = this.cwd;
    return fs__default["default"].readdir(cwd, function (err, list) {
      if (err && err.code === 'ENOENT') {
        self.cwd = cwd !== process.env.HOME ? process.env.HOME : '/';
        return self.refresh(callback);
      }

      if (err) {
        if (callback) return callback(err);
        return self.emit(enumEvents.ERROR, err, cwd);
      }

      let dirs = [],
          files = [];
      list.unshift('..');
      list.forEach(function (name) {
        const f = path__default["default"].resolve(cwd, name);
        let stat;

        try {
          stat = fs__default["default"].lstatSync(f);
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
      dirs = helpers__namespace.asort(dirs);
      files = helpers__namespace.asort(files);
      list = dirs.concat(files).map(function (data) {
        return data.text;
      });
      self.setItems(list);
      self.select(0);
      self.screen.render();
      self.emit(enumEvents.REFRESH);
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
      self.removeListener(enumEvents.FILE, onfile);
      self.removeListener(enumEvents.CANCEL, oncancel);

      if (hidden) {
        self.hide();
      }

      if (!focused) {
        self.screen.restoreFocus();
      }

      self.screen.render();
    }

    this.on(enumEvents.FILE, onfile = function (file) {
      resume();
      return callback(null, file);
    });
    this.on(enumEvents.CANCEL, oncancel = function () {
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
class Form extends componentsCore.Box {
  constructor(options = {}) {
    if (!options.sku) options.sku = 'form';
    options.ignoreKeys = true;
    super(options);
    const self = this; // if (!(this instanceof Node)) return new Form(options)

    if (options.keys) {
      this.screen._listenKeys(this);

      this.on(enumEvents.ELEMENT_KEYPRESS, function (el, ch, key) {
        if (key.name === enumKeyNames.TAB && !key.shift || el.type === 'textbox' && options.autoNext && key.name === enumKeyNames.ENTER || key.name === enumKeyNames.DOWN || options.vi && key.name === 'j') {
          if (el.type === 'textbox' || el.type === 'textarea') {
            if (key.name === 'j') return;
            if (key.name === enumKeyNames.TAB) el.emit(enumEvents.KEYPRESS, null, {
              name: enumKeyNames.BACKSPACE
            }); // Workaround, since we can't stop the tab from being added.

            el.emit(enumEvents.KEYPRESS, '\x1b', {
              name: enumKeyNames.ESCAPE
            });
          }

          self.focusNext();
          return;
        }

        if (key.name === enumKeyNames.TAB && key.shift || key.name === enumKeyNames.UP || options.vi && key.name === 'k') {
          if (el.type === 'textbox' || el.type === 'textarea') {
            if (key.name === 'k') return;
            el.emit(enumEvents.KEYPRESS, '\x1b', {
              name: enumKeyNames.ESCAPE
            });
          }

          self.focusPrevious();
          return;
        }

        if (key.name === enumKeyNames.ESCAPE) self.focus();
      });
    }

    this.type = 'form';
  }

  static build(options) {
    return new Form(options);
  }

  _refresh() {
    // XXX Possibly remove this if statement and refresh on every focus.
    // Also potentially only include *visible* focusable elements.
    // This would remove the need to check for _selected.visible in previous()
    // and next().
    if (!this._sub) {
      const out = [];
      this.sub.forEach(function refreshSub(el) {
        if (el.keyable) out.push(el);
        el.sub.forEach(refreshSub);
      });
      this._sub = out;
    }
  }

  _visible() {
    return !!this._sub.filter(el => el.visible).length;
  }

  next() {
    this._refresh();

    if (!this._visible()) return;

    if (!this._selected) {
      this._selected = this._sub[0];
      if (!this._selected.visible) return this.next();
      if (this.screen.focused !== this._selected) return this._selected;
    }

    const i = this._sub.indexOf(this._selected);

    if (!~i || !this._sub[i + 1]) {
      this._selected = this._sub[0];
      if (!this._selected.visible) return this.next();
      return this._selected;
    }

    this._selected = this._sub[i + 1];
    if (!this._selected.visible) return this.next();
    return this._selected;
  }

  previous() {
    this._refresh();

    if (!this._visible()) return;

    if (!this._selected) {
      this._selected = this._sub[this._sub.length - 1];
      if (!this._selected.visible) return this.previous();
      if (this.screen.focused !== this._selected) return this._selected;
    }

    const i = this._sub.indexOf(this._selected);

    if (!~i || !this._sub[i - 1]) {
      this._selected = this._sub[this._sub.length - 1];
      if (!this._selected.visible) return this.previous();
      return this._selected;
    }

    this._selected = this._sub[i - 1];
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
    this.sub.forEach(function submitSub(el) {
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

      el.sub.forEach(submitSub);
    });
    this.emit(enumEvents.SUBMIT, out);
    return this.submission = out;
  }

  cancel() {
    this.emit(enumEvents.CANCEL);
  }

  reset() {
    this.sub.forEach(function resetSub(el) {
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

      el.sub.forEach(resetSub);
    });
    this.emit(enumEvents.RESET);
  }

}

/**
 * textarea.js - textarea element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
const nextTick = global.setImmediate || process.nextTick.bind(process);
class Textarea extends Input {
  input = this.readInput;
  setInput = this.readInput;
  clearInput = this.clearValue;
  editor = this.readEditor;
  setEditor = this.readEditor;
  /**
   * Textarea
   */

  constructor(options = {}) {
    if (!options.sku) options.sku = 'textarea';
    options.scrollable = options.scrollable !== false;
    super(options);
    const self = this; // if (!(this instanceof Node)) { return new Textarea(options) }

    this.screen._listenKeys(this);

    this.value = options.value || '';
    this.__updateCursor = this._updateCursor.bind(this);
    this.on(enumEvents.RESIZE, this.__updateCursor);
    this.on(enumEvents.MOVE, this.__updateCursor);
    if (options.inputOnFocus) this.on(enumEvents.FOCUS, this.readInput.bind(this, null));
    if (!options.inputOnFocus && options.keys) this.on(enumEvents.KEYPRESS, (ch, key) => {
      if (self._reading) return;
      if (key.name === enumKeyNames.ENTER || options.vi && key.name === 'i') return self.readInput();
      if (key.name === 'e') return self.readEditor();
    });
    if (options.mouse) this.on(enumEvents.CLICK, data => {
      if (self._reading) return;
      if (data.button !== enumKeyNames.RIGHT) return;
      self.readEditor();
    });
    this.type = 'textarea'; // console.log(`>>> constructed ${this.type}`)
  }

  static build(options) {
    return new Textarea(options);
  }

  _updateCursor(get) {
    if (this.screen.focused !== this) return;
    const prevPos = get ? this.prevPos : this.calcCoord();
    if (!prevPos) return;
    let last = this._clines[this._clines.length - 1];
    const program = this.screen.program;
    let line, cx, cy; // Stop a situation where the textarea begins scrolling
    // and the last cline appears to always be empty from the
    // _typeScroll `+ '\n'` thing.
    // Maybe not necessary anymore?

    if (last === '' && this.value[this.value.length - 1] !== '\n') {
      last = this._clines[this._clines.length - 2] || '';
    }

    line = Math.min(this._clines.length - 1 - (this.subBase || 0), prevPos.yHi - prevPos.yLo - this.intH - 1); // When calling clearValue() on a full textarea with a border, the first
    // argument in the above Math.min call ends up being -2. Make sure we stay
    // positive.

    line = Math.max(0, line);
    cy = prevPos.yLo + this.intT + line;
    cx = prevPos.xLo + this.intL + this.strWidth(last); // XXX Not sure, but this may still sometimes
    // cause problems when leaving editor.

    if (cy === program.y && cx === program.x) return;

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
    // console.log('>>> calling textarea.readInput')
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
      if (!self._reading) return void 0;
      if (fn.done) return void 0;
      fn.done = true;
      self._reading = false;
      delete self._callback;
      delete self._done;
      self.removeListener(enumEvents.KEYPRESS, self.__listener);
      delete self.__listener;
      self.removeListener(enumEvents.BLUR, self.__done);
      delete self.__done;
      self.screen.program.hideCursor();
      self.screen.grabKeys = false;
      if (!focused) self.screen.restoreFocus();
      if (self.options.inputOnFocus) self.screen.rewindFocus(); // Ugly

      if (err === 'stop') return void 0;

      if (err) {
        self.emit(enumEvents.ERROR, err);
      } else if (value != null) {
        self.emit(enumEvents.SUBMIT, value);
      } else {
        self.emit(enumEvents.CANCEL, value);
      }

      self.emit(enumEvents.ACTION, value);
      if (!callback) return void 0;
      return err ? callback(err) : callback(null, value);
    }; // Put this in a nextTick so the current
    // key event doesn't trigger any keys input.


    nextTick(() => {
      // console.log('>>> calling nextTick in TextArea')
      self.__listener = self._listener.bind(self);
      self.on(enumEvents.KEYPRESS, self.__listener);
    });
    this.__done = this._done.bind(this, null, null);
    this.on(enumEvents.BLUR, this.__done);
  }

  _listener(ch, key) {
    // console.log('>>> calling _listener in TextArea')
    const done = this._done,
          value = this.value;
    if (key.name === enumKeyNames.RETURN) return;
    if (key.name === enumKeyNames.ENTER) ch = '\n'; // TODO: Handle directional keys.

    if (key.name === enumKeyNames.LEFT || key.name === enumKeyNames.RIGHT || key.name === enumKeyNames.UP || key.name === enumKeyNames.DOWN) ;

    if (this.options.keys && key.ctrl && key.name === 'e') return this.readEditor(); // TODO: Optimize typing by writing directly
    // to the screen and screen buffer here.

    if (key.name === enumKeyNames.ESCAPE) {
      done(null, null);
    } else if (key.name === enumKeyNames.BACKSPACE) {
      if (this.value.length) {
        if (this.screen.fullUnicode) {
          // || unicode.isCombining(this.value, this.value.length - 1)) {
          if (unicode__namespace.isSurrogate(this.value, this.value.length - 2)) {
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
    const height = this.height - this.intH;

    if (this._clines.length - this.subBase > height) {
      this.scroll(this._clines.length);
    }
  }

  getValue() {
    return this.value;
  }

  setValue(value) {
    if (value == null) value = this.value;

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
    return !this.__listener ? void 0 : this.__listener('\x1b', {
      name: enumKeyNames.ESCAPE
    });
  }

  cancel() {
    return !this.__listener ? void 0 : this.__listener('\x1b', {
      name: enumKeyNames.ESCAPE
    });
  }

  render() {
    return this.setValue(), this._render();
  }

  readEditor(callback) {
    // console.log('>>> readEditor in textarea')
    const self = this;

    if (this._reading) {
      const _cb = this._callback,
            cb = callback;

      this._done('stop');

      callback = (err, value) => {
        if (_cb) _cb(err, value);
        if (cb) cb(err, value);
      };
    }

    if (!callback) callback = function () {};
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
  __olistener = super._listener;

  constructor(options = {}) {
    if (!options.sku) options.sku = 'textbox';
    options.scrollable = false;
    super(options); // if (!(this instanceof Node)) { return new Textbox(options) }

    this.secret = options.secret;
    this.censor = options.censor;
    this.type = 'textbox'; // console.log(`>>> constructed ${this.type}`)
  }

  static build(options) {
    return new Textbox(options);
  }

  _listener(ch, key) {
    // console.log('>>> calling _listener in Textbox')
    return key.name === enumKeyNames.ENTER ? void this._done(null, this.value) : this.__olistener(ch, key);
  }

  setValue(value) {
    let visible, val;
    if (value == null) value = this.value;

    if (this._value !== value) {
      value = value.replace(/\n/g, '');
      this.value = value;
      this._value = value;

      if (this.secret) {
        this.setContent('');
      } else if (this.censor) {
        this.setContent(Array(this.value.length + 1).join('*'));
      } else {
        visible = -(this.width - this.intW - 1);
        val = this.value.replace(/\t/g, this.screen.tabc);
        this.setContent(val.slice(visible));
      }

      this._updateCursor();
    }
  }

  submit() {
    return this.__listener ? this.__listener('\r', {
      name: enumKeyNames.ENTER
    }) : void 0;
  }

}

/**
 * prompt.js - prompt element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Prompt extends componentsCore.Box {
  input = this.readInput;
  setInput = this.readInput;
  /**
   * Prompt
   */

  constructor(options = {}) {
    options.hidden = true;
    super(options); // if (!(this instanceof Node)) return new Prompt(options)

    this._.input = new Textbox({
      sup: this,
      top: 3,
      height: 1,
      left: 2,
      right: 2,
      bg: 'black'
    });
    this._.okay = new Button({
      sup: this,
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
      sup: this,
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

  static build(options) {
    return new Prompt(options);
  }

  readInput(text, value, callback) {
    const self = this;
    let okay, cancel;

    if (!callback) {
      callback = value;
      value = '';
    } // Keep above:
    // var sup = this.sup;
    // this.detach();
    // sup.append(this);


    this.show();
    this.setContent(' ' + text);
    this._.input.value = value;
    this.screen.saveFocus();

    this._.okay.on(enumEvents.PRESS, okay = function () {
      self._.input.submit();
    });

    this._.cancel.on(enumEvents.PRESS, cancel = function () {
      self._.input.cancel();
    });

    this._.input.readInput(function (err, data) {
      self.hide();
      self.screen.restoreFocus();

      self._.okay.removeListener(enumEvents.PRESS, okay);

      self._.cancel.removeListener(enumEvents.PRESS, cancel);

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
class Question extends componentsCore.Box {
  /**
   * Question
   */
  constructor(options = {}) {
    options.hidden = true;
    super(options); // if (!(this instanceof Node)) return new Question(options)

    this._.okay = new Button({
      screen: this.screen,
      sup: this,
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
      sup: this,
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

  static build(options) {
    return new Question(options);
  }

  ask(text, callback) {
    const self = this;
    let press, okay, cancel; // Keep above:
    // var sup = this.sup;
    // this.detach();
    // sup.append(this);

    this.show();
    this.setContent(' ' + text);
    this.onScreenEvent(enumEvents.KEYPRESS, press = function (ch, key) {
      if (key.name === enumEvents.MOUSE) return;

      if (key.name !== enumKeyNames.ENTER && key.name !== enumKeyNames.ESCAPE && key.name !== 'q' && key.name !== 'y' && key.name !== 'n') {
        return;
      }

      done(null, key.name === enumKeyNames.ENTER || key.name === 'y');
    });

    this._.okay.on(enumEvents.PRESS, okay = function () {
      done(null, true);
    });

    this._.cancel.on(enumEvents.PRESS, cancel = function () {
      done(null, false);
    });

    this.screen.saveFocus();
    this.focus();

    function done(err, data) {
      self.hide();
      self.screen.restoreFocus();
      self.removeScreenEvent(enumEvents.KEYPRESS, press);

      self._.okay.removeListener(enumEvents.PRESS, okay);

      self._.cancel.removeListener(enumEvents.PRESS, cancel);

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
/**
 * RadioButton
 */

class RadioButton extends Checkbox {
  toggle = this.check;

  constructor(options = {}) {
    super(options);
    const self = this; // if (!(this instanceof Node)) return new RadioButton(options)

    this.on(enumEvents.CHECK, () => {
      let node = self,
          type;

      while ((node = node.sup) && ({
        type
      } = node)) {
        if (type === 'radio-set' || type === 'form') break;
      }

      node = node ?? self.sup;
      node.forDescendants(node => {
        if (node.type !== 'radio-button' || node === self) return void 0;
        node.uncheck();
      });
    });
    this.type = 'radio-button';
  }

  static build(options) {
    return new RadioButton(options);
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
class RadioSet extends componentsCore.Box {
  /**
   * RadioSet
   */
  constructor(options = {}) {
    super(options); // if (!(this instanceof Node)) return new RadioSet(options)
    // Possibly inherit sup's style.
    // options.style = this.sup.style;

    this.type = 'radio-set';
  }

  static build(options) {
    return new RadioSet(options);
  }

}

exports.Button = Button;
exports.Checkbox = Checkbox;
exports.FileManager = FileManager;
exports.Form = Form;
exports.Input = Input;
exports.Prompt = Prompt;
exports.Question = Question;
exports.RadioButton = RadioButton;
exports.RadioSet = RadioSet;
exports.Textarea = Textarea;
exports.Textbox = Textbox;
