'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var colors$1 = require('@pres/util-colors');
var helpers$1 = require('@pres/util-helpers');
var unicode$1 = require('@pres/util-unicode');
var mixin = require('@ject/mixin');
var assert = require('assert');
var events = require('@pres/events');
var program = require('@pres/program');
var util = require('util');

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
          get: function () {
            return e[k];
          }
        });
      }
    });
  }
  n['default'] = e;
  return Object.freeze(n);
}

var colors__namespace = /*#__PURE__*/_interopNamespace(colors$1);
var helpers__namespace = /*#__PURE__*/_interopNamespace(helpers$1);
var unicode__namespace = /*#__PURE__*/_interopNamespace(unicode$1);
var assert__default = /*#__PURE__*/_interopDefaultLegacy(assert);
var util__default = /*#__PURE__*/_interopDefaultLegacy(util);

/**
 * screen.js - screen node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
const nextTick$3 = global.setImmediate || process.nextTick.bind(process);
class Screen$1 extends Node {
  constructor(_options) {
    super(_options);
    this.type = 'screen';
    this._destroy = this.destroy;
    this.focusPrev = this.focusPrevious;
    this.unkey = this.removeKey;

    this.spawn = function (file, args, options) {
      if (!Array.isArray(args)) {
        options = args;
        args = [];
      }

      const screen = this,
            program = screen.program,
            spawn = require('child_process').spawn,
            mouse = program.mouseEnabled;

      let ps;
      options = options || {};
      options.stdio = options.stdio || 'inherit';
      program.lsaveCursor('spawn'); // program.csr(0, program.rows - 1);

      program.normalBuffer();
      program.showCursor();
      if (mouse) program.disableMouse();
      const write = program.output.write;

      program.output.write = function () {};

      program.input.pause();

      if (program.input.setRawMode) {
        program.input.setRawMode(false);
      }

      const resume = function () {
        if (resume.done) return;
        resume.done = true;

        if (program.input.setRawMode) {
          program.input.setRawMode(true);
        }

        program.input.resume();
        program.output.write = write;
        program.alternateBuffer(); // program.csr(0, program.rows - 1);

        if (mouse) {
          program.enableMouse();

          if (screen.options.sendFocus) {
            screen.program.setMouse({
              sendFocus: true
            }, true);
          }
        }

        screen.alloc();
        screen.render();
        screen.program.lrestoreCursor('spawn', true);
      };

      ps = spawn(file, args, options);
      ps.on('error', resume);
      ps.on('exit', resume);
      return ps;
    };

    this.cursorReset = this.resetCursor;
    const self = this;

    if (!(this instanceof Node)) {
      super();
      this.type = 'screen';
      this._destroy = this.destroy;
      this.focusPrev = this.focusPrevious;
      this.unkey = this.removeKey;

      this.spawn = function (file, args, options) {
        if (!Array.isArray(args)) {
          options = args;
          args = [];
        }

        const screen = this,
              program = screen.program,
              spawn = require('child_process').spawn,
              mouse = program.mouseEnabled;

        let ps;
        options = options || {};
        options.stdio = options.stdio || 'inherit';
        program.lsaveCursor('spawn');
        program.normalBuffer();
        program.showCursor();
        if (mouse) program.disableMouse();
        const write = program.output.write;

        program.output.write = function () {};

        program.input.pause();

        if (program.input.setRawMode) {
          program.input.setRawMode(false);
        }

        const resume = function () {
          if (resume.done) return;
          resume.done = true;

          if (program.input.setRawMode) {
            program.input.setRawMode(true);
          }

          program.input.resume();
          program.output.write = write;
          program.alternateBuffer();

          if (mouse) {
            program.enableMouse();

            if (screen.options.sendFocus) {
              screen.program.setMouse({
                sendFocus: true
              }, true);
            }
          }

          screen.alloc();
          screen.render();
          screen.program.lrestoreCursor('spawn', true);
        };

        ps = spawn(file, args, options);
        ps.on('error', resume);
        ps.on('exit', resume);
        return ps;
      };

      this.cursorReset = this.resetCursor;
      return new Screen$1(_options);
    }

    Screen$1.configSingleton(this);
    _options = _options || {};

    if (_options.rsety && _options.listen) {
      _options = {
        program: _options
      };
    }

    this.program = _options.program;

    if (!this.program) {
      this.program = program.Program.build({
        input: _options.input,
        output: _options.output,
        log: _options.log,
        debug: _options.debug,
        dump: _options.dump,
        terminal: _options.terminal || _options.term,
        resizeTimeout: _options.resizeTimeout,
        forceUnicode: _options.forceUnicode,
        tput: true,
        buffer: true,
        zero: true
      });
    } else {
      this.program.setupTput();
      this.program.useBuffer = true;
      this.program.zero = true;
      this.program.options.resizeTimeout = _options.resizeTimeout;

      if (_options.forceUnicode != null) {
        this.program.tput.features.unicode = _options.forceUnicode;
        this.program.tput.unicode = _options.forceUnicode;
      }
    }

    this.tput = this.program.tput;
    super(_options);
    this.type = 'screen';
    this._destroy = this.destroy;
    this.focusPrev = this.focusPrevious;
    this.unkey = this.removeKey;

    this.spawn = function (file, args, options) {
      if (!Array.isArray(args)) {
        options = args;
        args = [];
      }

      const screen = this,
            program = screen.program,
            spawn = require('child_process').spawn,
            mouse = program.mouseEnabled;

      let ps;
      options = options || {};
      options.stdio = options.stdio || 'inherit';
      program.lsaveCursor('spawn');
      program.normalBuffer();
      program.showCursor();
      if (mouse) program.disableMouse();
      const write = program.output.write;

      program.output.write = function () {};

      program.input.pause();

      if (program.input.setRawMode) {
        program.input.setRawMode(false);
      }

      const resume = function () {
        if (resume.done) return;
        resume.done = true;

        if (program.input.setRawMode) {
          program.input.setRawMode(true);
        }

        program.input.resume();
        program.output.write = write;
        program.alternateBuffer();

        if (mouse) {
          program.enableMouse();

          if (screen.options.sendFocus) {
            screen.program.setMouse({
              sendFocus: true
            }, true);
          }
        }

        screen.alloc();
        screen.render();
        screen.program.lrestoreCursor('spawn', true);
      };

      ps = spawn(file, args, options);
      ps.on('error', resume);
      ps.on('exit', resume);
      return ps;
    };

    this.cursorReset = this.resetCursor;
    this.autoPadding = _options.autoPadding !== false;
    this.tabc = Array((_options.tabSize || 4) + 1).join(' ');
    this.dockBorders = _options.dockBorders;
    this.ignoreLocked = _options.ignoreLocked || [];
    this._unicode = this.tput.unicode || this.tput.numbers.U8 === 1;
    this.fullUnicode = this.options.fullUnicode && this._unicode;
    this.dattr = 0 << 18 | 0x1ff << 9 | 0x1ff;
    this.renders = 0;
    this.position = {
      left: this.left = this.aleft = this.rleft = 0,
      right: this.right = this.aright = this.rright = 0,
      top: this.top = this.atop = this.rtop = 0,
      bottom: this.bottom = this.abottom = this.rbottom = 0,

      get height() {
        return self.height;
      },

      get width() {
        return self.width;
      }

    };
    this.ileft = 0;
    this.itop = 0;
    this.iright = 0;
    this.ibottom = 0;
    this.iheight = 0;
    this.iwidth = 0;
    this.padding = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
    this.hover = null;
    this.history = [];
    this.clickable = [];
    this.keyable = [];
    this.grabKeys = false;
    this.lockKeys = false;
    this.focused;
    this._buf = '';
    this._ci = -1;

    if (_options.title) {
      this.title = _options.title;
    }

    _options.cursor = _options.cursor || {
      artificial: _options.artificialCursor,
      shape: _options.cursorShape,
      blink: _options.cursorBlink,
      color: _options.cursorColor
    };
    this.cursor = {
      artificial: _options.cursor.artificial || false,
      shape: _options.cursor.shape || 'block',
      blink: _options.cursor.blink || false,
      color: _options.cursor.color || null,
      _set: false,
      _state: 1,
      _hidden: true
    };
    this.program.on('resize', function () {
      self.alloc();
      self.render();

      (function emit(el) {
        el.emit('resize');
        el.children.forEach(emit);
      })(self);
    });
    this.program.on('focus', function () {
      self.emit('focus');
    });
    this.program.on('blur', function () {
      self.emit('blur');
    });
    this.program.on('warning', function (text) {
      self.emit('warning', text);
    });
    this.on('newListener', function fn(type) {
      if (type === 'keypress' || type.indexOf('key ') === 0 || type === 'mouse') {
        if (type === 'keypress' || type.indexOf('key ') === 0) self._listenKeys();
        if (type === 'mouse') self._listenMouse();
      }

      if (type === 'mouse' || type === 'click' || type === 'mouseover' || type === 'mouseout' || type === 'mousedown' || type === 'mouseup' || type === 'mousewheel' || type === 'wheeldown' || type === 'wheelup' || type === 'mousemove') {
        self._listenMouse();
      }
    });
    this.setMaxListeners(Infinity);
    this.enter();
    this.postEnter();
  }

  get title() {
    return this.program.title;
  }

  set title(title) {
    return this.program.title = title;
  }

  get terminal() {
    return this.program.terminal;
  }

  set terminal(terminal) {
    return this.setTerminal(terminal), this.program.terminal;
  }

  get cols() {
    return this.program.cols;
  }

  get rows() {
    return this.program.rows;
  }

  get width() {
    return this.program.cols;
  }

  get height() {
    return this.program.rows;
  }

  get focused() {
    return this.history[this.history.length - 1];
  }

  set focused(el) {
    return this.focusPush(el);
  }

  static configSingleton(screen) {
    if (!Screen$1.global) {
      Screen$1.global = screen;
    }

    if (!~Screen$1.instances.indexOf(screen)) {
      Screen$1.instances.push(screen);
      screen.index = Screen$1.total;
      Screen$1.total++;
    }

    if (Screen$1._bound) return;
    Screen$1._bound = true;
    process.on('uncaughtException', Screen$1._exceptionHandler = function (err) {
      if (process.listeners('uncaughtException').length > 1) {
        return;
      }

      Screen$1.instances.slice().forEach(function (screen) {
        screen.destroy();
      });
      err = err || new Error('Uncaught Exception.');
      console.error(err.stack ? err.stack + '' : err + '');
      nextTick$3(function () {
        process.exit(1);
      });
    });
    ['SIGTERM', 'SIGINT', 'SIGQUIT'].forEach(function (signal) {
      const name = '_' + signal.toLowerCase() + 'Handler';
      process.on(signal, Screen$1[name] = function () {
        if (process.listeners(signal).length > 1) {
          return;
        }

        nextTick$3(function () {
          process.exit(0);
        });
      });
    });
    process.on('exit', Screen$1._exitHandler = function () {
      Screen$1.instances.slice().forEach(function (screen) {
        screen.destroy();
      });
    });
  }

  setTerminal(terminal) {
    const entered = !!this.program.isAlt;

    if (entered) {
      this._buf = '';
      this.program._buf = '';
      this.leave();
    }

    this.program.setTerminal(terminal);
    this.tput = this.program.tput;

    if (entered) {
      this.enter();
    }
  }

  enter() {
    if (this.program.isAlt) return;

    if (!this.cursor._set) {
      if (this.options.cursor.shape) {
        this.cursorShape(this.cursor.shape, this.cursor.blink);
      }

      if (this.options.cursor.color) {
        this.cursorColor(this.cursor.color);
      }
    }

    if (process.platform === 'win32') {
      try {
        cp.execSync('cls', {
          stdio: 'ignore',
          timeout: 1000
        });
      } catch (e) {}
    }

    this.program.alternateBuffer();
    this.program.put.keypad_xmit();
    this.program.csr(0, this.height - 1);
    this.program.hideCursor();
    this.program.cup(0, 0); // We need this for tmux now:

    if (this.tput.strings.ena_acs) {
      this.program._write(this.tput.enacs());
    }

    this.alloc();
  }

  leave() {
    if (!this.program.isAlt) return;
    this.program.put.keypad_local();

    if (this.program.scrollTop !== 0 || this.program.scrollBottom !== this.rows - 1) {
      this.program.csr(0, this.height - 1);
    } // XXX For some reason if alloc/clear() is before this
    // line, it doesn't work on linux console.


    this.program.showCursor();
    this.alloc();

    if (this._listenedMouse) {
      this.program.disableMouse();
    }

    this.program.normalBuffer();
    if (this.cursor._set) this.cursorReset();
    this.program.flush();

    if (process.platform === 'win32') {
      try {
        cp.execSync('cls', {
          stdio: 'ignore',
          timeout: 1000
        });
      } catch (e) {}
    }
  }

  postEnter() {
    const self = this;

    if (this.options.debug) {
      this.debugLog = new Log({
        screen: this,
        parent: this,
        hidden: true,
        draggable: true,
        left: 'center',
        top: 'center',
        width: '30%',
        height: '30%',
        border: 'line',
        label: ' {bold}Debug Log{/bold} ',
        tags: true,
        keys: true,
        vi: true,
        mouse: true,
        scrollbar: {
          ch: ' ',
          track: {
            bg: 'yellow'
          },
          style: {
            inverse: true
          }
        }
      });

      this.debugLog.toggle = function () {
        if (self.debugLog.hidden) {
          self.saveFocus();
          self.debugLog.show();
          self.debugLog.setFront();
          self.debugLog.focus();
        } else {
          self.debugLog.hide();
          self.restoreFocus();
        }

        self.render();
      };

      this.debugLog.key(['q', 'escape'], self.debugLog.toggle);
      this.key('f12', self.debugLog.toggle);
    }

    if (this.options.warnings) {
      this.on('warning', function (text) {
        const warning = new Box({
          screen: self,
          parent: self,
          left: 'center',
          top: 'center',
          width: 'shrink',
          padding: 1,
          height: 'shrink',
          align: 'center',
          valign: 'middle',
          border: 'line',
          label: ' {red-fg}{bold}WARNING{/} ',
          content: '{bold}' + text + '{/bold}',
          tags: true
        });
        self.render();
        const timeout = setTimeout(function () {
          warning.destroy();
          self.render();
        }, 1500);

        if (timeout.unref) {
          timeout.unref();
        }
      });
    }
  }

  destroy() {
    this.leave();
    const index = Screen$1.instances.indexOf(this);

    if (~index) {
      Screen$1.instances.splice(index, 1);
      Screen$1.total--;
      Screen$1.global = Screen$1.instances[0];

      if (Screen$1.total === 0) {
        Screen$1.global = null;
        process.removeListener('uncaughtException', Screen$1._exceptionHandler);
        process.removeListener('SIGTERM', Screen$1._sigtermHandler);
        process.removeListener('SIGINT', Screen$1._sigintHandler);
        process.removeListener('SIGQUIT', Screen$1._sigquitHandler);
        process.removeListener('exit', Screen$1._exitHandler);
        delete Screen$1._exceptionHandler;
        delete Screen$1._sigtermHandler;
        delete Screen$1._sigintHandler;
        delete Screen$1._sigquitHandler;
        delete Screen$1._exitHandler;
        delete Screen$1._bound;
      }

      this.destroyed = true;
      this.emit('destroy');

      this._destroy();
    }

    this.program.destroy();
  }

  log() {
    return this.program.log.apply(this.program, arguments);
  }

  debug() {
    if (this.debugLog) {
      this.debugLog.log.apply(this.debugLog, arguments);
    }

    return this.program.debug.apply(this.program, arguments);
  }

  _listenMouse(el) {
    const self = this;

    if (el && !~this.clickable.indexOf(el)) {
      el.clickable = true;
      this.clickable.push(el);
    }

    if (this._listenedMouse) return;
    this._listenedMouse = true;
    this.program.enableMouse();

    if (this.options.sendFocus) {
      this.program.setMouse({
        sendFocus: true
      }, true);
    }

    this.on('render', function () {
      self._needsClickableSort = true;
    });
    this.program.on('mouse', function (data) {
      if (self.lockKeys) return;

      if (self._needsClickableSort) {
        self.clickable = helpers.hsort(self.clickable);
        self._needsClickableSort = false;
      }

      let i = 0,
          el,
          set,
          pos;

      for (; i < self.clickable.length; i++) {
        el = self.clickable[i];

        if (el.detached || !el.visible) {
          continue;
        } // if (self.grabMouse && self.focused !== el
        //     && !el.hasAncestor(self.focused)) continue;


        pos = el.lpos;
        if (!pos) continue;

        if (data.x >= pos.xi && data.x < pos.xl && data.y >= pos.yi && data.y < pos.yl) {
          el.emit('mouse', data);

          if (data.action === 'mousedown') {
            self.mouseDown = el;
          } else if (data.action === 'mouseup') {
            (self.mouseDown || el).emit('click', data);
            self.mouseDown = null;
          } else if (data.action === 'mousemove') {
            if (self.hover && el.index > self.hover.index) {
              set = false;
            }

            if (self.hover !== el && !set) {
              if (self.hover) {
                self.hover.emit('mouseout', data);
              }

              el.emit('mouseover', data);
              self.hover = el;
            }

            set = true;
          }

          el.emit(data.action, data);
          break;
        }
      } // Just mouseover?


      if ((data.action === 'mousemove' || data.action === 'mousedown' || data.action === 'mouseup') && self.hover && !set) {
        self.hover.emit('mouseout', data);
        self.hover = null;
      }

      self.emit('mouse', data);
      self.emit(data.action, data);
    }); // Autofocus highest element.
    // this.on('element click', function(el, data) {
    //   var target;
    //   do {
    //     if (el.clickable === true && el.options.autoFocus !== false) {
    //       target = el;
    //     }
    //   } while (el = el.parent);
    //   if (target) target.focus();
    // });
    // Autofocus elements with the appropriate option.

    this.on('element click', function (el) {
      if (el.clickable === true && el.options.autoFocus !== false) {
        el.focus();
      }
    });
  }

  enableMouse(el) {
    this._listenMouse(el);
  }

  _listenKeys(el) {
    const self = this;

    if (el && !~this.keyable.indexOf(el)) {
      el.keyable = true;
      this.keyable.push(el);
    }

    if (this._listenedKeys) return;
    this._listenedKeys = true; // NOTE: The event emissions used to be reversed:
    // element + screen
    // They are now:
    // screen + element
    // After the first keypress emitted, the handler
    // checks to make sure grabKeys, lockKeys, and focused
    // weren't changed, and handles those situations appropriately.

    this.program.on('keypress', function (ch, key) {
      if (self.lockKeys && !~self.ignoreLocked.indexOf(key.full)) {
        return;
      }

      const focused = self.focused,
            grabKeys = self.grabKeys;

      if (!grabKeys || ~self.ignoreLocked.indexOf(key.full)) {
        self.emit('keypress', ch, key);
        self.emit('key ' + key.full, ch, key);
      } // If something changed from the screen key handler, stop.


      if (self.grabKeys !== grabKeys || self.lockKeys) {
        return;
      }

      if (focused && focused.keyable) {
        focused.emit('keypress', ch, key);
        focused.emit('key ' + key.full, ch, key);
      }
    });
  }

  enableKeys(el) {
    this._listenKeys(el);
  }

  enableInput(el) {
    this._listenMouse(el);

    this._listenKeys(el);
  }

  _initHover() {
    const self = this;

    if (this._hoverText) {
      return;
    }

    this._hoverText = new Box({
      screen: this,
      left: 0,
      top: 0,
      tags: false,
      height: 'shrink',
      width: 'shrink',
      border: 'line',
      style: {
        border: {
          fg: 'default'
        },
        bg: 'default',
        fg: 'default'
      }
    });
    this.on('mousemove', function (data) {
      if (self._hoverText.detached) return;
      self._hoverText.rleft = data.x + 1;
      self._hoverText.rtop = data.y;
      self.render();
    });
    this.on('element mouseover', function (el, data) {
      if (!el._hoverOptions) return;
      self._hoverText.parseTags = el.parseTags;

      self._hoverText.setContent(el._hoverOptions.text);

      self.append(self._hoverText);
      self._hoverText.rleft = data.x + 1;
      self._hoverText.rtop = data.y;
      self.render();
    });
    this.on('element mouseout', function () {
      if (self._hoverText.detached) return;

      self._hoverText.detach();

      self.render();
    }); // XXX This can cause problems if the
    // terminal does not support allMotion.
    // Workaround: check to see if content is set.

    this.on('element mouseup', function (el) {
      if (!self._hoverText.getContent()) return;
      if (!el._hoverOptions) return;
      self.append(self._hoverText);
      self.render();
    });
  }

  alloc(dirty) {
    let x, y;
    this.lines = [];

    for (y = 0; y < this.rows; y++) {
      this.lines[y] = [];

      for (x = 0; x < this.cols; x++) {
        this.lines[y][x] = [this.dattr, ' '];
      }

      this.lines[y].dirty = !!dirty;
    }

    this.olines = [];

    for (y = 0; y < this.rows; y++) {
      this.olines[y] = [];

      for (x = 0; x < this.cols; x++) {
        this.olines[y][x] = [this.dattr, ' '];
      }
    }

    this.program.clear();
  }

  realloc() {
    return this.alloc(true);
  }

  render() {
    const self = this;
    if (this.destroyed) return;
    this.emit('prerender');
    this._borderStops = {}; // TODO: Possibly get rid of .dirty altogether.
    // TODO: Could possibly drop .dirty and just clear the `lines` buffer every
    // time before a screen.render. This way clearRegion doesn't have to be
    // called in arbitrary places for the sake of clearing a spot where an
    // element used to be (e.g. when an element moves or is hidden). There could
    // be some overhead though.
    // this.screen.clearRegion(0, this.cols, 0, this.rows);

    this._ci = 0;
    this.children.forEach(function (el) {
      el.index = self._ci++; //el._rendering = true;

      el.render(); //el._rendering = false;
    });
    this._ci = -1;

    if (this.screen.dockBorders) {
      this._dockBorders();
    }

    this.draw(0, this.lines.length - 1); // XXX Workaround to deal with cursor pos before the screen has rendered and
    // lpos is not reliable (stale).

    if (this.focused && this.focused._updateCursor) {
      this.focused._updateCursor(true);
    }

    this.renders++;
    this.emit('render');
  }

  blankLine(ch, dirty) {
    const out = [];

    for (let x = 0; x < this.cols; x++) {
      out[x] = [this.dattr, ch || ' '];
    }

    out.dirty = dirty;
    return out;
  }

  insertLine(n, y, top, bottom) {
    // if (y === top) return this.insertLineNC(n, y, top, bottom);
    if (!this.tput.strings.change_scroll_region || !this.tput.strings.delete_line || !this.tput.strings.insert_line) return;
    this._buf += this.tput.csr(top, bottom);
    this._buf += this.tput.cup(y, 0);
    this._buf += this.tput.il(n);
    this._buf += this.tput.csr(0, this.height - 1);
    const j = bottom + 1;

    while (n--) {
      this.lines.splice(y, 0, this.blankLine());
      this.lines.splice(j, 1);
      this.olines.splice(y, 0, this.blankLine());
      this.olines.splice(j, 1);
    }
  }

  deleteLine(n, y, top, bottom) {
    // if (y === top) return this.deleteLineNC(n, y, top, bottom);
    if (!this.tput.strings.change_scroll_region || !this.tput.strings.delete_line || !this.tput.strings.insert_line) return;
    this._buf += this.tput.csr(top, bottom);
    this._buf += this.tput.cup(y, 0);
    this._buf += this.tput.dl(n);
    this._buf += this.tput.csr(0, this.height - 1);
    const j = bottom + 1;

    while (n--) {
      this.lines.splice(j, 0, this.blankLine());
      this.lines.splice(y, 1);
      this.olines.splice(j, 0, this.blankLine());
      this.olines.splice(y, 1);
    }
  } // This is how ncurses does it.
  // Scroll down (up cursor-wise).
  // This will only work for top line deletion as opposed to arbitrary lines.


  insertLineNC(n, y, top, bottom) {
    if (!this.tput.strings.change_scroll_region || !this.tput.strings.delete_line) return;
    this._buf += this.tput.csr(top, bottom);
    this._buf += this.tput.cup(top, 0);
    this._buf += this.tput.dl(n);
    this._buf += this.tput.csr(0, this.height - 1);
    const j = bottom + 1;

    while (n--) {
      this.lines.splice(j, 0, this.blankLine());
      this.lines.splice(y, 1);
      this.olines.splice(j, 0, this.blankLine());
      this.olines.splice(y, 1);
    }
  } // This is how ncurses does it.
  // Scroll up (down cursor-wise).
  // This will only work for bottom line deletion as opposed to arbitrary lines.


  deleteLineNC(n, y, top, bottom) {
    if (!this.tput.strings.change_scroll_region || !this.tput.strings.delete_line) return;
    this._buf += this.tput.csr(top, bottom);
    this._buf += this.tput.cup(bottom, 0);
    this._buf += Array(n + 1).join('\n');
    this._buf += this.tput.csr(0, this.height - 1);
    const j = bottom + 1;

    while (n--) {
      this.lines.splice(j, 0, this.blankLine());
      this.lines.splice(y, 1);
      this.olines.splice(j, 0, this.blankLine());
      this.olines.splice(y, 1);
    }
  }

  insertBottom(top, bottom) {
    return this.deleteLine(1, top, top, bottom);
  }

  insertTop(top, bottom) {
    return this.insertLine(1, top, top, bottom);
  }

  deleteBottom(top, bottom) {
    return this.clearRegion(0, this.width, bottom, bottom);
  }

  deleteTop(top, bottom) {
    // Same as: return this.insertBottom(top, bottom);
    return this.deleteLine(1, top, top, bottom);
  } // Parse the sides of an element to determine
  // whether an element has uniform cells on
  // both sides. If it does, we can use CSR to
  // optimize scrolling on a scrollable element.
  // Not exactly sure how worthwile this is.
  // This will cause a performance/cpu-usage hit,
  // but will it be less or greater than the
  // performance hit of slow-rendering scrollable
  // boxes with clean sides?


  cleanSides(el) {
    const pos = el.lpos;

    if (!pos) {
      return false;
    }

    if (pos._cleanSides != null) {
      return pos._cleanSides;
    }

    if (pos.xi <= 0 && pos.xl >= this.width) {
      return pos._cleanSides = true;
    }

    if (this.options.fastCSR) {
      // Maybe just do this instead of parsing.
      if (pos.yi < 0) return pos._cleanSides = false;
      if (pos.yl > this.height) return pos._cleanSides = false;

      if (this.width - (pos.xl - pos.xi) < 40) {
        return pos._cleanSides = true;
      }

      return pos._cleanSides = false;
    }

    if (!this.options.smartCSR) {
      return false;
    } // The scrollbar can't update properly, and there's also a
    // chance that the scrollbar may get moved around senselessly.
    // NOTE: In pratice, this doesn't seem to be the case.
    // if (this.scrollbar) {
    //   return pos._cleanSides = false;
    // }
    // Doesn't matter if we're only a height of 1.
    // if ((pos.yl - el.ibottom) - (pos.yi + el.itop) <= 1) {
    //   return pos._cleanSides = false;
    // }


    const yi = pos.yi + el.itop,
          yl = pos.yl - el.ibottom;
    let first, ch, x, y;
    if (pos.yi < 0) return pos._cleanSides = false;
    if (pos.yl > this.height) return pos._cleanSides = false;
    if (pos.xi - 1 < 0) return pos._cleanSides = true;
    if (pos.xl > this.width) return pos._cleanSides = true;

    for (x = pos.xi - 1; x >= 0; x--) {
      if (!this.olines[yi]) break;
      first = this.olines[yi][x];

      for (y = yi; y < yl; y++) {
        if (!this.olines[y] || !this.olines[y][x]) break;
        ch = this.olines[y][x];

        if (ch[0] !== first[0] || ch[1] !== first[1]) {
          return pos._cleanSides = false;
        }
      }
    }

    for (x = pos.xl; x < this.width; x++) {
      if (!this.olines[yi]) break;
      first = this.olines[yi][x];

      for (y = yi; y < yl; y++) {
        if (!this.olines[y] || !this.olines[y][x]) break;
        ch = this.olines[y][x];

        if (ch[0] !== first[0] || ch[1] !== first[1]) {
          return pos._cleanSides = false;
        }
      }
    }

    return pos._cleanSides = true;
  }

  _dockBorders() {
    const lines = this.lines;
    let stops = this._borderStops,
        i,
        y,
        x,
        ch; // var keys, stop;
    //
    // keys = Object.keys(this._borderStops)
    //   .map(function(k) { return +k; })
    //   .sort(function(a, b) { return a - b; });
    //
    // for (i = 0; i < keys.length; i++) {
    //   y = keys[i];
    //   if (!lines[y]) continue;
    //   stop = this._borderStops[y];
    //   for (x = stop.xi; x < stop.xl; x++) {

    stops = Object.keys(stops).map(function (k) {
      return +k;
    }).sort(function (a, b) {
      return a - b;
    });

    for (i = 0; i < stops.length; i++) {
      y = stops[i];
      if (!lines[y]) continue;

      for (x = 0; x < this.width; x++) {
        ch = lines[y][x][1];

        if (angles[ch]) {
          lines[y][x][1] = this._getAngle(lines, x, y);
          lines[y].dirty = true;
        }
      }
    }
  }

  _getAngle(lines, x, y) {
    let angle = 0;
    const attr = lines[y][x][0],
          ch = lines[y][x][1];

    if (lines[y][x - 1] && langles[lines[y][x - 1][1]]) {
      if (!this.options.ignoreDockContrast) {
        if (lines[y][x - 1][0] !== attr) return ch;
      }

      angle |= 1 << 3;
    }

    if (lines[y - 1] && uangles[lines[y - 1][x][1]]) {
      if (!this.options.ignoreDockContrast) {
        if (lines[y - 1][x][0] !== attr) return ch;
      }

      angle |= 1 << 2;
    }

    if (lines[y][x + 1] && rangles[lines[y][x + 1][1]]) {
      if (!this.options.ignoreDockContrast) {
        if (lines[y][x + 1][0] !== attr) return ch;
      }

      angle |= 1 << 1;
    }

    if (lines[y + 1] && dangles[lines[y + 1][x][1]]) {
      if (!this.options.ignoreDockContrast) {
        if (lines[y + 1][x][0] !== attr) return ch;
      }

      angle |= 1 << 0;
    } // Experimental: fixes this situation:
    // +----------+
    //            | <-- empty space here, should be a T angle
    // +-------+  |
    // |       |  |
    // +-------+  |
    // |          |
    // +----------+
    // if (uangles[lines[y][x][1]]) {
    //   if (lines[y + 1] && cdangles[lines[y + 1][x][1]]) {
    //     if (!this.options.ignoreDockContrast) {
    //       if (lines[y + 1][x][0] !== attr) return ch;
    //     }
    //     angle |= 1 << 0;
    //   }
    // }


    return angleTable[angle] || ch;
  }

  draw(start, end) {
    // this.emit('predraw');
    let x, y, line, out, ch, data, attr, fg, bg, flags;
    let main = '',
        pre,
        post;
    let clr, neq, xx;
    let lx = -1,
        ly = -1,
        o;
    let acs;

    if (this._buf) {
      main += this._buf;
      this._buf = '';
    }

    for (y = start; y <= end; y++) {
      line = this.lines[y];
      o = this.olines[y];

      if (!line.dirty && !(this.cursor.artificial && y === this.program.y)) {
        continue;
      }

      line.dirty = false;
      out = '';
      attr = this.dattr;

      for (x = 0; x < line.length; x++) {
        data = line[x][0];
        ch = line[x][1]; // Render the artificial cursor.

        if (this.cursor.artificial && !this.cursor._hidden && this.cursor._state && x === this.program.x && y === this.program.y) {
          const cattr = this._cursorAttr(this.cursor, data);

          if (cattr.ch) ch = cattr.ch;
          data = cattr.attr;
        } // Take advantage of xterm's back_color_erase feature by using a
        // lookahead. Stop spitting out so many damn spaces. NOTE: Is checking
        // the bg for non BCE terminals worth the overhead?


        if (this.options.useBCE && ch === ' ' && (this.tput.bools.back_color_erase || (data & 0x1ff) === (this.dattr & 0x1ff)) && (data >> 18 & 8) === (this.dattr >> 18 & 8)) {
          clr = true;
          neq = false;

          for (xx = x; xx < line.length; xx++) {
            if (line[xx][0] !== data || line[xx][1] !== ' ') {
              clr = false;
              break;
            }

            if (line[xx][0] !== o[xx][0] || line[xx][1] !== o[xx][1]) {
              neq = true;
            }
          }

          if (clr && neq) {
            lx = -1, ly = -1;

            if (data !== attr) {
              out += this.codeAttr(data);
              attr = data;
            }

            out += this.tput.cup(y, x);
            out += this.tput.el();

            for (xx = x; xx < line.length; xx++) {
              o[xx][0] = data;
              o[xx][1] = ' ';
            }

            break;
          } // If there's more than 10 spaces, use EL regardless
          // and start over drawing the rest of line. Might
          // not be worth it. Try to use ECH if the terminal
          // supports it. Maybe only try to use ECH here.
          // //if (this.tput.strings.erase_chars)
          // if (!clr && neq && (xx - x) > 10) {
          //   lx = -1, ly = -1;
          //   if (data !== attr) {
          //     out += this.codeAttr(data);
          //     attr = data;
          //   }
          //   out += this.tput.cup(y, x);
          //   if (this.tput.strings.erase_chars) {
          //     // Use erase_chars to avoid erasing the whole line.
          //     out += this.tput.ech(xx - x);
          //   } else {
          //     out += this.tput.el();
          //   }
          //   if (this.tput.strings.parm_right_cursor) {
          //     out += this.tput.cuf(xx - x);
          //   } else {
          //     out += this.tput.cup(y, xx);
          //   }
          //   this.fillRegion(data, ' ',
          //     x, this.tput.strings.erase_chars ? xx : line.length,
          //     y, y + 1);
          //   x = xx - 1;
          //   continue;
          // }
          // Skip to the next line if the
          // rest of the line is already drawn.
          // if (!neq) {
          //   for (; xx < line.length; xx++) {
          //     if (line[xx][0] !== o[xx][0] || line[xx][1] !== o[xx][1]) {
          //       neq = true;
          //       break;
          //     }
          //   }
          //   if (!neq) {
          //     attr = data;
          //     break;
          //   }
          // }

        } // Optimize by comparing the real output
        // buffer to the pending output buffer.


        if (data === o[x][0] && ch === o[x][1]) {
          if (lx === -1) {
            lx = x;
            ly = y;
          }

          continue;
        } else if (lx !== -1) {
          if (this.tput.strings.parm_right_cursor) {
            out += y === ly ? this.tput.cuf(x - lx) : this.tput.cup(y, x);
          } else {
            out += this.tput.cup(y, x);
          }

          lx = -1, ly = -1;
        }

        o[x][0] = data;
        o[x][1] = ch;

        if (data !== attr) {
          if (attr !== this.dattr) {
            out += '\x1b[m';
          }

          if (data !== this.dattr) {
            out += '\x1b[';
            bg = data & 0x1ff;
            fg = data >> 9 & 0x1ff;
            flags = data >> 18; // bold

            if (flags & 1) {
              out += '1;';
            } // underline


            if (flags & 2) {
              out += '4;';
            } // blink


            if (flags & 4) {
              out += '5;';
            } // inverse


            if (flags & 8) {
              out += '7;';
            } // invisible


            if (flags & 16) {
              out += '8;';
            }

            if (bg !== 0x1ff) {
              bg = this._reduceColor(bg);

              if (bg < 16) {
                if (bg < 8) {
                  bg += 40;
                } else if (bg < 16) {
                  bg -= 8;
                  bg += 100;
                }

                out += bg + ';';
              } else {
                out += '48;5;' + bg + ';';
              }
            }

            if (fg !== 0x1ff) {
              fg = this._reduceColor(fg);

              if (fg < 16) {
                if (fg < 8) {
                  fg += 30;
                } else if (fg < 16) {
                  fg -= 8;
                  fg += 90;
                }

                out += fg + ';';
              } else {
                out += '38;5;' + fg + ';';
              }
            }

            if (out[out.length - 1] === ';') out = out.slice(0, -1);
            out += 'm';
          }
        } // If we find a double-width char, eat the next character which should be
        // a space due to parseContent's behavior.


        if (this.fullUnicode) {
          // If this is a surrogate pair double-width char, we can ignore it
          // because parseContent already counted it as length=2.
          if (unicode.charWidth(line[x][1]) === 2) {
            // NOTE: At cols=44, the bug that is avoided
            // by the angles check occurs in widget-unicode:
            // Might also need: `line[x + 1][0] !== line[x][0]`
            // for borderless boxes?
            if (x === line.length - 1 || angles[line[x + 1][1]]) {
              // If we're at the end, we don't have enough space for a
              // double-width. Overwrite it with a space and ignore.
              ch = ' ';
              o[x][1] = '\0';
            } else {
              // ALWAYS refresh double-width chars because this special cursor
              // behavior is needed. There may be a more efficient way of doing
              // this. See above.
              o[x][1] = '\0'; // Eat the next character by moving forward and marking as a
              // space (which it is).

              o[++x][1] = '\0';
            }
          }
        } // Attempt to use ACS for supported characters.
        // This is not ideal, but it's how ncurses works.
        // There are a lot of terminals that support ACS
        // *and UTF8, but do not declare U8. So ACS ends
        // up being used (slower than utf8). Terminals
        // that do not support ACS and do not explicitly
        // support UTF8 get their unicode characters
        // replaced with really ugly ascii characters.
        // It is possible there is a terminal out there
        // somewhere that does not support ACS, but
        // supports UTF8, but I imagine it's unlikely.
        // Maybe remove !this.tput.unicode check, however,
        // this seems to be the way ncurses does it.


        if (this.tput.strings.enter_alt_charset_mode && !this.tput.brokenACS && (this.tput.acscr[ch] || acs)) {
          // Fun fact: even if this.tput.brokenACS wasn't checked here,
          // the linux console would still work fine because the acs
          // table would fail the check of: this.tput.acscr[ch]
          if (this.tput.acscr[ch]) {
            if (acs) {
              ch = this.tput.acscr[ch];
            } else {
              ch = this.tput.smacs() + this.tput.acscr[ch];
              acs = true;
            }
          } else if (acs) {
            ch = this.tput.rmacs() + ch;
            acs = false;
          }
        } else {
          // U8 is not consistently correct. Some terminfo's
          // terminals that do not declare it may actually
          // support utf8 (e.g. urxvt), but if the terminal
          // does not declare support for ACS (and U8), chances
          // are it does not support UTF8. This is probably
          // the "safest" way to do this. Should fix things
          // like sun-color.
          // NOTE: It could be the case that the $LANG
          // is all that matters in some cases:
          // if (!this.tput.unicode && ch > '~') {
          if (!this.tput.unicode && this.tput.numbers.U8 !== 1 && ch > '~') {
            ch = this.tput.utoa[ch] || '?';
          }
        }

        out += ch;
        attr = data;
      }

      if (attr !== this.dattr) {
        out += '\x1b[m';
      }

      if (out) {
        main += this.tput.cup(y, 0) + out;
      }
    }

    if (acs) {
      main += this.tput.rmacs();
      acs = false;
    }

    if (main) {
      pre = '';
      post = '';
      pre += this.tput.sc();
      post += this.tput.rc();

      if (!this.program.cursorHidden) {
        pre += this.tput.civis();
        post += this.tput.cnorm();
      } // this.program.flush();
      // this.program._owrite(pre + main + post);


      this.program._write(pre + main + post);
    } // this.emit('draw');

  }

  _reduceColor(color) {
    return colors.reduce(color, this.tput.colors);
  } // Convert an SGR string to our own attribute format.


  attrCode(code, cur, def) {
    let flags = cur >> 18 & 0x1ff,
        fg = cur >> 9 & 0x1ff,
        bg = cur & 0x1ff,
        c,
        i;
    code = code.slice(2, -1).split(';');
    if (!code[0]) code[0] = '0';

    for (i = 0; i < code.length; i++) {
      c = +code[i] || 0;

      switch (c) {
        case 0:
          // normal
          bg = def & 0x1ff;
          fg = def >> 9 & 0x1ff;
          flags = def >> 18 & 0x1ff;
          break;

        case 1:
          // bold
          flags |= 1;
          break;

        case 22:
          flags = def >> 18 & 0x1ff;
          break;

        case 4:
          // underline
          flags |= 2;
          break;

        case 24:
          flags = def >> 18 & 0x1ff;
          break;

        case 5:
          // blink
          flags |= 4;
          break;

        case 25:
          flags = def >> 18 & 0x1ff;
          break;

        case 7:
          // inverse
          flags |= 8;
          break;

        case 27:
          flags = def >> 18 & 0x1ff;
          break;

        case 8:
          // invisible
          flags |= 16;
          break;

        case 28:
          flags = def >> 18 & 0x1ff;
          break;

        case 39:
          // default fg
          fg = def >> 9 & 0x1ff;
          break;

        case 49:
          // default bg
          bg = def & 0x1ff;
          break;

        case 100:
          // default fg/bg
          fg = def >> 9 & 0x1ff;
          bg = def & 0x1ff;
          break;

        default:
          // color
          if (c === 48 && +code[i + 1] === 5) {
            i += 2;
            bg = +code[i];
            break;
          } else if (c === 48 && +code[i + 1] === 2) {
            i += 2;
            bg = colors.match(+code[i], +code[i + 1], +code[i + 2]);
            if (bg === -1) bg = def & 0x1ff;
            i += 2;
            break;
          } else if (c === 38 && +code[i + 1] === 5) {
            i += 2;
            fg = +code[i];
            break;
          } else if (c === 38 && +code[i + 1] === 2) {
            i += 2;
            fg = colors.match(+code[i], +code[i + 1], +code[i + 2]);
            if (fg === -1) fg = def >> 9 & 0x1ff;
            i += 2;
            break;
          }

          if (c >= 40 && c <= 47) {
            bg = c - 40;
          } else if (c >= 100 && c <= 107) {
            bg = c - 100;
            bg += 8;
          } else if (c === 49) {
            bg = def & 0x1ff;
          } else if (c >= 30 && c <= 37) {
            fg = c - 30;
          } else if (c >= 90 && c <= 97) {
            fg = c - 90;
            fg += 8;
          } else if (c === 39) {
            fg = def >> 9 & 0x1ff;
          } else if (c === 100) {
            fg = def >> 9 & 0x1ff;
            bg = def & 0x1ff;
          }

          break;
      }
    }

    return flags << 18 | fg << 9 | bg;
  } // Convert our own attribute format to an SGR string.


  codeAttr(code) {
    const flags = code >> 18 & 0x1ff;
    let fg = code >> 9 & 0x1ff,
        bg = code & 0x1ff,
        out = ''; // bold

    if (flags & 1) {
      out += '1;';
    } // underline


    if (flags & 2) {
      out += '4;';
    } // blink


    if (flags & 4) {
      out += '5;';
    } // inverse


    if (flags & 8) {
      out += '7;';
    } // invisible


    if (flags & 16) {
      out += '8;';
    }

    if (bg !== 0x1ff) {
      bg = this._reduceColor(bg);

      if (bg < 16) {
        if (bg < 8) {
          bg += 40;
        } else if (bg < 16) {
          bg -= 8;
          bg += 100;
        }

        out += bg + ';';
      } else {
        out += '48;5;' + bg + ';';
      }
    }

    if (fg !== 0x1ff) {
      fg = this._reduceColor(fg);

      if (fg < 16) {
        if (fg < 8) {
          fg += 30;
        } else if (fg < 16) {
          fg -= 8;
          fg += 90;
        }

        out += fg + ';';
      } else {
        out += '38;5;' + fg + ';';
      }
    }

    if (out[out.length - 1] === ';') out = out.slice(0, -1);
    return '\x1b[' + out + 'm';
  }

  focusOffset(offset) {
    const shown = this.keyable.filter(function (el) {
      return !el.detached && el.visible;
    }).length;

    if (!shown || !offset) {
      return;
    }

    let i = this.keyable.indexOf(this.focused);
    if (!~i) return;

    if (offset > 0) {
      while (offset--) {
        if (++i > this.keyable.length - 1) i = 0;
        if (this.keyable[i].detached || !this.keyable[i].visible) offset++;
      }
    } else {
      offset = -offset;

      while (offset--) {
        if (--i < 0) i = this.keyable.length - 1;
        if (this.keyable[i].detached || !this.keyable[i].visible) offset++;
      }
    }

    return this.keyable[i].focus();
  }

  focusPrevious() {
    return this.focusOffset(-1);
  }

  focusNext() {
    return this.focusOffset(1);
  }

  focusPush(el) {
    if (!el) return;
    const old = this.history[this.history.length - 1];

    if (this.history.length === 10) {
      this.history.shift();
    }

    this.history.push(el);

    this._focus(el, old);
  }

  focusPop() {
    const old = this.history.pop();

    if (this.history.length) {
      this._focus(this.history[this.history.length - 1], old);
    }

    return old;
  }

  saveFocus() {
    return this._savedFocus = this.focused;
  }

  restoreFocus() {
    if (!this._savedFocus) return;

    this._savedFocus.focus();

    delete this._savedFocus;
    return this.focused;
  }

  rewindFocus() {
    const old = this.history.pop();
    let el;

    while (this.history.length) {
      el = this.history.pop();

      if (!el.detached && el.visible) {
        this.history.push(el);

        this._focus(el, old);

        return el;
      }
    }

    if (old) {
      old.emit('blur');
    }
  }

  _focus(self, old) {
    // Find a scrollable ancestor if we have one.
    let el = self;

    while (el = el.parent) {
      if (el.scrollable) break;
    } // If we're in a scrollable element,
    // automatically scroll to the focused element.


    if (el && !el.detached) {
      // NOTE: This is different from the other "visible" values - it needs the
      // visible height of the scrolling element itself, not the element within
      // it.
      const visible = self.screen.height - el.atop - el.itop - el.abottom - el.ibottom;

      if (self.rtop < el.childBase) {
        el.scrollTo(self.rtop);
        self.screen.render();
      } else if (self.rtop + self.height - self.ibottom > el.childBase + visible) {
        // Explanation for el.itop here: takes into account scrollable elements
        // with borders otherwise the element gets covered by the bottom border:
        el.scrollTo(self.rtop - (el.height - self.height) + el.itop, true);
        self.screen.render();
      }
    }

    if (old) {
      old.emit('blur', self);
    }

    self.emit('focus', old);
  }

  clearRegion(xi, xl, yi, yl, override) {
    return this.fillRegion(this.dattr, ' ', xi, xl, yi, yl, override);
  }

  fillRegion(attr, ch, xi, xl, yi, yl, override) {
    const lines = this.lines;
    let cell, xx;
    if (xi < 0) xi = 0;
    if (yi < 0) yi = 0;

    for (; yi < yl; yi++) {
      if (!lines[yi]) break;

      for (xx = xi; xx < xl; xx++) {
        cell = lines[yi][xx];
        if (!cell) break;

        if (override || attr !== cell[0] || ch !== cell[1]) {
          lines[yi][xx][0] = attr;
          lines[yi][xx][1] = ch;
          lines[yi].dirty = true;
        }
      }
    }
  }

  key() {
    return this.program.key.apply(this, arguments);
  }

  onceKey() {
    return this.program.onceKey.apply(this, arguments);
  }

  removeKey() {
    return this.program.unkey.apply(this, arguments);
  }

  exec(file, args, options, callback) {
    const ps = this.spawn(file, args, options);
    ps.on('error', function (err) {
      if (!callback) return;
      return callback(err, false);
    });
    ps.on('exit', function (code) {
      if (!callback) return;
      return callback(null, code === 0);
    });
    return ps;
  }

  readEditor(options, callback) {
    if (typeof options === 'string') {
      options = {
        editor: options
      };
    }

    if (!callback) {
      callback = options;
      options = null;
    }

    if (!callback) {
      callback = function () {};
    }

    options = options || {};
    const self = this,
          editor = options.editor || process.env.EDITOR || 'vi',
          name = options.name || process.title || 'blessed',
          rnd = Math.random().toString(36).split('.').pop(),
          file = '/tmp/' + name + '.' + rnd,
          args = [file];
    let opt;
    opt = {
      stdio: 'inherit',
      env: process.env,
      cwd: process.env.HOME
    };

    function writeFile(callback) {
      if (!options.value) return callback();
      return fs.writeFile(file, options.value, callback);
    }

    return writeFile(function (err) {
      if (err) return callback(err);
      return self.exec(editor, args, opt, function (err, success) {
        if (err) return callback(err);
        return fs.readFile(file, 'utf8', function (err, data) {
          return fs.unlink(file, function () {
            if (!success) return callback(new Error('Unsuccessful.'));
            if (err) return callback(err);
            return callback(null, data);
          });
        });
      });
    });
  }

  displayImage(file, callback) {
    if (!file) {
      if (!callback) return;
      return callback(new Error('No image.'));
    }

    file = path.resolve(process.cwd(), file);

    if (!~file.indexOf('://')) {
      file = 'file://' + file;
    }

    const args = ['w3m', '-T', 'text/html'];
    const input = '<title>press q to exit</title>' + '<img align="center" src="' + file + '">';
    const opt = {
      stdio: ['pipe', 1, 2],
      env: process.env,
      cwd: process.env.HOME
    };
    const ps = this.spawn(args[0], args.slice(1), opt);
    ps.on('error', function (err) {
      if (!callback) return;
      return callback(err);
    });
    ps.on('exit', function (code) {
      if (!callback) return;
      if (code !== 0) return callback(new Error('Exit Code: ' + code));
      return callback(null, code === 0);
    });
    ps.stdin.write(input + '\n');
    ps.stdin.end();
  }

  setEffects(el, fel, over, out, effects, temp) {
    if (!effects) return;
    const tmp = {};
    if (temp) el[temp] = tmp;

    if (typeof el !== 'function') {
      const _el = el;

      el = function () {
        return _el;
      };
    }

    fel.on(over, function () {
      const element = el();
      Object.keys(effects).forEach(function (key) {
        const val = effects[key];

        if (val !== null && typeof val === 'object') {
          tmp[key] = tmp[key] || {}; // element.style[key] = element.style[key] || {};

          Object.keys(val).forEach(function (k) {
            const v = val[k];
            tmp[key][k] = element.style[key][k];
            element.style[key][k] = v;
          });
          return;
        }

        tmp[key] = element.style[key];
        element.style[key] = val;
      });
      element.screen.render();
    });
    fel.on(out, function () {
      const element = el();
      Object.keys(effects).forEach(function (key) {
        const val = effects[key];

        if (val !== null && typeof val === 'object') {
          tmp[key] = tmp[key] || {}; // element.style[key] = element.style[key] || {};

          Object.keys(val).forEach(function (k) {
            if (tmp[key].hasOwnProperty(k)) {
              element.style[key][k] = tmp[key][k];
            }
          });
          return;
        }

        if (tmp.hasOwnProperty(key)) {
          element.style[key] = tmp[key];
        }
      });
      element.screen.render();
    });
  }

  sigtstp(callback) {
    const self = this;
    this.program.sigtstp(function () {
      self.alloc();
      self.render();
      self.program.lrestoreCursor('pause', true);
      if (callback) callback();
    });
  }

  copyToClipboard(text) {
    return this.program.copyToClipboard(text);
  }

  cursorShape(shape, blink) {
    const self = this;
    this.cursor.shape = shape || 'block';
    this.cursor.blink = blink || false;
    this.cursor._set = true;

    if (this.cursor.artificial) {
      if (!this.program.hideCursor_old) {
        const hideCursor = this.program.hideCursor;
        this.program.hideCursor_old = this.program.hideCursor;

        this.program.hideCursor = function () {
          hideCursor.call(self.program);
          self.cursor._hidden = true;
          if (self.renders) self.render();
        };
      }

      if (!this.program.showCursor_old) {
        const showCursor = this.program.showCursor;
        this.program.showCursor_old = this.program.showCursor;

        this.program.showCursor = function () {
          self.cursor._hidden = false;
          if (self.program._exiting) showCursor.call(self.program);
          if (self.renders) self.render();
        };
      }

      if (!this._cursorBlink) {
        this._cursorBlink = setInterval(function () {
          if (!self.cursor.blink) return;
          self.cursor._state ^= 1;
          if (self.renders) self.render();
        }, 500);

        if (this._cursorBlink.unref) {
          this._cursorBlink.unref();
        }
      }

      return true;
    }

    return this.program.cursorShape(this.cursor.shape, this.cursor.blink);
  }

  cursorColor(color) {
    this.cursor.color = color != null ? colors.convert(color) : null;
    this.cursor._set = true;

    if (this.cursor.artificial) {
      return true;
    }

    return this.program.cursorColor(colors.ncolors[this.cursor.color]);
  }

  resetCursor() {
    this.cursor.shape = 'block';
    this.cursor.blink = false;
    this.cursor.color = null;
    this.cursor._set = false;

    if (this.cursor.artificial) {
      this.cursor.artificial = false;

      if (this.program.hideCursor_old) {
        this.program.hideCursor = this.program.hideCursor_old;
        delete this.program.hideCursor_old;
      }

      if (this.program.showCursor_old) {
        this.program.showCursor = this.program.showCursor_old;
        delete this.program.showCursor_old;
      }

      if (this._cursorBlink) {
        clearInterval(this._cursorBlink);
        delete this._cursorBlink;
      }

      return true;
    }

    return this.program.cursorReset();
  }

  _cursorAttr(cursor, dattr) {
    let attr = dattr || this.dattr,
        cattr,
        ch;

    if (cursor.shape === 'line') {
      attr &= ~(0x1ff << 9);
      attr |= 7 << 9;
      ch = '\u2502';
    } else if (cursor.shape === 'underline') {
      attr &= ~(0x1ff << 9);
      attr |= 7 << 9;
      attr |= 2 << 18;
    } else if (cursor.shape === 'block') {
      attr &= ~(0x1ff << 9);
      attr |= 7 << 9;
      attr |= 8 << 18;
    } else if (typeof cursor.shape === 'object' && cursor.shape) {
      cattr = Element.prototype.sattr.call(cursor, cursor.shape);

      if (cursor.shape.bold || cursor.shape.underline || cursor.shape.blink || cursor.shape.inverse || cursor.shape.invisible) {
        attr &= ~(0x1ff << 18);
        attr |= (cattr >> 18 & 0x1ff) << 18;
      }

      if (cursor.shape.fg) {
        attr &= ~(0x1ff << 9);
        attr |= (cattr >> 9 & 0x1ff) << 9;
      }

      if (cursor.shape.bg) {
        attr &= ~(0x1ff << 0);
        attr |= cattr & 0x1ff;
      }

      if (cursor.shape.ch) {
        ch = cursor.shape.ch;
      }
    }

    if (cursor.color != null) {
      attr &= ~(0x1ff << 9);
      attr |= cursor.color << 9;
    }

    return {
      ch: ch,
      attr: attr
    };
  }

  screenshot(xi, xl, yi, yl, term) {
    if (xi == null) xi = 0;
    if (xl == null) xl = this.cols;
    if (yi == null) yi = 0;
    if (yl == null) yl = this.rows;
    if (xi < 0) xi = 0;
    if (yi < 0) yi = 0;
    let x, y, line, out, ch, data, attr;
    const sdattr = this.dattr;

    if (term) {
      this.dattr = term.defAttr;
    }

    let main = '';

    for (y = yi; y < yl; y++) {
      line = term ? term.lines[y] : this.lines[y];
      if (!line) break;
      out = '';
      attr = this.dattr;

      for (x = xi; x < xl; x++) {
        if (!line[x]) break;
        data = line[x][0];
        ch = line[x][1];

        if (data !== attr) {
          if (attr !== this.dattr) {
            out += '\x1b[m';
          }

          if (data !== this.dattr) {
            let _data = data;

            if (term) {
              if ((_data >> 9 & 0x1ff) === 257) _data |= 0x1ff << 9;
              if ((_data & 0x1ff) === 256) _data |= 0x1ff;
            }

            out += this.codeAttr(_data);
          }
        }

        if (this.fullUnicode) {
          if (unicode.charWidth(line[x][1]) === 2) {
            if (x === xl - 1) {
              ch = ' ';
            } else {
              x++;
            }
          }
        }

        out += ch;
        attr = data;
      }

      if (attr !== this.dattr) {
        out += '\x1b[m';
      }

      if (out) {
        main += (y > 0 ? '\n' : '') + out;
      }
    }

    main = main.replace(/(?:\s*\x1b\[40m\s*\x1b\[m\s*)*$/, '') + '\n';

    if (term) {
      this.dattr = sdattr;
    }

    return main;
  }
  /**
   * Positioning
   */


  _getPos() {
    return this;
  }

}
/**
 * Angle Table
 */

Screen$1.global = null;
Screen$1.total = 0;
Screen$1.instances = [];
const angles = {
  '\u2518': true,
  // '┘'
  '\u2510': true,
  // '┐'
  '\u250c': true,
  // '┌'
  '\u2514': true,
  // '└'
  '\u253c': true,
  // '┼'
  '\u251c': true,
  // '├'
  '\u2524': true,
  // '┤'
  '\u2534': true,
  // '┴'
  '\u252c': true,
  // '┬'
  '\u2502': true,
  // '│'
  '\u2500': true // '─'

};
const langles = {
  '\u250c': true,
  // '┌'
  '\u2514': true,
  // '└'
  '\u253c': true,
  // '┼'
  '\u251c': true,
  // '├'
  '\u2534': true,
  // '┴'
  '\u252c': true,
  // '┬'
  '\u2500': true // '─'

};
const uangles = {
  '\u2510': true,
  // '┐'
  '\u250c': true,
  // '┌'
  '\u253c': true,
  // '┼'
  '\u251c': true,
  // '├'
  '\u2524': true,
  // '┤'
  '\u252c': true,
  // '┬'
  '\u2502': true // '│'

};
const rangles = {
  '\u2518': true,
  // '┘'
  '\u2510': true,
  // '┐'
  '\u253c': true,
  // '┼'
  '\u2524': true,
  // '┤'
  '\u2534': true,
  // '┴'
  '\u252c': true,
  // '┬'
  '\u2500': true // '─'

};
const dangles = {
  '\u2518': true,
  // '┘'
  '\u2514': true,
  // '└'
  '\u253c': true,
  // '┼'
  '\u251c': true,
  // '├'
  '\u2524': true,
  // '┤'
  '\u2534': true,
  // '┴'
  '\u2502': true // '│'

}; // var cdangles = {
//   '\u250c': true  // '┌'
// };
// Every ACS angle character can be
// represented by 4 bits ordered like this:
// [langle][uangle][rangle][dangle]

const angleTable = {
  '0000': '',
  // ?
  '0001': '\u2502',
  // '│' // ?
  '0010': '\u2500',
  // '─' // ??
  '0011': '\u250c',
  // '┌'
  '0100': '\u2502',
  // '│' // ?
  '0101': '\u2502',
  // '│'
  '0110': '\u2514',
  // '└'
  '0111': '\u251c',
  // '├'
  '1000': '\u2500',
  // '─' // ??
  '1001': '\u2510',
  // '┐'
  '1010': '\u2500',
  // '─' // ??
  '1011': '\u252c',
  // '┬'
  '1100': '\u2518',
  // '┘'
  '1101': '\u2524',
  // '┤'
  '1110': '\u2534',
  // '┴'
  '1111': '\u253c' // '┼'

};
Object.keys(angleTable).forEach(function (key) {
  angleTable[parseInt(key, 2)] = angleTable[key];
  delete angleTable[key];
});

/**
 * node.js - base abstract node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Node extends events.EventEmitter {
  /**
   * Node
   */
  constructor(options = {}) {
    var _options$children;

    super(options);
    this.type = 'node';
    const self = this;
    if (!(this instanceof Node)) return new Node(options);
    this.options = options;
    this.screen = this.screen || options.screen;

    if (!this.screen) {
      if (this.type === 'screen') {
        this.screen = this;
      } else if (Screen$1.total === 1) {
        this.screen = Screen$1.global;
      } else if (options.parent) {
        this.screen = options.parent;

        while (this.screen && this.screen.type !== 'screen') {
          this.screen = this.screen.parent;
        }
      } else if (Screen$1.total) {
        // This _should_ work in most cases as long as the element is appended
        // synchronously after the screen's creation. Throw error if not.
        this.screen = Screen$1.instances[Screen$1.instances.length - 1];
        process.nextTick(function () {
          if (!self.parent) {
            throw new Error('Element (' + self.type + ')' + ' was not appended synchronously after the' + ' screen\'s creation. Please set a `parent`' + ' or `screen` option in the element\'s constructor' + ' if you are going to use multiple screens and' + ' append the element later.');
          }
        });
      } else {
        throw new Error('No active screen.');
      }
    }

    this.parent = options.parent || null;
    this.children = [];
    this.$ = this._ = this.data = {};
    this.uid = Node.uid++;
    this.index = this.index != null ? this.index : -1;

    if (this.type !== 'screen') {
      this.detached = true;
    }

    if (this.parent) {
      this.parent.append(this);
    }

    ((_options$children = options.children) !== null && _options$children !== void 0 ? _options$children : []).forEach(this.append.bind(this));
  }

  insert(element, i) {
    const self = this;

    if (element.screen && element.screen !== this.screen) {
      throw new Error('Cannot switch a node\'s screen.');
    }

    element.detach();
    element.parent = this;
    element.screen = this.screen;

    if (i === 0) {
      this.children.unshift(element);
    } else if (i === this.children.length) {
      this.children.push(element);
    } else {
      this.children.splice(i, 0, element);
    }

    element.emit('reparent', this);
    this.emit('adopt', element);

    (function emit(el) {
      const n = el.detached !== self.detached;
      el.detached = self.detached;
      if (n) el.emit('attach');
      el.children.forEach(emit);
    })(element);

    if (!this.screen.focused) {
      this.screen.focused = element;
    }
  }

  prepend(element) {
    this.insert(element, 0);
  }

  append(element) {
    this.insert(element, this.children.length);
  }

  insertBefore(element, other) {
    const i = this.children.indexOf(other);
    if (~i) this.insert(element, i);
  }

  insertAfter(element, other) {
    const i = this.children.indexOf(other);
    if (~i) this.insert(element, i + 1);
  }

  remove(element) {
    if (element.parent !== this) return;
    let i = this.children.indexOf(element);
    if (!~i) return;
    element.clearPos();
    element.parent = null;
    this.children.splice(i, 1);
    i = this.screen.clickable.indexOf(element);
    if (~i) this.screen.clickable.splice(i, 1);
    i = this.screen.keyable.indexOf(element);
    if (~i) this.screen.keyable.splice(i, 1);
    element.emit('reparent', null);
    this.emit('remove', element);

    (function emit(el) {
      const n = el.detached !== true;
      el.detached = true;
      if (n) el.emit('detach');
      el.children.forEach(emit);
    })(element);

    if (this.screen.focused === element) {
      this.screen.rewindFocus();
    }
  }

  detach() {
    if (this.parent) this.parent.remove(this);
  }

  free() {}

  destroy() {
    this.detach();
    this.forDescendants(function (el) {
      el.free();
      el.destroyed = true;
      el.emit('destroy');
    }, this);
  }

  forDescendants(iter, s) {
    if (s) iter(this);
    this.children.forEach(function emit(el) {
      iter(el);
      el.children.forEach(emit);
    });
  }

  forAncestors(iter, s) {
    let el = this;
    if (s) iter(this);

    while (el = el.parent) {
      iter(el);
    }
  }

  collectDescendants(s) {
    const out = [];
    this.forDescendants(function (el) {
      out.push(el);
    }, s);
    return out;
  }

  collectAncestors(s) {
    const out = [];
    this.forAncestors(function (el) {
      out.push(el);
    }, s);
    return out;
  }

  emitDescendants() {
    const args = Array.prototype.slice(arguments);
    let iter;

    if (typeof args[args.length - 1] === 'function') {
      iter = args.pop();
    }

    return this.forDescendants(function (el) {
      if (iter) iter(el);
      el.emit.apply(el, args);
    }, true);
  }

  emitAncestors() {
    const args = Array.prototype.slice(arguments);
    let iter;

    if (typeof args[args.length - 1] === 'function') {
      iter = args.pop();
    }

    return this.forAncestors(function (el) {
      if (iter) iter(el);
      el.emit.apply(el, args);
    }, true);
  }

  hasDescendant(target) {
    return function find(el) {
      for (let i = 0; i < el.children.length; i++) {
        if (el.children[i] === target) {
          return true;
        }

        if (find(el.children[i]) === true) {
          return true;
        }
      }

      return false;
    }(this);
  }

  hasAncestor(target) {
    let el = this;

    while (el = el.parent) {
      if (el === target) return true;
    }

    return false;
  }

  get(name, value) {
    if (this.data.hasOwnProperty(name)) {
      return this.data[name];
    }

    return value;
  }

  set(name, value) {
    return this.data[name] = value;
  }

} // Node.prototype.__proto__ = EventEmitter.prototype

Node.uid = 0;

/**
 * scrollablebox.js - scrollable box element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class ScrollableBox extends Box {
  /**
   * ScrollableBox
   */
  constructor(options = {}) {
    super(options);
    this.type = 'scrollable-box';
    const self = this;
    if (!(this instanceof Node)) return new ScrollableBox(options);
    if (options.scrollable === false) return this;
    this.scrollable = true;
    this.childOffset = 0;
    this.childBase = 0;
    this.baseLimit = options.baseLimit || Infinity;
    this.alwaysScroll = options.alwaysScroll;
    this.scrollbar = options.scrollbar;

    if (this.scrollbar) {
      this.scrollbar.ch = this.scrollbar.ch || ' ';
      this.style.scrollbar = this.style.scrollbar || this.scrollbar.style;

      if (!this.style.scrollbar) {
        this.style.scrollbar = {};
        this.style.scrollbar.fg = this.scrollbar.fg;
        this.style.scrollbar.bg = this.scrollbar.bg;
        this.style.scrollbar.bold = this.scrollbar.bold;
        this.style.scrollbar.underline = this.scrollbar.underline;
        this.style.scrollbar.inverse = this.scrollbar.inverse;
        this.style.scrollbar.invisible = this.scrollbar.invisible;
      } //this.scrollbar.style = this.style.scrollbar;


      if (this.track || this.scrollbar.track) {
        this.track = this.scrollbar.track || this.track;
        this.style.track = this.style.scrollbar.track || this.style.track;
        this.track.ch = this.track.ch || ' ';
        this.style.track = this.style.track || this.track.style;

        if (!this.style.track) {
          this.style.track = {};
          this.style.track.fg = this.track.fg;
          this.style.track.bg = this.track.bg;
          this.style.track.bold = this.track.bold;
          this.style.track.underline = this.track.underline;
          this.style.track.inverse = this.track.inverse;
          this.style.track.invisible = this.track.invisible;
        }

        this.track.style = this.style.track;
      } // Allow controlling of the scrollbar via the mouse:


      if (options.mouse) {
        this.on('mousedown', function (data) {
          if (self._scrollingBar) {
            // Do not allow dragging on the scrollbar:
            delete self.screen._dragging;
            delete self._drag;
            return;
          }

          const x = data.x - self.aleft;
          const y = data.y - self.atop;

          if (x === self.width - self.iright - 1) {
            // Do not allow dragging on the scrollbar:
            delete self.screen._dragging;
            delete self._drag;
            const perc = (y - self.itop) / (self.height - self.iheight);
            self.setScrollPerc(perc * 100 | 0);
            self.screen.render();
            let smd, smu;
            self._scrollingBar = true;
            self.onScreenEvent('mousedown', smd = function (data) {
              const y = data.y - self.atop;
              const perc = y / self.height;
              self.setScrollPerc(perc * 100 | 0);
              self.screen.render();
            }); // If mouseup occurs out of the window, no mouseup event fires, and
            // scrollbar will drag again on mousedown until another mouseup
            // occurs.

            self.onScreenEvent('mouseup', smu = function () {
              self._scrollingBar = false;
              self.removeScreenEvent('mousedown', smd);
              self.removeScreenEvent('mouseup', smu);
            });
          }
        });
      }
    }

    if (options.mouse) {
      this.on('wheeldown', function () {
        self.scroll(self.height / 2 | 0 || 1);
        self.screen.render();
      });
      this.on('wheelup', function () {
        self.scroll(-(self.height / 2 | 0) || -1);
        self.screen.render();
      });
    }

    if (options.keys && !options.ignoreKeys) {
      this.on('keypress', function (ch, key) {
        if (key.name === 'up' || options.vi && key.name === 'k') {
          self.scroll(-1);
          self.screen.render();
          return;
        }

        if (key.name === 'down' || options.vi && key.name === 'j') {
          self.scroll(1);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'u' && key.ctrl) {
          self.scroll(-(self.height / 2 | 0) || -1);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'd' && key.ctrl) {
          self.scroll(self.height / 2 | 0 || 1);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'b' && key.ctrl) {
          self.scroll(-self.height || -1);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'f' && key.ctrl) {
          self.scroll(self.height || 1);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'g' && !key.shift) {
          self.scrollTo(0);
          self.screen.render();
          return;
        }

        if (options.vi && key.name === 'g' && key.shift) {
          self.scrollTo(self.getScrollHeight());
          self.screen.render();
        }
      });
    }

    this.on('parsed content', function () {
      self._recalculateIndex();
    });

    self._recalculateIndex();
  }

  _scrollBottom() {
    if (!this.scrollable) return 0; // We could just calculate the children, but we can
    // optimize for lists by just returning the items.length.

    if (this._isList) {
      return this.items ? this.items.length : 0;
    }

    if (this.lpos && this.lpos._scrollBottom) {
      return this.lpos._scrollBottom;
    }

    const bottom = this.children.reduce(function (current, el) {
      // el.height alone does not calculate the shrunken height, we need to use
      // getCoords. A shrunken box inside a scrollable element will not grow any
      // larger than the scrollable element's context regardless of how much
      // content is in the shrunken box, unless we do this (call getCoords
      // without the scrollable calculation):
      // See: $ node test/widget-shrink-fail-2.js
      if (!el.detached) {
        const lpos = el._getCoords(false, true);

        if (lpos) {
          return Math.max(current, el.rtop + (lpos.yl - lpos.yi));
        }
      }

      return Math.max(current, el.rtop + el.height);
    }, 0); // XXX Use this? Makes .getScrollHeight() useless!
    // if (bottom < this._clines.length) bottom = this._clines.length;

    if (this.lpos) this.lpos._scrollBottom = bottom;
    return bottom;
  }

  setScroll(offset, always) {
    // XXX
    // At first, this appeared to account for the first new calculation of childBase:
    this.scroll(0);
    return this.scroll(offset - (this.childBase + this.childOffset), always);
  }

  scrollTo(offset, always) {
    // XXX
    // At first, this appeared to account for the first new calculation of childBase:
    this.scroll(0);
    return this.scroll(offset - (this.childBase + this.childOffset), always);
  }

  getScroll() {
    return this.childBase + this.childOffset;
  }

  scroll(offset, always) {
    if (!this.scrollable) return;
    if (this.detached) return; // Handle scrolling.

    const visible = this.height - this.iheight,
          base = this.childBase;
    let d, p, t, b, max, emax;

    if (this.alwaysScroll || always) {
      // Semi-workaround
      this.childOffset = offset > 0 ? visible - 1 + offset : offset;
    } else {
      this.childOffset += offset;
    }

    if (this.childOffset > visible - 1) {
      d = this.childOffset - (visible - 1);
      this.childOffset -= d;
      this.childBase += d;
    } else if (this.childOffset < 0) {
      d = this.childOffset;
      this.childOffset += -d;
      this.childBase += d;
    }

    if (this.childBase < 0) {
      this.childBase = 0;
    } else if (this.childBase > this.baseLimit) {
      this.childBase = this.baseLimit;
    } // Find max "bottom" value for
    // content and descendant elements.
    // Scroll the content if necessary.


    if (this.childBase === base) {
      return this.emit('scroll');
    } // When scrolling text, we want to be able to handle SGR codes as well as line
    // feeds. This allows us to take preformatted text output from other programs
    // and put it in a scrollable text box.


    this.parseContent(); // XXX
    // max = this.getScrollHeight() - (this.height - this.iheight);

    max = this._clines.length - (this.height - this.iheight);
    if (max < 0) max = 0;
    emax = this._scrollBottom() - (this.height - this.iheight);
    if (emax < 0) emax = 0;
    this.childBase = Math.min(this.childBase, Math.max(emax, max));

    if (this.childBase < 0) {
      this.childBase = 0;
    } else if (this.childBase > this.baseLimit) {
      this.childBase = this.baseLimit;
    } // Optimize scrolling with CSR + IL/DL.


    p = this.lpos; // Only really need _getCoords() if we want
    // to allow nestable scrolling elements...
    // or if we **really** want shrinkable
    // scrolling elements.
    // p = this._getCoords();

    if (p && this.childBase !== base && this.screen.cleanSides(this)) {
      t = p.yi + this.itop;
      b = p.yl - this.ibottom - 1;
      d = this.childBase - base;

      if (d > 0 && d < visible) {
        // scrolled down
        this.screen.deleteLine(d, t, t, b);
      } else if (d < 0 && -d < visible) {
        // scrolled up
        d = -d;
        this.screen.insertLine(d, t, t, b);
      }
    }

    return this.emit('scroll');
  }

  _recalculateIndex() {
    let max, emax;

    if (this.detached || !this.scrollable) {
      return 0;
    } // XXX
    // max = this.getScrollHeight() - (this.height - this.iheight);


    max = this._clines.length - (this.height - this.iheight);
    if (max < 0) max = 0;
    emax = this._scrollBottom() - (this.height - this.iheight);
    if (emax < 0) emax = 0;
    this.childBase = Math.min(this.childBase, Math.max(emax, max));

    if (this.childBase < 0) {
      this.childBase = 0;
    } else if (this.childBase > this.baseLimit) {
      this.childBase = this.baseLimit;
    }
  }

  resetScroll() {
    if (!this.scrollable) return;
    this.childOffset = 0;
    this.childBase = 0;
    return this.emit('scroll');
  }

  getScrollHeight() {
    return Math.max(this._clines.length, this._scrollBottom());
  }

  getScrollPerc(s) {
    const pos = this.lpos || this._getCoords();

    if (!pos) return s ? -1 : 0;
    const height = pos.yl - pos.yi - this.iheight,
          i = this.getScrollHeight();
    let p;

    if (height < i) {
      if (this.alwaysScroll) {
        p = this.childBase / (i - height);
      } else {
        p = (this.childBase + this.childOffset) / (i - 1);
      }

      return p * 100;
    }

    return s ? -1 : 0;
  }

  setScrollPerc(i) {
    // XXX
    // var m = this.getScrollHeight();
    const m = Math.max(this._clines.length, this._scrollBottom());
    return this.scrollTo(i / 100 * m | 0);
  } // XXX Potentially use this in place of scrollable checks elsewhere.


  get reallyScrollable() {
    if (this.shrink) return this.scrollable;
    return this.getScrollHeight() > this.height;
  }

}

/**
 * element.js - base element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
const nextTick$2 = global.setImmediate || process.nextTick.bind(process);
class Element$1 extends Node {
  /**
   * Element
   */
  constructor(options = {}) {
    super(options);
    this.type = 'element';
    const self = this;

    if (!(this instanceof Node)) {
      return new Element$1(options);
    } // Workaround to get a `scrollable` option.


    if (options.scrollable && !this._ignore && this.type !== 'scrollable-box') {
      Object.getOwnPropertyNames(ScrollableBox.prototype).forEach(function (key) {
        if (key === 'type') return;
        const desc = Object.getOwnPropertyDescriptor(ScrollableBox.prototype, key);
        Object.defineProperty(this, key, desc);
      }, this);
      this._ignore = true;
      mixin.assign(this, new ScrollableBox(options)); // ScrollableBox.call(this, options)

      delete this._ignore;
      return this;
    }

    this.name = options.name;
    options.position = options.position || {
      left: options.left,
      right: options.right,
      top: options.top,
      bottom: options.bottom,
      width: options.width,
      height: options.height
    };

    if (options.position.width === 'shrink' || options.position.height === 'shrink') {
      if (options.position.width === 'shrink') {
        delete options.position.width;
      }

      if (options.position.height === 'shrink') {
        delete options.position.height;
      }

      options.shrink = true;
    }

    this.position = options.position;
    this.noOverflow = options.noOverflow;
    this.dockBorders = options.dockBorders;
    this.shadow = options.shadow;
    this.style = options.style;

    if (!this.style) {
      this.style = {};
      this.style.fg = options.fg;
      this.style.bg = options.bg;
      this.style.bold = options.bold;
      this.style.underline = options.underline;
      this.style.blink = options.blink;
      this.style.inverse = options.inverse;
      this.style.invisible = options.invisible;
      this.style.transparent = options.transparent;
    }

    this.hidden = options.hidden || false;
    this.fixed = options.fixed || false;
    this.align = options.align || 'left';
    this.valign = options.valign || 'top';
    this.wrap = options.wrap !== false;
    this.shrink = options.shrink;
    this.fixed = options.fixed;
    this.ch = options.ch || ' ';

    if (typeof options.padding === 'number' || !options.padding) {
      options.padding = {
        left: options.padding,
        top: options.padding,
        right: options.padding,
        bottom: options.padding
      };
    }

    this.padding = {
      left: options.padding.left || 0,
      top: options.padding.top || 0,
      right: options.padding.right || 0,
      bottom: options.padding.bottom || 0
    };
    this.border = options.border;

    if (this.border) {
      if (typeof this.border === 'string') {
        this.border = {
          type: this.border
        };
      }

      this.border.type = this.border.type || 'bg';
      if (this.border.type === 'ascii') this.border.type = 'line';
      this.border.ch = this.border.ch || ' ';
      this.style.border = this.style.border || this.border.style;

      if (!this.style.border) {
        this.style.border = {};
        this.style.border.fg = this.border.fg;
        this.style.border.bg = this.border.bg;
      } //this.border.style = this.style.border;


      if (this.border.left == null) this.border.left = true;
      if (this.border.top == null) this.border.top = true;
      if (this.border.right == null) this.border.right = true;
      if (this.border.bottom == null) this.border.bottom = true;
    } // if (options.mouse || options.clickable) {


    if (options.clickable) {
      this.screen._listenMouse(this);
    }

    if (options.input || options.keyable) {
      this.screen._listenKeys(this);
    }

    this.parseTags = options.parseTags || options.tags;
    this.setContent(options.content || '', true);

    if (options.label) {
      this.setLabel(options.label);
    }

    if (options.hoverText) {
      this.setHover(options.hoverText);
    } // TODO: Possibly move this to Node for onScreenEvent('mouse', ...).


    this.on('newListener', function fn(type) {
      // type = type.split(' ').slice(1).join(' ');
      if (type === 'mouse' || type === 'click' || type === 'mouseover' || type === 'mouseout' || type === 'mousedown' || type === 'mouseup' || type === 'mousewheel' || type === 'wheeldown' || type === 'wheelup' || type === 'mousemove') {
        self.screen._listenMouse(self);
      } else if (type === 'keypress' || type.indexOf('key ') === 0) {
        self.screen._listenKeys(self);
      }
    });
    this.on('resize', function () {
      self.parseContent();
    });
    this.on('attach', function () {
      self.parseContent();
    });
    this.on('detach', function () {
      delete self.lpos;
    });

    if (options.hoverBg != null) {
      options.hoverEffects = options.hoverEffects || {};
      options.hoverEffects.bg = options.hoverBg;
    }

    if (this.style.hover) {
      options.hoverEffects = this.style.hover;
    }

    if (this.style.focus) {
      options.focusEffects = this.style.focus;
    }

    if (options.effects) {
      if (options.effects.hover) options.hoverEffects = options.effects.hover;
      if (options.effects.focus) options.focusEffects = options.effects.focus;
    }

    [['hoverEffects', 'mouseover', 'mouseout', '_htemp'], ['focusEffects', 'focus', 'blur', '_ftemp']].forEach(function (props) {
      const pname = props[0],
            over = props[1],
            out = props[2],
            temp = props[3];
      self.screen.setEffects(self, self, over, out, self.options[pname], temp);
    });

    if (this.options.draggable) {
      this.draggable = true;
    }

    if (options.focused) this.focus();
    this._render = Element$1.prototype.render;
  }

  get focused() {
    return this.screen.focused === this;
  }

  get visible() {
    let el = this;

    do {
      if (el.detached) return false;
      if (el.hidden) return false; // if (!el.lpos) return false;
      // if (el.position.width === 0 || el.position.height === 0) return false;
    } while (el = el.parent);

    return true;
  }

  get _detached() {
    let el = this;

    do {
      if (el.type === 'screen') return false;
      if (!el.parent) return true;
    } while (el = el.parent);

    return false;
  }

  get draggable() {
    return this._draggable === true;
  }

  set draggable(draggable) {
    return draggable ? this.enableDrag(draggable) : this.disableDrag();
  }
  /**
   * Positioning
   */


  get width() {
    return this._getWidth(false);
  }

  get height() {
    return this._getHeight(false);
  }

  get aleft() {
    return this._getLeft(false);
  }

  get aright() {
    return this._getRight(false);
  }

  get atop() {
    return this._getTop(false);
  }

  get abottom() {
    return this._getBottom(false);
  }

  get rleft() {
    return this.aleft - this.parent.aleft;
  }

  get rright() {
    return this.aright - this.parent.aright;
  }

  get rtop() {
    return this.atop - this.parent.atop;
  }

  get rbottom() {
    return this.abottom - this.parent.abottom;
  }
  /**
   * Position Setters
   */
  // NOTE:
  // For aright, abottom, right, and bottom:
  // If position.bottom is null, we could simply set top instead.
  // But it wouldn't replicate bottom behavior appropriately if
  // the parent was resized, etc.


  set width(val) {
    if (this.position.width === val) return;
    if (/^\d+$/.test(val)) val = +val;
    this.emit('resize');
    this.clearPos();
    return this.position.width = val;
  }

  set height(val) {
    if (this.position.height === val) return;
    if (/^\d+$/.test(val)) val = +val;
    this.emit('resize');
    this.clearPos();
    return this.position.height = val;
  }

  set aleft(val) {
    let expr;

    if (typeof val === 'string') {
      if (val === 'center') {
        val = this.screen.width / 2 | 0;
        val -= this.width / 2 | 0;
      } else {
        expr = val.split(/(?=\+|-)/);
        val = expr[0];
        val = +val.slice(0, -1) / 100;
        val = this.screen.width * val | 0;
        val += +(expr[1] || 0);
      }
    }

    val -= this.parent.aleft;
    if (this.position.left === val) return;
    this.emit('move');
    this.clearPos();
    return this.position.left = val;
  }

  set aright(val) {
    val -= this.parent.aright;
    if (this.position.right === val) return;
    this.emit('move');
    this.clearPos();
    return this.position.right = val;
  }

  set atop(val) {
    let expr;

    if (typeof val === 'string') {
      if (val === 'center') {
        val = this.screen.height / 2 | 0;
        val -= this.height / 2 | 0;
      } else {
        expr = val.split(/(?=\+|-)/);
        val = expr[0];
        val = +val.slice(0, -1) / 100;
        val = this.screen.height * val | 0;
        val += +(expr[1] || 0);
      }
    }

    val -= this.parent.atop;
    if (this.position.top === val) return;
    this.emit('move');
    this.clearPos();
    return this.position.top = val;
  }

  set abottom(val) {
    val -= this.parent.abottom;
    if (this.position.bottom === val) return;
    this.emit('move');
    this.clearPos();
    return this.position.bottom = val;
  }

  set rleft(val) {
    if (this.position.left === val) return;
    if (/^\d+$/.test(val)) val = +val;
    this.emit('move');
    this.clearPos();
    return this.position.left = val;
  }

  set rright(val) {
    if (this.position.right === val) return;
    this.emit('move');
    this.clearPos();
    return this.position.right = val;
  }

  set rtop(val) {
    if (this.position.top === val) return;
    if (/^\d+$/.test(val)) val = +val;
    this.emit('move');
    this.clearPos();
    return this.position.top = val;
  }

  set rbottom(val) {
    if (this.position.bottom === val) return;
    this.emit('move');
    this.clearPos();
    return this.position.bottom = val;
  }

  get ileft() {
    return (this.border ? 1 : 0) + this.padding.left; // return (this.border && this.border.left ? 1 : 0) + this.padding.left;
  }

  get itop() {
    return (this.border ? 1 : 0) + this.padding.top; // return (this.border && this.border.top ? 1 : 0) + this.padding.top;
  }

  get iright() {
    return (this.border ? 1 : 0) + this.padding.right; // return (this.border && this.border.right ? 1 : 0) + this.padding.right;
  }

  get ibottom() {
    return (this.border ? 1 : 0) + this.padding.bottom; // return (this.border && this.border.bottom ? 1 : 0) + this.padding.bottom;
  }

  get iwidth() {
    // return (this.border
    //   ? ((this.border.left ? 1 : 0) + (this.border.right ? 1 : 0)) : 0)
    //   + this.padding.left + this.padding.right;
    return (this.border ? 2 : 0) + this.padding.left + this.padding.right;
  }

  get iheight() {
    // return (this.border
    //   ? ((this.border.top ? 1 : 0) + (this.border.bottom ? 1 : 0)) : 0)
    //   + this.padding.top + this.padding.bottom;
    return (this.border ? 2 : 0) + this.padding.top + this.padding.bottom;
  }

  get tpadding() {
    return this.padding.left + this.padding.top + this.padding.right + this.padding.bottom;
  }
  /**
   * Relative coordinates as default properties
   */


  get left() {
    return this.rleft;
  }

  get right() {
    return this.rright;
  }

  get top() {
    return this.rtop;
  }

  get bottom() {
    return this.rbottom;
  }

  set left(val) {
    return this.rleft = val;
  }

  set right(val) {
    return this.rright = val;
  }

  set top(val) {
    return this.rtop = val;
  }

  set bottom(val) {
    return this.rbottom = val;
  }

  sattr(style, fg, bg) {
    let bold = style.bold,
        underline = style.underline,
        blink = style.blink,
        inverse = style.inverse,
        invisible = style.invisible; // if (arguments.length === 1) {

    if (fg == null && bg == null) {
      fg = style.fg;
      bg = style.bg;
    } // This used to be a loop, but I decided
    // to unroll it for performance's sake.


    if (typeof bold === 'function') bold = bold(this);
    if (typeof underline === 'function') underline = underline(this);
    if (typeof blink === 'function') blink = blink(this);
    if (typeof inverse === 'function') inverse = inverse(this);
    if (typeof invisible === 'function') invisible = invisible(this);
    if (typeof fg === 'function') fg = fg(this);
    if (typeof bg === 'function') bg = bg(this); // return (this.uid << 24)
    //   | ((this.dockBorders ? 32 : 0) << 18)

    return (invisible ? 16 : 0) << 18 | (inverse ? 8 : 0) << 18 | (blink ? 4 : 0) << 18 | (underline ? 2 : 0) << 18 | (bold ? 1 : 0) << 18 | colors__namespace.convert(fg) << 9 | colors__namespace.convert(bg);
  }

  onScreenEvent(type, handler) {
    const listeners = this._slisteners = this._slisteners || [];
    listeners.push({
      type: type,
      handler: handler
    });
    this.screen.on(type, handler);
  }

  onceScreenEvent(type, handler) {
    const listeners = this._slisteners = this._slisteners || [];
    const entry = {
      type: type,
      handler: handler
    };
    listeners.push(entry);
    this.screen.once(type, function () {
      const i = listeners.indexOf(entry);
      if (~i) listeners.splice(i, 1);
      return handler.apply(this, arguments);
    });
  }

  removeScreenEvent(type, handler) {
    const listeners = this._slisteners = this._slisteners || [];

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];

      if (listener.type === type && listener.handler === handler) {
        listeners.splice(i, 1);

        if (this._slisteners.length === 0) {
          delete this._slisteners;
        }

        break;
      }
    }

    this.screen.removeListener(type, handler);
  }

  free() {
    const listeners = this._slisteners = this._slisteners || [];

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      this.screen.removeListener(listener.type, listener.handler);
    }

    delete this._slisteners;
  }

  hide() {
    if (this.hidden) return;
    this.clearPos();
    this.hidden = true;
    this.emit('hide');

    if (this.screen.focused === this) {
      this.screen.rewindFocus();
    }
  }

  show() {
    if (!this.hidden) return;
    this.hidden = false;
    this.emit('show');
  }

  toggle() {
    return this.hidden ? this.show() : this.hide();
  }

  focus() {
    return this.screen.focused = this;
  }

  setContent(content, noClear, noTags) {
    if (!noClear) this.clearPos();
    this.content = content || '';
    this.parseContent(noTags);
    this.emit('set content');
  }

  getContent() {
    if (!this._clines) return '';
    return this._clines.fake.join('\n');
  }

  setText(content, noClear) {
    content = content || '';
    content = content.replace(/\x1b\[[\d;]*m/g, '');
    return this.setContent(content, noClear, true);
  }

  getText() {
    return this.getContent().replace(/\x1b\[[\d;]*m/g, '');
  }

  parseContent(noTags) {
    if (this.detached) return false;
    const width = this.width - this.iwidth;

    if (this._clines == null || this._clines.width !== width || this._clines.content !== this.content) {
      let content = this.content;
      content = content.replace(/[\x00-\x08\x0b-\x0c\x0e-\x1a\x1c-\x1f\x7f]/g, '').replace(/\x1b(?!\[[\d;]*m)/g, '').replace(/\r\n|\r/g, '\n').replace(/\t/g, this.screen.tabc);

      if (this.screen.fullUnicode) {
        // double-width chars will eat the next char after render. create a
        // blank character after it so it doesn't eat the real next char.
        content = content.replace(unicode__namespace.chars.all, '$1\x03'); // iTerm2 cannot render combining characters properly.

        if (this.screen.program.isiTerm2) {
          content = content.replace(unicode__namespace.chars.combining, '');
        }
      } else {
        // no double-width: replace them with question-marks.
        content = content.replace(unicode__namespace.chars.all, '??'); // delete combining characters since they're 0-width anyway.
        // NOTE: We could drop this, the non-surrogates would get changed to ? by
        // the unicode filter, and surrogates changed to ? by the surrogate
        // regex. however, the user might expect them to be 0-width.
        // NOTE: Might be better for performance to drop!

        content = content.replace(unicode__namespace.chars.combining, ''); // no surrogate pairs: replace them with question-marks.

        content = content.replace(unicode__namespace.chars.surrogate, '?'); // XXX Deduplicate code here:
        // content = helpers.dropUnicode(content);
      }

      if (!noTags) {
        content = this._parseTags(content);
      }

      this._clines = this._wrapContent(content, width);
      this._clines.width = width;
      this._clines.content = this.content;
      this._clines.attr = this._parseAttr(this._clines);
      this._clines.ci = [];

      this._clines.reduce(function (total, line) {
        this._clines.ci.push(total);

        return total + line.length + 1;
      }.bind(this), 0);

      this._pcontent = this._clines.join('\n');
      this.emit('parsed content');
      return true;
    } // Need to calculate this every time because the default fg/bg may change.


    this._clines.attr = this._parseAttr(this._clines) || this._clines.attr;
    return false;
  } // Convert `{red-fg}foo{/red-fg}` to `\x1b[31mfoo\x1b[39m`.


  _parseTags(text) {
    if (!this.parseTags) return text;
    if (!/{\/?[\w\-,;!#]*}/.test(text)) return text;
    const program = this.screen.program;
    let out = '',
        state;
    const bg = [],
          fg = [],
          flag = [];
    let cap, slash, param, attr, esc;

    for (;;) {
      if (!esc && (cap = /^{escape}/.exec(text))) {
        text = text.substring(cap[0].length);
        esc = true;
        continue;
      }

      if (esc && (cap = /^([\s\S]+?){\/escape}/.exec(text))) {
        text = text.substring(cap[0].length);
        out += cap[1];
        esc = false;
        continue;
      }

      if (esc) {
        // throw new Error('Unterminated escape tag.');
        out += text;
        break;
      }

      if (cap = /^{(\/?)([\w\-,;!#]*)}/.exec(text)) {
        text = text.substring(cap[0].length);
        slash = cap[1] === '/';
        param = cap[2].replace(/-/g, ' ');

        if (param === 'open') {
          out += '{';
          continue;
        } else if (param === 'close') {
          out += '}';
          continue;
        }

        if (param.slice(-3) === ' bg') state = bg;else if (param.slice(-3) === ' fg') state = fg;else state = flag;

        if (slash) {
          if (!param) {
            out += program._attr('normal');
            bg.length = 0;
            fg.length = 0;
            flag.length = 0;
          } else {
            attr = program._attr(param, false);

            if (attr == null) {
              out += cap[0];
            } else {
              // if (param !== state[state.length - 1]) {
              //   throw new Error('Misnested tags.');
              // }
              state.pop();

              if (state.length) {
                out += program._attr(state[state.length - 1]);
              } else {
                out += attr;
              }
            }
          }
        } else {
          if (!param) {
            out += cap[0];
          } else {
            attr = program._attr(param);

            if (attr == null) {
              out += cap[0];
            } else {
              state.push(param);
              out += attr;
            }
          }
        }

        continue;
      }

      if (cap = /^[\s\S]+?(?={\/?[\w\-,;!#]*})/.exec(text)) {
        text = text.substring(cap[0].length);
        out += cap[0];
        continue;
      }

      out += text;
      break;
    }

    return out;
  }

  _parseAttr(lines) {
    const dattr = this.sattr(this.style);
    let attr = dattr;
    const attrs = [];
    let line, i, j, c;

    if (lines[0].attr === attr) {
      return;
    }

    for (j = 0; j < lines.length; j++) {
      line = lines[j];
      attrs[j] = attr;

      for (i = 0; i < line.length; i++) {
        if (line[i] === '\x1b') {
          if (c = /^\x1b\[[\d;]*m/.exec(line.substring(i))) {
            attr = this.screen.attrCode(c[0], attr, dattr);
            i += c[0].length - 1;
          }
        }
      }
    }

    return attrs;
  }

  _align(line, width, align) {
    if (!align) return line; //if (!align && !~line.indexOf('{|}')) return line;

    const cline = line.replace(/\x1b\[[\d;]*m/g, ''),
          len = cline.length;
    let s = width - len;

    if (this.shrink) {
      s = 0;
    }

    if (len === 0) return line;
    if (s < 0) return line;

    if (align === 'center') {
      s = Array((s / 2 | 0) + 1).join(' ');
      return s + line + s;
    } else if (align === 'right') {
      s = Array(s + 1).join(' ');
      return s + line;
    } else if (this.parseTags && ~line.indexOf('{|}')) {
      const parts = line.split('{|}');
      const cparts = cline.split('{|}');
      s = Math.max(width - cparts[0].length - cparts[1].length, 0);
      s = Array(s + 1).join(' ');
      return parts[0] + s + parts[1];
    }

    return line;
  }

  _wrapContent(content, width) {
    const tags = this.parseTags;
    let state = this.align;
    const wrap = this.wrap;
    let margin = 0;
    const rtof = [],
          ftor = [],
          out = [];
    let no = 0,
        line,
        align,
        cap,
        total,
        i,
        part,
        j,
        lines,
        rest;
    lines = content.split('\n');

    if (!content) {
      out.push(content);
      out.rtof = [0];
      out.ftor = [[0]];
      out.fake = lines;
      out.real = out;
      out.mwidth = 0;
      return out;
    }

    if (this.scrollbar) margin++;
    if (this.type === 'textarea') margin++;
    if (width > margin) width -= margin;

    main: for (; no < lines.length; no++) {
      line = lines[no];
      align = state;
      ftor.push([]); // Handle alignment tags.

      if (tags) {
        if (cap = /^{(left|center|right)}/.exec(line)) {
          line = line.substring(cap[0].length);
          align = state = cap[1] !== 'left' ? cap[1] : null;
        }

        if (cap = /{\/(left|center|right)}$/.exec(line)) {
          line = line.slice(0, -cap[0].length); //state = null;

          state = this.align;
        }
      } // If the string is apparently too long, wrap it.


      while (line.length > width) {
        // Measure the real width of the string.
        for (i = 0, total = 0; i < line.length; i++) {
          while (line[i] === '\x1b') {
            while (line[i] && line[i++] !== 'm') {}
          }

          if (!line[i]) break;

          if (++total === width) {
            // If we're not wrapping the text, we have to finish up the rest of
            // the control sequences before cutting off the line.
            i++;

            if (!wrap) {
              rest = line.substring(i).match(/\x1b\[[^m]*m/g);
              rest = rest ? rest.join('') : '';
              out.push(this._align(line.substring(0, i) + rest, width, align));
              ftor[no].push(out.length - 1);
              rtof.push(no);
              continue main;
            }

            if (!this.screen.fullUnicode) {
              // Try to find a space to break on.
              if (i !== line.length) {
                j = i;

                while (j > i - 10 && j > 0 && line[--j] !== ' ') if (line[j] === ' ') i = j + 1;
              }
            } else {
              // Try to find a character to break on.
              if (i !== line.length) {
                // <XXX>
                // Compensate for surrogate length
                // counts on wrapping (experimental):
                // NOTE: Could optimize this by putting
                // it in the parent for loop.
                if (unicode__namespace.isSurrogate(line, i)) i--;

                for (var s = 0, n = 0; n < i; n++) {
                  if (unicode__namespace.isSurrogate(line, n)) s++, n++;
                }

                i += s; // </XXX>

                j = i; // Break _past_ space.
                // Break _past_ double-width chars.
                // Break _past_ surrogate pairs.
                // Break _past_ combining chars.

                while (j > i - 10 && j > 0) {
                  j--;

                  if (line[j] === ' ' || line[j] === '\x03' || unicode__namespace.isSurrogate(line, j - 1) && line[j + 1] !== '\x03' || unicode__namespace.isCombining(line, j)) {
                    break;
                  }
                }

                if (line[j] === ' ' || line[j] === '\x03' || unicode__namespace.isSurrogate(line, j - 1) && line[j + 1] !== '\x03' || unicode__namespace.isCombining(line, j)) {
                  i = j + 1;
                }
              }
            }

            break;
          }
        }

        part = line.substring(0, i);
        line = line.substring(i);
        out.push(this._align(part, width, align));
        ftor[no].push(out.length - 1);
        rtof.push(no); // Make sure we didn't wrap the line to the very end, otherwise
        // we get a pointless empty line after a newline.

        if (line === '') continue main; // If only an escape code got cut off, at it to `part`.

        if (/^(?:\x1b[\[\d;]*m)+$/.test(line)) {
          out[out.length - 1] += line;
          continue main;
        }
      }

      out.push(this._align(line, width, align));
      ftor[no].push(out.length - 1);
      rtof.push(no);
    }

    out.rtof = rtof;
    out.ftor = ftor;
    out.fake = lines;
    out.real = out;
    out.mwidth = out.reduce(function (current, line) {
      line = line.replace(/\x1b\[[\d;]*m/g, '');
      return line.length > current ? line.length : current;
    }, 0);
    return out;
  }

  enableMouse() {
    this.screen._listenMouse(this);
  }

  enableKeys() {
    this.screen._listenKeys(this);
  }

  enableInput() {
    this.screen._listenMouse(this);

    this.screen._listenKeys(this);
  }

  enableDrag(verify) {
    const self = this;
    if (this._draggable) return true;

    if (typeof verify !== 'function') {
      verify = function () {
        return true;
      };
    }

    this.enableMouse();
    this.on('mousedown', this._dragMD = function (data) {
      if (self.screen._dragging) return;
      if (!verify(data)) return;
      self.screen._dragging = self;
      self._drag = {
        x: data.x - self.aleft,
        y: data.y - self.atop
      };
      self.setFront();
    });
    this.onScreenEvent('mouse', this._dragM = function (data) {
      if (self.screen._dragging !== self) return;

      if (data.action !== 'mousedown' && data.action !== 'mousemove') {
        delete self.screen._dragging;
        delete self._drag;
        return;
      } // This can happen in edge cases where the user is
      // already dragging and element when it is detached.


      if (!self.parent) return;
      const ox = self._drag.x,
            oy = self._drag.y,
            px = self.parent.aleft,
            py = self.parent.atop,
            x = data.x - px - ox,
            y = data.y - py - oy;

      if (self.position.right != null) {
        if (self.position.left != null) {
          self.width = '100%-' + (self.parent.width - self.width);
        }

        self.position.right = null;
      }

      if (self.position.bottom != null) {
        if (self.position.top != null) {
          self.height = '100%-' + (self.parent.height - self.height);
        }

        self.position.bottom = null;
      }

      self.rleft = x;
      self.rtop = y;
      self.screen.render();
    });
    return this._draggable = true;
  }

  disableDrag() {
    if (!this._draggable) return false;
    delete this.screen._dragging;
    delete this._drag;
    this.removeListener('mousedown', this._dragMD);
    this.removeScreenEvent('mouse', this._dragM);
    return this._draggable = false;
  }

  key() {
    return this.screen.program.key.apply(this, arguments);
  }

  onceKey() {
    return this.screen.program.onceKey.apply(this, arguments);
  }

  unkey() {
    return this.screen.program.unkey.apply(this, arguments);
  }

  removeKey() {
    return this.screen.program.unkey.apply(this, arguments);
  }

  setIndex(index) {
    if (!this.parent) return;

    if (index < 0) {
      index = this.parent.children.length + index;
    }

    index = Math.max(index, 0);
    index = Math.min(index, this.parent.children.length - 1);
    const i = this.parent.children.indexOf(this);
    if (!~i) return;
    const item = this.parent.children.splice(i, 1)[0];
    this.parent.children.splice(index, 0, item);
  }

  setFront() {
    return this.setIndex(-1);
  }

  setBack() {
    return this.setIndex(0);
  }

  clearPos(get, override) {
    if (this.detached) return;

    const lpos = this._getCoords(get);

    if (!lpos) return;
    this.screen.clearRegion(lpos.xi, lpos.xl, lpos.yi, lpos.yl, override);
  }

  setLabel(options) {
    const self = this;

    const Box = require('./box');

    if (typeof options === 'string') {
      options = {
        text: options
      };
    }

    if (this._label) {
      this._label.setContent(options.text);

      if (options.side !== 'right') {
        this._label.rleft = 2 + (this.border ? -1 : 0);
        this._label.position.right = undefined;

        if (!this.screen.autoPadding) {
          this._label.rleft = 2;
        }
      } else {
        this._label.rright = 2 + (this.border ? -1 : 0);
        this._label.position.left = undefined;

        if (!this.screen.autoPadding) {
          this._label.rright = 2;
        }
      }

      return;
    }

    this._label = new Box({
      screen: this.screen,
      parent: this,
      content: options.text,
      top: -this.itop,
      tags: this.parseTags,
      shrink: true,
      style: this.style.label
    });

    if (options.side !== 'right') {
      this._label.rleft = 2 - this.ileft;
    } else {
      this._label.rright = 2 - this.iright;
    }

    this._label._isLabel = true;

    if (!this.screen.autoPadding) {
      if (options.side !== 'right') {
        this._label.rleft = 2;
      } else {
        this._label.rright = 2;
      }

      this._label.rtop = 0;
    }

    const reposition = function () {
      self._label.rtop = (self.childBase || 0) - self.itop;

      if (!self.screen.autoPadding) {
        self._label.rtop = self.childBase || 0;
      }

      self.screen.render();
    };

    this.on('scroll', this._labelScroll = function () {
      reposition();
    });
    this.on('resize', this._labelResize = function () {
      nextTick$2(function () {
        reposition();
      });
    });
  }

  removeLabel() {
    if (!this._label) return;
    this.removeListener('scroll', this._labelScroll);
    this.removeListener('resize', this._labelResize);

    this._label.detach();

    delete this._labelScroll;
    delete this._labelResize;
    delete this._label;
  }

  setHover(options) {
    if (typeof options === 'string') {
      options = {
        text: options
      };
    }

    this._hoverOptions = options;
    this.enableMouse();

    this.screen._initHover();
  }

  removeHover() {
    delete this._hoverOptions;
    if (!this.screen._hoverText || this.screen._hoverText.detached) return;

    this.screen._hoverText.detach();

    this.screen.render();
  } // The below methods are a bit confusing: basically
  // whenever Box.render is called `lpos` gets set on
  // the element, an object containing the rendered
  // coordinates. Since these don't update if the
  // element is moved somehow, they're unreliable in
  // that situation. However, if we can guarantee that
  // lpos is good and up to date, it can be more
  // accurate than the calculated positions below.
  // In this case, if the element is being rendered,
  // it's guaranteed that the parent will have been
  // rendered first, in which case we can use the
  // parant's lpos instead of recalculating it's
  // position (since that might be wrong because
  // it doesn't handle content shrinkage).


  _getPos() {
    const pos = this.lpos;
    assert__default['default'].ok(pos);
    if (pos.aleft != null) return pos;
    pos.aleft = pos.xi;
    pos.atop = pos.yi;
    pos.aright = this.screen.cols - pos.xl;
    pos.abottom = this.screen.rows - pos.yl;
    pos.width = pos.xl - pos.xi;
    pos.height = pos.yl - pos.yi;
    return pos;
  }
  /**
   * Position Getters
   */


  _getWidth(get) {
    const parent = get ? this.parent._getPos() : this.parent;
    let width = this.position.width,
        left,
        expr;

    if (typeof width === 'string') {
      if (width === 'half') width = '50%';
      expr = width.split(/(?=\+|-)/);
      width = expr[0];
      width = +width.slice(0, -1) / 100;
      width = parent.width * width | 0;
      width += +(expr[1] || 0);
      return width;
    } // This is for if the element is being streched or shrunken.
    // Although the width for shrunken elements is calculated
    // in the render function, it may be calculated based on
    // the content width, and the content width is initially
    // decided by the width the element, so it needs to be
    // calculated here.


    if (width == null) {
      left = this.position.left || 0;

      if (typeof left === 'string') {
        if (left === 'center') left = '50%';
        expr = left.split(/(?=\+|-)/);
        left = expr[0];
        left = +left.slice(0, -1) / 100;
        left = parent.width * left | 0;
        left += +(expr[1] || 0);
      }

      width = parent.width - (this.position.right || 0) - left;

      if (this.screen.autoPadding) {
        if ((this.position.left != null || this.position.right == null) && this.position.left !== 'center') {
          width -= this.parent.ileft;
        }

        width -= this.parent.iright;
      }
    }

    return width;
  }

  _getHeight(get) {
    const parent = get ? this.parent._getPos() : this.parent;
    let height = this.position.height,
        top,
        expr;

    if (typeof height === 'string') {
      if (height === 'half') height = '50%';
      expr = height.split(/(?=\+|-)/);
      height = expr[0];
      height = +height.slice(0, -1) / 100;
      height = parent.height * height | 0;
      height += +(expr[1] || 0);
      return height;
    } // This is for if the element is being streched or shrunken.
    // Although the width for shrunken elements is calculated
    // in the render function, it may be calculated based on
    // the content width, and the content width is initially
    // decided by the width the element, so it needs to be
    // calculated here.


    if (height == null) {
      top = this.position.top || 0;

      if (typeof top === 'string') {
        if (top === 'center') top = '50%';
        expr = top.split(/(?=\+|-)/);
        top = expr[0];
        top = +top.slice(0, -1) / 100;
        top = parent.height * top | 0;
        top += +(expr[1] || 0);
      }

      height = parent.height - (this.position.bottom || 0) - top;

      if (this.screen.autoPadding) {
        if ((this.position.top != null || this.position.bottom == null) && this.position.top !== 'center') {
          height -= this.parent.itop;
        }

        height -= this.parent.ibottom;
      }
    }

    return height;
  }

  _getLeft(get) {
    const parent = get ? this.parent._getPos() : this.parent;
    let left = this.position.left || 0,
        expr;

    if (typeof left === 'string') {
      if (left === 'center') left = '50%';
      expr = left.split(/(?=\+|-)/);
      left = expr[0];
      left = +left.slice(0, -1) / 100;
      left = parent.width * left | 0;
      left += +(expr[1] || 0);

      if (this.position.left === 'center') {
        left -= this._getWidth(get) / 2 | 0;
      }
    }

    if (this.position.left == null && this.position.right != null) {
      return this.screen.cols - this._getWidth(get) - this._getRight(get);
    }

    if (this.screen.autoPadding) {
      if ((this.position.left != null || this.position.right == null) && this.position.left !== 'center') {
        left += this.parent.ileft;
      }
    }

    return (parent.aleft || 0) + left;
  }

  _getRight(get) {
    const parent = get ? this.parent._getPos() : this.parent;
    let right;

    if (this.position.right == null && this.position.left != null) {
      right = this.screen.cols - (this._getLeft(get) + this._getWidth(get));

      if (this.screen.autoPadding) {
        right += this.parent.iright;
      }

      return right;
    }

    right = (parent.aright || 0) + (this.position.right || 0);

    if (this.screen.autoPadding) {
      right += this.parent.iright;
    }

    return right;
  }

  _getTop(get) {
    const parent = get ? this.parent._getPos() : this.parent;
    let top = this.position.top || 0,
        expr;

    if (typeof top === 'string') {
      if (top === 'center') top = '50%';
      expr = top.split(/(?=\+|-)/);
      top = expr[0];
      top = +top.slice(0, -1) / 100;
      top = parent.height * top | 0;
      top += +(expr[1] || 0);

      if (this.position.top === 'center') {
        top -= this._getHeight(get) / 2 | 0;
      }
    }

    if (this.position.top == null && this.position.bottom != null) {
      return this.screen.rows - this._getHeight(get) - this._getBottom(get);
    }

    if (this.screen.autoPadding) {
      if ((this.position.top != null || this.position.bottom == null) && this.position.top !== 'center') {
        top += this.parent.itop;
      }
    }

    return (parent.atop || 0) + top;
  }

  _getBottom(get) {
    const parent = get ? this.parent._getPos() : this.parent;
    let bottom;

    if (this.position.bottom == null && this.position.top != null) {
      bottom = this.screen.rows - (this._getTop(get) + this._getHeight(get));

      if (this.screen.autoPadding) {
        bottom += this.parent.ibottom;
      }

      return bottom;
    }

    bottom = (parent.abottom || 0) + (this.position.bottom || 0);

    if (this.screen.autoPadding) {
      bottom += this.parent.ibottom;
    }

    return bottom;
  }
  /**
   * Rendering - here be dragons
   */


  _getShrinkBox(xi, xl, yi, yl, get) {
    if (!this.children.length) {
      return {
        xi: xi,
        xl: xi + 1,
        yi: yi,
        yl: yi + 1
      };
    }

    let i,
        el,
        ret,
        mxi = xi,
        mxl = xi + 1,
        myi = yi,
        myl = yi + 1; // This is a chicken and egg problem. We need to determine how the children
    // will render in order to determine how this element renders, but it in
    // order to figure out how the children will render, they need to know
    // exactly how their parent renders, so, we can give them what we have so
    // far.

    let _lpos;

    if (get) {
      _lpos = this.lpos;
      this.lpos = {
        xi: xi,
        xl: xl,
        yi: yi,
        yl: yl
      }; //this.shrink = false;
    }

    for (i = 0; i < this.children.length; i++) {
      el = this.children[i];
      ret = el._getCoords(get); // Or just (seemed to work, but probably not good):
      // ret = el.lpos || this.lpos;

      if (!ret) continue; // Since the parent element is shrunk, and the child elements think it's
      // going to take up as much space as possible, an element anchored to the
      // right or bottom will inadvertantly make the parent's shrunken size as
      // large as possible. So, we can just use the height and/or width the of
      // element.
      // if (get) {

      if (el.position.left == null && el.position.right != null) {
        ret.xl = xi + (ret.xl - ret.xi);
        ret.xi = xi;

        if (this.screen.autoPadding) {
          // Maybe just do this no matter what.
          ret.xl += this.ileft;
          ret.xi += this.ileft;
        }
      }

      if (el.position.top == null && el.position.bottom != null) {
        ret.yl = yi + (ret.yl - ret.yi);
        ret.yi = yi;

        if (this.screen.autoPadding) {
          // Maybe just do this no matter what.
          ret.yl += this.itop;
          ret.yi += this.itop;
        }
      }

      if (ret.xi < mxi) mxi = ret.xi;
      if (ret.xl > mxl) mxl = ret.xl;
      if (ret.yi < myi) myi = ret.yi;
      if (ret.yl > myl) myl = ret.yl;
    }

    if (get) {
      this.lpos = _lpos; //this.shrink = true;
    }

    if (this.position.width == null && (this.position.left == null || this.position.right == null)) {
      if (this.position.left == null && this.position.right != null) {
        xi = xl - (mxl - mxi);

        if (!this.screen.autoPadding) {
          xi -= this.padding.left + this.padding.right;
        } else {
          xi -= this.ileft;
        }
      } else {
        xl = mxl;

        if (!this.screen.autoPadding) {
          xl += this.padding.left + this.padding.right; // XXX Temporary workaround until we decide to make autoPadding default.
          // See widget-listtable.js for an example of why this is necessary.
          // XXX Maybe just to this for all this being that this would affect
          // width shrunken normal shrunken lists as well.
          // if (this._isList) {

          if (this.type === 'list-table') {
            xl -= this.padding.left + this.padding.right;
            xl += this.iright;
          }
        } else {
          //xl += this.padding.right;
          xl += this.iright;
        }
      }
    }

    if (this.position.height == null && (this.position.top == null || this.position.bottom == null) && (!this.scrollable || this._isList)) {
      // NOTE: Lists get special treatment if they are shrunken - assume they
      // want all list items showing. This is one case we can calculate the
      // height based on items/boxes.
      if (this._isList) {
        myi = 0 - this.itop;
        myl = this.items.length + this.ibottom;
      }

      if (this.position.top == null && this.position.bottom != null) {
        yi = yl - (myl - myi);

        if (!this.screen.autoPadding) {
          yi -= this.padding.top + this.padding.bottom;
        } else {
          yi -= this.itop;
        }
      } else {
        yl = myl;

        if (!this.screen.autoPadding) {
          yl += this.padding.top + this.padding.bottom;
        } else {
          yl += this.ibottom;
        }
      }
    }

    return {
      xi: xi,
      xl: xl,
      yi: yi,
      yl: yl
    };
  }

  _getShrinkContent(xi, xl, yi, yl) {
    const h = this._clines.length,
          w = this._clines.mwidth || 1;

    if (this.position.width == null && (this.position.left == null || this.position.right == null)) {
      if (this.position.left == null && this.position.right != null) {
        xi = xl - w - this.iwidth;
      } else {
        xl = xi + w + this.iwidth;
      }
    }

    if (this.position.height == null && (this.position.top == null || this.position.bottom == null) && (!this.scrollable || this._isList)) {
      if (this.position.top == null && this.position.bottom != null) {
        yi = yl - h - this.iheight;
      } else {
        yl = yi + h + this.iheight;
      }
    }

    return {
      xi: xi,
      xl: xl,
      yi: yi,
      yl: yl
    };
  }

  _getShrink(xi, xl, yi, yl, get) {
    const shrinkBox = this._getShrinkBox(xi, xl, yi, yl, get),
          shrinkContent = this._getShrinkContent(xi, xl, yi, yl, get);

    let xll = xl,
        yll = yl; // Figure out which one is bigger and use it.

    if (shrinkBox.xl - shrinkBox.xi > shrinkContent.xl - shrinkContent.xi) {
      xi = shrinkBox.xi;
      xl = shrinkBox.xl;
    } else {
      xi = shrinkContent.xi;
      xl = shrinkContent.xl;
    }

    if (shrinkBox.yl - shrinkBox.yi > shrinkContent.yl - shrinkContent.yi) {
      yi = shrinkBox.yi;
      yl = shrinkBox.yl;
    } else {
      yi = shrinkContent.yi;
      yl = shrinkContent.yl;
    } // Recenter shrunken elements.


    if (xl < xll && this.position.left === 'center') {
      xll = (xll - xl) / 2 | 0;
      xi += xll;
      xl += xll;
    }

    if (yl < yll && this.position.top === 'center') {
      yll = (yll - yl) / 2 | 0;
      yi += yll;
      yl += yll;
    }

    return {
      xi: xi,
      xl: xl,
      yi: yi,
      yl: yl
    };
  }

  _getCoords(get, noscroll) {
    if (this.hidden) return; // if (this.parent._rendering) {
    //   get = true;
    // }

    let xi = this._getLeft(get),
        xl = xi + this._getWidth(get),
        yi = this._getTop(get),
        yl = yi + this._getHeight(get),
        base = this.childBase || 0,
        el = this,
        fixed = this.fixed,
        coords,
        v,
        noleft,
        noright,
        notop,
        nobot,
        ppos,
        b; // Attempt to shrink the element base on the
    // size of the content and child elements.


    if (this.shrink) {
      coords = this._getShrink(xi, xl, yi, yl, get);
      xi = coords.xi, xl = coords.xl;
      yi = coords.yi, yl = coords.yl;
    } // Find a scrollable ancestor if we have one.


    while (el = el.parent) {
      if (el.scrollable) {
        if (fixed) {
          fixed = false;
          continue;
        }

        break;
      }
    } // Check to make sure we're visible and
    // inside of the visible scroll area.
    // NOTE: Lists have a property where only
    // the list items are obfuscated.
    // Old way of doing things, this would not render right if a shrunken element
    // with lots of boxes in it was within a scrollable element.
    // See: $ node test/widget-shrink-fail.js
    // var thisparent = this.parent;


    const thisparent = el;

    if (el && !noscroll) {
      ppos = thisparent.lpos; // The shrink option can cause a stack overflow
      // by calling _getCoords on the child again.
      // if (!get && !thisparent.shrink) {
      //   ppos = thisparent._getCoords();
      // }

      if (!ppos) return; // TODO: Figure out how to fix base (and cbase to only
      // take into account the *parent's* padding.

      yi -= ppos.base;
      yl -= ppos.base;
      b = thisparent.border ? 1 : 0; // XXX
      // Fixes non-`fixed` labels to work with scrolling (they're ON the border):
      // if (this.position.left < 0
      //     || this.position.right < 0
      //     || this.position.top < 0
      //     || this.position.bottom < 0) {

      if (this._isLabel) {
        b = 0;
      }

      if (yi < ppos.yi + b) {
        if (yl - 1 < ppos.yi + b) {
          // Is above.
          return;
        } else {
          // Is partially covered above.
          notop = true;
          v = ppos.yi - yi;
          if (this.border) v--;
          if (thisparent.border) v++;
          base += v;
          yi += v;
        }
      } else if (yl > ppos.yl - b) {
        if (yi > ppos.yl - 1 - b) {
          // Is below.
          return;
        } else {
          // Is partially covered below.
          nobot = true;
          v = yl - ppos.yl;
          if (this.border) v--;
          if (thisparent.border) v++;
          yl -= v;
        }
      } // Shouldn't be necessary.
      // assert.ok(yi < yl);


      if (yi >= yl) return; // Could allow overlapping stuff in scrolling elements
      // if we cleared the pending buffer before every draw.

      if (xi < el.lpos.xi) {
        xi = el.lpos.xi;
        noleft = true;
        if (this.border) xi--;
        if (thisparent.border) xi++;
      }

      if (xl > el.lpos.xl) {
        xl = el.lpos.xl;
        noright = true;
        if (this.border) xl++;
        if (thisparent.border) xl--;
      } //if (xi > xl) return;


      if (xi >= xl) return;
    }

    if (this.noOverflow && this.parent.lpos) {
      if (xi < this.parent.lpos.xi + this.parent.ileft) {
        xi = this.parent.lpos.xi + this.parent.ileft;
      }

      if (xl > this.parent.lpos.xl - this.parent.iright) {
        xl = this.parent.lpos.xl - this.parent.iright;
      }

      if (yi < this.parent.lpos.yi + this.parent.itop) {
        yi = this.parent.lpos.yi + this.parent.itop;
      }

      if (yl > this.parent.lpos.yl - this.parent.ibottom) {
        yl = this.parent.lpos.yl - this.parent.ibottom;
      }
    } // if (this.parent.lpos) {
    //   this.parent.lpos._scrollBottom = Math.max(
    //     this.parent.lpos._scrollBottom, yl);
    // }


    return {
      xi: xi,
      xl: xl,
      yi: yi,
      yl: yl,
      base: base,
      noleft: noleft,
      noright: noright,
      notop: notop,
      nobot: nobot,
      renders: this.screen.renders
    };
  }

  render() {
    this._emit('prerender');

    this.parseContent();

    const coords = this._getCoords(true);

    if (!coords) {
      delete this.lpos;
      return;
    }

    if (coords.xl - coords.xi <= 0) {
      coords.xl = Math.max(coords.xl, coords.xi);
      return;
    }

    if (coords.yl - coords.yi <= 0) {
      coords.yl = Math.max(coords.yl, coords.yi);
      return;
    }

    const lines = this.screen.lines;
    let xi = coords.xi,
        xl = coords.xl,
        yi = coords.yi,
        yl = coords.yl,
        x,
        y,
        cell,
        attr,
        ch;
    const content = this._pcontent;
    let ci = this._clines.ci[coords.base],
        battr,
        dattr,
        c,
        visible,
        i;
    const bch = this.ch; // Clip content if it's off the edge of the screen
    // if (xi + this.ileft < 0 || yi + this.itop < 0) {
    //   var clines = this._clines.slice();
    //   if (xi + this.ileft < 0) {
    //     for (var i = 0; i < clines.length; i++) {
    //       var t = 0;
    //       var csi = '';
    //       var csis = '';
    //       for (var j = 0; j < clines[i].length; j++) {
    //         while (clines[i][j] === '\x1b') {
    //           csi = '\x1b';
    //           while (clines[i][j++] !== 'm') csi += clines[i][j];
    //           csis += csi;
    //         }
    //         if (++t === -(xi + this.ileft) + 1) break;
    //       }
    //       clines[i] = csis + clines[i].substring(j);
    //     }
    //   }
    //   if (yi + this.itop < 0) {
    //     clines = clines.slice(-(yi + this.itop));
    //   }
    //   content = clines.join('\n');
    // }

    if (coords.base >= this._clines.ci.length) {
      ci = this._pcontent.length;
    }

    this.lpos = coords;

    if (this.border && this.border.type === 'line') {
      this.screen._borderStops[coords.yi] = true;
      this.screen._borderStops[coords.yl - 1] = true; // if (!this.screen._borderStops[coords.yi]) {
      //   this.screen._borderStops[coords.yi] = { xi: coords.xi, xl: coords.xl };
      // } else {
      //   if (this.screen._borderStops[coords.yi].xi > coords.xi) {
      //     this.screen._borderStops[coords.yi].xi = coords.xi;
      //   }
      //   if (this.screen._borderStops[coords.yi].xl < coords.xl) {
      //     this.screen._borderStops[coords.yi].xl = coords.xl;
      //   }
      // }
      // this.screen._borderStops[coords.yl - 1] = this.screen._borderStops[coords.yi];
    }

    dattr = this.sattr(this.style);
    attr = dattr; // If we're in a scrollable text box, check to
    // see which attributes this line starts with.

    if (ci > 0) {
      attr = this._clines.attr[Math.min(coords.base, this._clines.length - 1)];
    }

    if (this.border) xi++, xl--, yi++, yl--; // If we have padding/valign, that means the
    // content-drawing loop will skip a few cells/lines.
    // To deal with this, we can just fill the whole thing
    // ahead of time. This could be optimized.

    if (this.tpadding || this.valign && this.valign !== 'top') {
      if (this.style.transparent) {
        for (y = Math.max(yi, 0); y < yl; y++) {
          if (!lines[y]) break;

          for (x = Math.max(xi, 0); x < xl; x++) {
            if (!lines[y][x]) break;
            lines[y][x][0] = colors__namespace.blend(attr, lines[y][x][0]); // lines[y][x][1] = bch;

            lines[y].dirty = true;
          }
        }
      } else {
        this.screen.fillRegion(dattr, bch, xi, xl, yi, yl);
      }
    }

    if (this.tpadding) {
      xi += this.padding.left, xl -= this.padding.right;
      yi += this.padding.top, yl -= this.padding.bottom;
    } // Determine where to place the text if it's vertically aligned.


    if (this.valign === 'middle' || this.valign === 'bottom') {
      visible = yl - yi;

      if (this._clines.length < visible) {
        if (this.valign === 'middle') {
          visible = visible / 2 | 0;
          visible -= this._clines.length / 2 | 0;
        } else if (this.valign === 'bottom') {
          visible -= this._clines.length;
        }

        ci -= visible * (xl - xi);
      }
    } // Draw the content and background.


    for (y = yi; y < yl; y++) {
      if (!lines[y]) {
        if (y >= this.screen.height || yl < this.ibottom) {
          break;
        } else {
          continue;
        }
      }

      for (x = xi; x < xl; x++) {
        cell = lines[y][x];

        if (!cell) {
          if (x >= this.screen.width || xl < this.iright) {
            break;
          } else {
            continue;
          }
        }

        ch = content[ci++] || bch; // if (!content[ci] && !coords._contentEnd) {
        //   coords._contentEnd = { x: x - xi, y: y - yi };
        // }
        // Handle escape codes.

        while (ch === '\x1b') {
          if (c = /^\x1b\[[\d;]*m/.exec(content.substring(ci - 1))) {
            ci += c[0].length - 1;
            attr = this.screen.attrCode(c[0], attr, dattr); // Ignore foreground changes for selected items.

            if (this.parent._isList && this.parent.interactive && this.parent.items[this.parent.selected] === this && this.parent.options.invertSelected !== false) {
              attr = attr & ~(0x1ff << 9) | dattr & 0x1ff << 9;
            }

            ch = content[ci] || bch;
            ci++;
          } else {
            break;
          }
        } // Handle newlines.


        if (ch === '\t') ch = bch;

        if (ch === '\n') {
          // If we're on the first cell and we find a newline and the last cell
          // of the last line was not a newline, let's just treat this like the
          // newline was already "counted".
          if (x === xi && y !== yi && content[ci - 2] !== '\n') {
            x--;
            continue;
          } // We could use fillRegion here, name the
          // outer loop, and continue to it instead.


          ch = bch;

          for (; x < xl; x++) {
            cell = lines[y][x];
            if (!cell) break;

            if (this.style.transparent) {
              lines[y][x][0] = colors__namespace.blend(attr, lines[y][x][0]);
              if (content[ci]) lines[y][x][1] = ch;
              lines[y].dirty = true;
            } else {
              if (attr !== cell[0] || ch !== cell[1]) {
                lines[y][x][0] = attr;
                lines[y][x][1] = ch;
                lines[y].dirty = true;
              }
            }
          }

          continue;
        }

        if (this.screen.fullUnicode && content[ci - 1]) {
          const point = unicode__namespace.codePointAt(content, ci - 1); // Handle combining chars:
          // Make sure they get in the same cell and are counted as 0.

          if (unicode__namespace.combining[point]) {
            if (point > 0x00ffff) {
              ch = content[ci - 1] + content[ci];
              ci++;
            }

            if (x - 1 >= xi) {
              lines[y][x - 1][1] += ch;
            } else if (y - 1 >= yi) {
              lines[y - 1][xl - 1][1] += ch;
            }

            x--;
            continue;
          } // Handle surrogate pairs:
          // Make sure we put surrogate pair chars in one cell.


          if (point > 0x00ffff) {
            ch = content[ci - 1] + content[ci];
            ci++;
          }
        }

        if (this._noFill) continue;

        if (this.style.transparent) {
          lines[y][x][0] = colors__namespace.blend(attr, lines[y][x][0]);
          if (content[ci]) lines[y][x][1] = ch;
          lines[y].dirty = true;
        } else {
          if (attr !== cell[0] || ch !== cell[1]) {
            lines[y][x][0] = attr;
            lines[y][x][1] = ch;
            lines[y].dirty = true;
          }
        }
      }
    } // Draw the scrollbar.
    // Could possibly draw this after all child elements.


    if (this.scrollbar) {
      // XXX
      // i = this.getScrollHeight();
      i = Math.max(this._clines.length, this._scrollBottom());
    }

    if (coords.notop || coords.nobot) i = -Infinity;

    if (this.scrollbar && yl - yi < i) {
      x = xl - 1;
      if (this.scrollbar.ignoreBorder && this.border) x++;

      if (this.alwaysScroll) {
        y = this.childBase / (i - (yl - yi));
      } else {
        y = (this.childBase + this.childOffset) / (i - 1);
      }

      y = yi + ((yl - yi) * y | 0);
      if (y >= yl) y = yl - 1;
      cell = lines[y] && lines[y][x];

      if (cell) {
        if (this.track) {
          ch = this.track.ch || ' ';
          attr = this.sattr(this.style.track, this.style.track.fg || this.style.fg, this.style.track.bg || this.style.bg);
          this.screen.fillRegion(attr, ch, x, x + 1, yi, yl);
        }

        ch = this.scrollbar.ch || ' ';
        attr = this.sattr(this.style.scrollbar, this.style.scrollbar.fg || this.style.fg, this.style.scrollbar.bg || this.style.bg);

        if (attr !== cell[0] || ch !== cell[1]) {
          lines[y][x][0] = attr;
          lines[y][x][1] = ch;
          lines[y].dirty = true;
        }
      }
    }

    if (this.border) xi--, xl++, yi--, yl++;

    if (this.tpadding) {
      xi -= this.padding.left, xl += this.padding.right;
      yi -= this.padding.top, yl += this.padding.bottom;
    } // Draw the border.


    if (this.border) {
      battr = this.sattr(this.style.border);
      y = yi;
      if (coords.notop) y = -1;

      for (x = xi; x < xl; x++) {
        if (!lines[y]) break;
        if (coords.noleft && x === xi) continue;
        if (coords.noright && x === xl - 1) continue;
        cell = lines[y][x];
        if (!cell) continue;

        if (this.border.type === 'line') {
          if (x === xi) {
            ch = '\u250c'; // '┌'

            if (!this.border.left) {
              if (this.border.top) {
                ch = '\u2500'; // '─'
              } else {
                continue;
              }
            } else {
              if (!this.border.top) {
                ch = '\u2502'; // '│'
              }
            }
          } else if (x === xl - 1) {
            ch = '\u2510'; // '┐'

            if (!this.border.right) {
              if (this.border.top) {
                ch = '\u2500'; // '─'
              } else {
                continue;
              }
            } else {
              if (!this.border.top) {
                ch = '\u2502'; // '│'
              }
            }
          } else {
            ch = '\u2500'; // '─'
          }
        } else if (this.border.type === 'bg') {
          ch = this.border.ch;
        }

        if (!this.border.top && x !== xi && x !== xl - 1) {
          ch = ' ';

          if (dattr !== cell[0] || ch !== cell[1]) {
            lines[y][x][0] = dattr;
            lines[y][x][1] = ch;
            lines[y].dirty = true;
            continue;
          }
        }

        if (battr !== cell[0] || ch !== cell[1]) {
          lines[y][x][0] = battr;
          lines[y][x][1] = ch;
          lines[y].dirty = true;
        }
      }

      y = yi + 1;

      for (; y < yl - 1; y++) {
        if (!lines[y]) continue;
        cell = lines[y][xi];

        if (cell) {
          if (this.border.left) {
            if (this.border.type === 'line') {
              ch = '\u2502'; // '│'
            } else if (this.border.type === 'bg') {
              ch = this.border.ch;
            }

            if (!coords.noleft) if (battr !== cell[0] || ch !== cell[1]) {
              lines[y][xi][0] = battr;
              lines[y][xi][1] = ch;
              lines[y].dirty = true;
            }
          } else {
            ch = ' ';

            if (dattr !== cell[0] || ch !== cell[1]) {
              lines[y][xi][0] = dattr;
              lines[y][xi][1] = ch;
              lines[y].dirty = true;
            }
          }
        }

        cell = lines[y][xl - 1];

        if (cell) {
          if (this.border.right) {
            if (this.border.type === 'line') {
              ch = '\u2502'; // '│'
            } else if (this.border.type === 'bg') {
              ch = this.border.ch;
            }

            if (!coords.noright) if (battr !== cell[0] || ch !== cell[1]) {
              lines[y][xl - 1][0] = battr;
              lines[y][xl - 1][1] = ch;
              lines[y].dirty = true;
            }
          } else {
            ch = ' ';

            if (dattr !== cell[0] || ch !== cell[1]) {
              lines[y][xl - 1][0] = dattr;
              lines[y][xl - 1][1] = ch;
              lines[y].dirty = true;
            }
          }
        }
      }

      y = yl - 1;
      if (coords.nobot) y = -1;

      for (x = xi; x < xl; x++) {
        if (!lines[y]) break;
        if (coords.noleft && x === xi) continue;
        if (coords.noright && x === xl - 1) continue;
        cell = lines[y][x];
        if (!cell) continue;

        if (this.border.type === 'line') {
          if (x === xi) {
            ch = '\u2514'; // '└'

            if (!this.border.left) {
              if (this.border.bottom) {
                ch = '\u2500'; // '─'
              } else {
                continue;
              }
            } else {
              if (!this.border.bottom) {
                ch = '\u2502'; // '│'
              }
            }
          } else if (x === xl - 1) {
            ch = '\u2518'; // '┘'

            if (!this.border.right) {
              if (this.border.bottom) {
                ch = '\u2500'; // '─'
              } else {
                continue;
              }
            } else {
              if (!this.border.bottom) {
                ch = '\u2502'; // '│'
              }
            }
          } else {
            ch = '\u2500'; // '─'
          }
        } else if (this.border.type === 'bg') {
          ch = this.border.ch;
        }

        if (!this.border.bottom && x !== xi && x !== xl - 1) {
          ch = ' ';

          if (dattr !== cell[0] || ch !== cell[1]) {
            lines[y][x][0] = dattr;
            lines[y][x][1] = ch;
            lines[y].dirty = true;
          }

          continue;
        }

        if (battr !== cell[0] || ch !== cell[1]) {
          lines[y][x][0] = battr;
          lines[y][x][1] = ch;
          lines[y].dirty = true;
        }
      }
    }

    if (this.shadow) {
      // right
      y = Math.max(yi + 1, 0);

      for (; y < yl + 1; y++) {
        if (!lines[y]) break;
        x = xl;

        for (; x < xl + 2; x++) {
          if (!lines[y][x]) break; // lines[y][x][0] = colors.blend(this.dattr, lines[y][x][0]);

          lines[y][x][0] = colors__namespace.blend(lines[y][x][0]);
          lines[y].dirty = true;
        }
      } // bottom


      y = yl;

      for (; y < yl + 1; y++) {
        if (!lines[y]) break;

        for (x = Math.max(xi + 1, 0); x < xl; x++) {
          if (!lines[y][x]) break; // lines[y][x][0] = colors.blend(this.dattr, lines[y][x][0]);

          lines[y][x][0] = colors__namespace.blend(lines[y][x][0]);
          lines[y].dirty = true;
        }
      }
    }

    this.children.forEach(function (el) {
      if (el.screen._ci !== -1) {
        el.index = el.screen._ci++;
      } // if (el.screen._rendering) {
      //   el._rendering = true;
      // }


      el.render(); // if (el.screen._rendering) {
      //   el._rendering = false;
      // }
    });

    this._emit('render', [coords]);

    return coords;
  }
  /**
   * Content Methods
   */


  insertLine(i, line) {
    if (typeof line === 'string') line = line.split('\n');

    if (i !== i || i == null) {
      i = this._clines.ftor.length;
    }

    i = Math.max(i, 0);

    while (this._clines.fake.length < i) {
      this._clines.fake.push('');

      this._clines.ftor.push([this._clines.push('') - 1]);

      this._clines.rtof(this._clines.fake.length - 1);
    } // NOTE: Could possibly compare the first and last ftor line numbers to see
    // if they're the same, or if they fit in the visible region entirely.


    const start = this._clines.length;
    let diff, real;

    if (i >= this._clines.ftor.length) {
      real = this._clines.ftor[this._clines.ftor.length - 1];
      real = real[real.length - 1] + 1;
    } else {
      real = this._clines.ftor[i][0];
    }

    for (let j = 0; j < line.length; j++) {
      this._clines.fake.splice(i + j, 0, line[j]);
    }

    this.setContent(this._clines.fake.join('\n'), true);
    diff = this._clines.length - start;

    if (diff > 0) {
      const pos = this._getCoords();

      if (!pos) return;
      const height = pos.yl - pos.yi - this.iheight,
            base = this.childBase || 0,
            visible = real >= base && real - base < height;

      if (pos && visible && this.screen.cleanSides(this)) {
        this.screen.insertLine(diff, pos.yi + this.itop + real - base, pos.yi, pos.yl - this.ibottom - 1);
      }
    }
  }

  deleteLine(i, n) {
    n = n || 1;

    if (i !== i || i == null) {
      i = this._clines.ftor.length - 1;
    }

    i = Math.max(i, 0);
    i = Math.min(i, this._clines.ftor.length - 1); // NOTE: Could possibly compare the first and last ftor line numbers to see
    // if they're the same, or if they fit in the visible region entirely.

    const start = this._clines.length;
    let diff;
    const real = this._clines.ftor[i][0];

    while (n--) {
      this._clines.fake.splice(i, 1);
    }

    this.setContent(this._clines.fake.join('\n'), true);
    diff = start - this._clines.length; // XXX clearPos() without diff statement?

    let height = 0;

    if (diff > 0) {
      const pos = this._getCoords();

      if (!pos) return;
      height = pos.yl - pos.yi - this.iheight;
      const base = this.childBase || 0,
            visible = real >= base && real - base < height;

      if (pos && visible && this.screen.cleanSides(this)) {
        this.screen.deleteLine(diff, pos.yi + this.itop + real - base, pos.yi, pos.yl - this.ibottom - 1);
      }
    }

    if (this._clines.length < height) {
      this.clearPos();
    }
  }

  insertTop(line) {
    const fake = this._clines.rtof[this.childBase || 0];
    return this.insertLine(fake, line);
  }

  insertBottom(line) {
    const h = (this.childBase || 0) + this.height - this.iheight,
          i = Math.min(h, this._clines.length),
          fake = this._clines.rtof[i - 1] + 1;
    return this.insertLine(fake, line);
  }

  deleteTop(n) {
    const fake = this._clines.rtof[this.childBase || 0];
    return this.deleteLine(fake, n);
  }

  deleteBottom(n) {
    const h = (this.childBase || 0) + this.height - 1 - this.iheight,
          i = Math.min(h, this._clines.length - 1),
          fake = this._clines.rtof[i];
    n = n || 1;
    return this.deleteLine(fake - (n - 1), n);
  }

  setLine(i, line) {
    i = Math.max(i, 0);

    while (this._clines.fake.length < i) {
      this._clines.fake.push('');
    }

    this._clines.fake[i] = line;
    return this.setContent(this._clines.fake.join('\n'), true);
  }

  setBaseLine(i, line) {
    const fake = this._clines.rtof[this.childBase || 0];
    return this.setLine(fake + i, line);
  }

  getLine(i) {
    i = Math.max(i, 0);
    i = Math.min(i, this._clines.fake.length - 1);
    return this._clines.fake[i];
  }

  getBaseLine(i) {
    const fake = this._clines.rtof[this.childBase || 0];
    return this.getLine(fake + i);
  }

  clearLine(i) {
    i = Math.min(i, this._clines.fake.length - 1);
    return this.setLine(i, '');
  }

  clearBaseLine(i) {
    const fake = this._clines.rtof[this.childBase || 0];
    return this.clearLine(fake + i);
  }

  unshiftLine(line) {
    return this.insertLine(0, line);
  }

  shiftLine(n) {
    return this.deleteLine(0, n);
  }

  pushLine(line) {
    if (!this.content) return this.setLine(0, line);
    return this.insertLine(this._clines.fake.length, line);
  }

  popLine(n) {
    return this.deleteLine(this._clines.fake.length - 1, n);
  }

  getLines() {
    return this._clines.fake.slice();
  }

  getScreenLines() {
    return this._clines.slice();
  }

  strWidth(text) {
    text = this.parseTags ? helpers__namespace.stripTags(text) : text;
    return this.screen.fullUnicode ? unicode__namespace.strWidth(text) : helpers__namespace.dropUnicode(text).length;
  }

  screenshot(xi, xl, yi, yl) {
    xi = this.lpos.xi + this.ileft + (xi || 0);

    if (xl != null) {
      xl = this.lpos.xi + this.ileft + (xl || 0);
    } else {
      xl = this.lpos.xl - this.iright;
    }

    yi = this.lpos.yi + this.itop + (yi || 0);

    if (yl != null) {
      yl = this.lpos.yi + this.itop + (yl || 0);
    } else {
      yl = this.lpos.yl - this.ibottom;
    }

    return this.screen.screenshot(xi, xl, yi, yl);
  }

}

/**
 * box.js - box element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
/**
 * Modules
 */

class Box extends Element$1 {
  /**
   * Box
   */
  constructor(options = {}) {
    super(options); // if (!(this instanceof Node)) return new Box(options)

    this.type = 'box';
  }

  static build(options) {
    return new Box(options);
  }

}

/**
 * scrollabletext.js - scrollable text element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class ScrollableText extends ScrollableBox {
  /**
   * ScrollableText
   */
  constructor(options = {}) {
    options.alwaysScroll = true;
    super(options);
    this.type = 'scrollable-text';
    if (!(this instanceof Node)) return new ScrollableText(options);
  }

}

/**
 * log.js - log element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
const nextTick$1 = global.setImmediate || process.nextTick.bind(process);
class Log$1 extends ScrollableText {
  /**
   * Log
   */
  constructor(options = {}) {
    super(options);
    this.type = 'log';
    this.log = this.add;
    this._scroll = this.scroll;
    const self = this;
    if (!(this instanceof Node)) return new Log$1(options);
    this.scrollback = options.scrollback != null ? options.scrollback : Infinity;
    this.scrollOnInput = options.scrollOnInput;
    this.on('set content', function () {
      if (!self._userScrolled || self.scrollOnInput) {
        nextTick$1(function () {
          self.setScrollPerc(100);
          self._userScrolled = false;
          self.screen.render();
        });
      }
    });
    this._scroll = Log$1.prototype.scroll;
  }

  // log() { return this.add() }
  add() {
    const args = Array.prototype.slice.call(arguments);

    if (typeof args[0] === 'object') {
      args[0] = util__default['default'].inspect(args[0], true, 20, true);
    }

    const text = util__default['default'].format.apply(util__default['default'], args);
    this.emit('log', text);
    const ret = this.pushLine(text);

    if (this._clines.fake.length > this.scrollback) {
      this.shiftLine(0, this.scrollback / 3 | 0);
    }

    return ret;
  }

  scroll(offset, always) {
    if (offset === 0) return this._scroll(offset, always);
    this._userScrolled = true;

    const ret = this._scroll(offset, always);

    if (this.getScrollPerc() === 100) {
      this._userScrolled = false;
    }

    return ret;
  }

}

/**
 * layout.js - layout element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Layout extends Element$1 {
  /**
   * Layout
   */
  constructor(options = {}) {
    super(options);
    if (!(this instanceof Node)) return new Layout(options);

    if (options.width == null && options.left == null && options.right == null || options.height == null && options.top == null && options.bottom == null) {
      throw new Error('`Layout` must have a width and height!');
    }

    options.layout = options.layout || 'inline';

    if (options.renderer) {
      this.renderer = options.renderer;
    }

    this.type = 'layout';
  }

  isRendered(el) {
    if (!el.lpos) return false;
    return el.lpos.xl - el.lpos.xi > 0 && el.lpos.yl - el.lpos.yi > 0;
  }

  getLast(i) {
    while (this.children[--i]) {
      const el = this.children[i];
      if (this.isRendered(el)) return el;
    }
  }

  getLastCoords(i) {
    const last = this.getLast(i);
    if (last) return last.lpos;
  }

  _renderCoords() {
    const coords = this._getCoords(true);

    const children = this.children;
    this.children = [];

    this._render();

    this.children = children;
    return coords;
  }

  renderer(coords) {
    const self = this; // The coordinates of the layout element

    const width = coords.xl - coords.xi,
          height = coords.yl - coords.yi,
          xi = coords.xi,
          yi = coords.yi; // The current row offset in cells (which row are we on?)

    let rowOffset = 0; // The index of the first child in the row

    let rowIndex = 0;
    let lastRowIndex = 0; // Figure out the highest width child

    if (this.options.layout === 'grid') {
      var highWidth = this.children.reduce(function (out, el) {
        out = Math.max(out, el.width);
        return out;
      }, 0);
    }

    return function iterator(el, i) {
      // Make our children shrinkable. If they don't have a height, for
      // example, calculate it for them.
      el.shrink = true; // Find the previous rendered child's coordinates

      const last = self.getLast(i); // If there is no previously rendered element, we are on the first child.

      if (!last) {
        el.position.left = 0;
        el.position.top = 0;
      } else {
        // Otherwise, figure out where to place this child. We'll start by
        // setting it's `left`/`x` coordinate to right after the previous
        // rendered element. This child will end up directly to the right of it.
        el.position.left = last.lpos.xl - xi; // Make sure the position matches the highest width element

        if (self.options.layout === 'grid') {
          // Compensate with width:
          // el.position.width = el.width + (highWidth - el.width);
          // Compensate with position:
          el.position.left += highWidth - (last.lpos.xl - last.lpos.xi);
        } // If our child does not overlap the right side of the Layout, set it's
        // `top`/`y` to the current `rowOffset` (the coordinate for the current
        // row).


        if (el.position.left + el.width <= width) {
          el.position.top = rowOffset;
        } else {
          // Otherwise we need to start a new row and calculate a new
          // `rowOffset` and `rowIndex` (the index of the child on the current
          // row).
          rowOffset += self.children.slice(rowIndex, i).reduce(function (out, el) {
            if (!self.isRendered(el)) return out;
            out = Math.max(out, el.lpos.yl - el.lpos.yi);
            return out;
          }, 0);
          lastRowIndex = rowIndex;
          rowIndex = i;
          el.position.left = 0;
          el.position.top = rowOffset;
        }
      } // Make sure the elements on lower rows graviatate up as much as possible


      if (self.options.layout === 'inline') {
        let above = null;
        let abovea = Infinity;

        for (let j = lastRowIndex; j < rowIndex; j++) {
          const l = self.children[j];
          if (!self.isRendered(l)) continue;
          const abs = Math.abs(el.position.left - (l.lpos.xi - xi)); // if (abs < abovea && (l.lpos.xl - l.lpos.xi) <= el.width) {

          if (abs < abovea) {
            above = l;
            abovea = abs;
          }
        }

        if (above) {
          el.position.top = above.lpos.yl - yi;
        }
      } // If our child overflows the Layout, do not render it!
      // Disable this feature for now.


      if (el.position.top + el.height > height) ;
    };
  }

  render() {
    this._emit('prerender');

    const coords = this._renderCoords();

    if (!coords) {
      delete this.lpos;
      return;
    }

    if (coords.xl - coords.xi <= 0) {
      coords.xl = Math.max(coords.xl, coords.xi);
      return;
    }

    if (coords.yl - coords.yi <= 0) {
      coords.yl = Math.max(coords.yl, coords.yi);
      return;
    }

    this.lpos = coords;
    if (this.border) coords.xi++, coords.xl--, coords.yi++, coords.yl--;

    if (this.tpadding) {
      coords.xi += this.padding.left, coords.xl -= this.padding.right;
      coords.yi += this.padding.top, coords.yl -= this.padding.bottom;
    }

    const iterator = this.renderer(coords);
    if (this.border) coords.xi--, coords.xl++, coords.yi--, coords.yl++;

    if (this.tpadding) {
      coords.xi -= this.padding.left, coords.xl += this.padding.right;
      coords.yi -= this.padding.top, coords.yl += this.padding.bottom;
    }

    this.children.forEach(function (el, i) {
      if (el.screen._ci !== -1) {
        el.index = el.screen._ci++;
      }

      const rendered = iterator(el, i);

      if (rendered === false) {
        delete el.lpos;
        return;
      } // if (el.screen._rendering) {
      //   el._rendering = true;
      // }


      el.render(); // if (el.screen._rendering) {
      //   el._rendering = false;
      // }
    });

    this._emit('render', [coords]);

    return coords;
  }

}

/**
 * line.js - line element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
class Line extends Box {
  /**
   * Line
   */
  constructor(options = {}) {
    super(parseOption(options));
    if (!(this instanceof Node)) return new Line(options);
    const orientation = options.orientation || 'vertical';
    delete options.orientation;
    this.ch = !options.type || options.type === 'line' ? orientation === 'horizontal' ? '─' : '│' : options.ch || ' ';
    this.border = {
      type: 'bg',
      __proto__: this
    };
    this.style.border = this.style;
    this.type = 'line';
  }

}

const parseOption = options => {
  if ((options.orientation || 'vertical') === 'vertical') {
    options.width = 1;
  } else {
    options.height = 1;
  }

  return options;
};

/**
 * terminal.js - term.js terminal element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
/**
 * Modules
 */

const nextTick = global.setImmediate || process.nextTick.bind(process);

const parseOptions = options => {
  options.scrollable = false;
  return options;
};

class Terminal extends Box {
  /**
   * Terminal
   */
  constructor(options = {}) {
    super(parseOptions(options));

    if (!(this instanceof Node)) {
      return new Terminal(options);
    } // XXX Workaround for all motion


    if (this.screen.program.tmux && this.screen.program.tmuxVersion >= 2) {
      this.screen.program.enableMouse();
    }

    this.handler = options.handler;
    this.shell = options.shell || process.env.SHELL || 'sh';
    this.args = options.args || [];
    this.cursor = this.options.cursor;
    this.cursorBlink = this.options.cursorBlink;
    this.screenKeys = this.options.screenKeys;
    this.style = this.style || {};
    this.style.bg = this.style.bg || 'default';
    this.style.fg = this.style.fg || 'default';
    this.termName = options.terminal || options.term || process.env.TERM || 'xterm';
    this.bootstrap();
    this.type = 'terminal';
    this.setScroll = Terminal.prototype.scrollTo;
  }

  bootstrap() {
    const self = this;
    const element = {
      // window
      get document() {
        return element;
      },

      navigator: {
        userAgent: 'node.js'
      },

      // document
      get defaultView() {
        return element;
      },

      get documentElement() {
        return element;
      },

      createElement: function () {
        return element;
      },

      // element
      get ownerDocument() {
        return element;
      },

      addEventListener: function () {},
      removeEventListener: function () {},
      getElementsByTagName: function () {
        return [element];
      },
      getElementById: function () {
        return element;
      },
      parentNode: null,
      offsetParent: null,
      appendChild: function () {},
      removeChild: function () {},
      setAttribute: function () {},
      getAttribute: function () {},
      style: {},
      focus: function () {},
      blur: function () {},
      console: console
    };
    element.parentNode = element;
    element.offsetParent = element;
    this.term = require('term.js')({
      termName: this.termName,
      cols: this.width - this.iwidth,
      rows: this.height - this.iheight,
      context: element,
      document: element,
      body: element,
      parent: element,
      cursorBlink: this.cursorBlink,
      screenKeys: this.screenKeys
    });

    this.term.refresh = function () {
      self.screen.render();
    };

    this.term.keyDown = function () {};

    this.term.keyPress = function () {};

    this.term.open(element); // Emits key sequences in html-land.
    // Technically not necessary here.
    // In reality if we wanted to be neat, we would overwrite the keyDown and
    // keyPress methods with our own node.js-keys->terminal-keys methods, but
    // since all the keys are already coming in as escape sequences, we can just
    // send the input directly to the handler/socket (see below).
    // this.term.on('data', function(data) {
    //   self.handler(data);
    // });
    // Incoming keys and mouse inputs.
    // NOTE: Cannot pass mouse events - coordinates will be off!

    this.screen.program.input.on('data', this._onData = function (data) {
      if (self.screen.focused === self && !self._isMouse(data)) {
        self.handler(data);
      }
    });
    this.onScreenEvent('mouse', function (data) {
      if (self.screen.focused !== self) return;
      if (data.x < self.aleft + self.ileft) return;
      if (data.y < self.atop + self.itop) return;
      if (data.x > self.aleft - self.ileft + self.width) return;
      if (data.y > self.atop - self.itop + self.height) return;

      if (self.term.x10Mouse || self.term.vt200Mouse || self.term.normalMouse || self.term.mouseEvents || self.term.utfMouse || self.term.sgrMouse || self.term.urxvtMouse) ; else {
        return;
      }

      let b = data.raw[0];
      const x = data.x - self.aleft,
            y = data.y - self.atop;
      let s;

      if (self.term.urxvtMouse) {
        if (self.screen.program.sgrMouse) {
          b += 32;
        }

        s = '\x1b[' + b + ';' + (x + 32) + ';' + (y + 32) + 'M';
      } else if (self.term.sgrMouse) {
        if (!self.screen.program.sgrMouse) {
          b -= 32;
        }

        s = '\x1b[<' + b + ';' + x + ';' + y + (data.action === 'mousedown' ? 'M' : 'm');
      } else {
        if (self.screen.program.sgrMouse) {
          b += 32;
        }

        s = '\x1b[M' + String.fromCharCode(b) + String.fromCharCode(x + 32) + String.fromCharCode(y + 32);
      }

      self.handler(s);
    });
    this.on('focus', function () {
      self.term.focus();
    });
    this.on('blur', function () {
      self.term.blur();
    });
    this.term.on('title', function (title) {
      self.title = title;
      self.emit('title', title);
    });
    this.term.on('passthrough', function (data) {
      self.screen.program.flush();

      self.screen.program._owrite(data);
    });
    this.on('resize', function () {
      nextTick(function () {
        self.term.resize(self.width - self.iwidth, self.height - self.iheight);
      });
    });
    this.once('render', function () {
      self.term.resize(self.width - self.iwidth, self.height - self.iheight);
    });
    this.on('destroy', function () {
      self.kill();
      self.screen.program.input.removeListener('data', self._onData);
    });

    if (this.handler) {
      return;
    }

    this.pty = require('pty.js').fork(this.shell, this.args, {
      name: this.termName,
      cols: this.width - this.iwidth,
      rows: this.height - this.iheight,
      cwd: process.env.HOME,
      env: this.options.env || process.env
    });
    this.on('resize', function () {
      nextTick(function () {
        try {
          self.pty.resize(self.width - self.iwidth, self.height - self.iheight);
        } catch (e) {}
      });
    });

    this.handler = function (data) {
      self.pty.write(data);
      self.screen.render();
    };

    this.pty.on('data', function (data) {
      self.write(data);
      self.screen.render();
    });
    this.pty.on('exit', function (code) {
      self.emit('exit', code || null);
    });
    this.onScreenEvent('keypress', function () {
      self.screen.render();
    });

    this.screen._listenKeys(this);
  }

  write(data) {
    return this.term.write(data);
  }

  render() {
    const ret = this._render();

    if (!ret) return;
    this.dattr = this.sattr(this.style);
    const xi = ret.xi + this.ileft,
          xl = ret.xl - this.iright,
          yi = ret.yi + this.itop,
          yl = ret.yl - this.ibottom;
    let cursor;
    const scrollback = this.term.lines.length - (yl - yi);

    for (let y = Math.max(yi, 0); y < yl; y++) {
      const line = this.screen.lines[y];
      if (!line || !this.term.lines[scrollback + y - yi]) break;

      if (y === yi + this.term.y && this.term.cursorState && this.screen.focused === this && (this.term.ydisp === this.term.ybase || this.term.selectMode) && !this.term.cursorHidden) {
        cursor = xi + this.term.x;
      } else {
        cursor = -1;
      }

      for (let x = Math.max(xi, 0); x < xl; x++) {
        if (!line[x] || !this.term.lines[scrollback + y - yi][x - xi]) break;
        line[x][0] = this.term.lines[scrollback + y - yi][x - xi][0];

        if (x === cursor) {
          if (this.cursor === 'line') {
            line[x][0] = this.dattr;
            line[x][1] = '\u2502';
            continue;
          } else if (this.cursor === 'underline') {
            line[x][0] = this.dattr | 2 << 18;
          } else if (this.cursor === 'block' || !this.cursor) {
            line[x][0] = this.dattr | 8 << 18;
          }
        }

        line[x][1] = this.term.lines[scrollback + y - yi][x - xi][1]; // default foreground = 257

        if ((line[x][0] >> 9 & 0x1ff) === 257) {
          line[x][0] &= ~(0x1ff << 9);
          line[x][0] |= (this.dattr >> 9 & 0x1ff) << 9;
        } // default background = 256


        if ((line[x][0] & 0x1ff) === 256) {
          line[x][0] &= ~0x1ff;
          line[x][0] |= this.dattr & 0x1ff;
        }
      }

      line.dirty = true;
    }

    return ret;
  }

  _isMouse(buf) {
    let s = buf;

    if (Buffer.isBuffer(s)) {
      if (s[0] > 127 && s[1] === undefined) {
        s[0] -= 128;
        s = '\x1b' + s.toString('utf-8');
      } else {
        s = s.toString('utf-8');
      }
    }

    return buf[0] === 0x1b && buf[1] === 0x5b && buf[2] === 0x4d || /^\x1b\[M([\x00\u0020-\uffff]{3})/.test(s) || /^\x1b\[(\d+;\d+;\d+)M/.test(s) || /^\x1b\[<(\d+;\d+;\d+)([mM])/.test(s) || /^\x1b\[<(\d+;\d+;\d+;\d+)&w/.test(s) || /^\x1b\[24([0135])~\[(\d+),(\d+)\]\r/.test(s) || /^\x1b\[(O|I)/.test(s);
  }

  scrollTo(offset) {
    this.term.ydisp = offset;
    return this.emit('scroll');
  }

  getScroll() {
    return this.term.ydisp;
  }

  scroll(offset) {
    this.term.scrollDisp(offset);
    return this.emit('scroll');
  }

  resetScroll() {
    this.term.ydisp = 0;
    this.term.ybase = 0;
    return this.emit('scroll');
  }

  getScrollHeight() {
    return this.term.rows - 1;
  }

  getScrollPerc() {
    return this.term.ydisp / this.term.ybase * 100;
  }

  setScrollPerc(i) {
    return this.setScroll(i / 100 * this.term.ybase | 0);
  }

  screenshot(xi, xl, yi, yl) {
    xi = 0 + (xi || 0);

    if (xl != null) {
      xl = 0 + (xl || 0);
    } else {
      xl = this.term.lines[0].length;
    }

    yi = 0 + (yi || 0);

    if (yl != null) {
      yl = 0 + (yl || 0);
    } else {
      yl = this.term.lines.length;
    }

    return this.screen.screenshot(xi, xl, yi, yl, this.term);
  }

  kill() {
    if (this.pty) {
      this.pty.destroy();
      this.pty.kill();
    }

    this.term.refresh = function () {};

    this.term.write('\x1b[H\x1b[J');

    if (this.term._blink) {
      clearInterval(this.term._blink);
    }

    this.term.destroy();
  }

}
/**
 * Expose
 */

module.exports = Terminal;

class Core {
  static get Screen() {
    if (!Core._screen) Core._screen = Screen;
    return Core._screen;
  }

  static get Element() {
    if (!Core._element) Core._element = Element;
    return Core._element;
  }

}

Core._screen = void 0;
Core._element = void 0;

exports.Box = Box;
exports.Element = Element$1;
exports.Layout = Layout;
exports.Line = Line;
exports.Log = Log$1;
exports.Node = Node;
exports.Screen = Screen$1;
exports.ScrollableBox = ScrollableBox;
exports.ScrollableText = ScrollableText;
exports.TUIComponentsCore = Core;
exports.Terminal = Terminal;
