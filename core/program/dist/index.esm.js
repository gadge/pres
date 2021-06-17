import { SIGCONT, SIGTSTP } from '@geia/enum-signals';
import { ESC, BEL, DCS, ST, OSC, CSI, VT, FF, BS, TAB, SO, SI, RN, LF, IND, RI, NEL, RIS, HTS, DECSC, DECRC, DECKPNM } from '@pres/enum-control-chars';
import { DECSCUSR, CUU, CUD, CUF, CUB, CUP, ED, EL, DSR, ICH, CNL, CPL, CHA, IL, DL, DCH, ECH, HPA, HPR, DA, VPA, VPR, HVP, SM, RM, DECSTBM, SCOSC, SCORC, CHT, SU, SD, XTHIMOUSE, XTRMTITLE, CBT, REP, TBC, MC, XTMODKEYS, XTUNMODKEYS, XTSMPOINTER, DECRQM, DECSCL, DECLL, DECSCA, XTRESTORE, DECCARA, XTSAVE, XTWINOPS, DECRARA, XTSMTITLE, DECSWBV, DECSMBV, DECCRA, DECEFR, DECREQTPARM, DECSACE, DECFRA, DECELR, DECERA, DECSLE, DECSERA, DECIC, DECDC, SGR } from '@pres/enum-csi-codes';
import { DATA, WARNING, NEW_LISTENER, KEYPRESS, MOUSE, KEY, RESIZE, EXIT, DESTROY, BTNDOWN, MOUSEDOWN, BTNUP, MOUSEUP, MOVE, MOUSEMOVE, DRAG, MOUSEWHEEL, WHEELUP, WHEELDOWN, ERROR, FOCUS, BLUR, RESPONSE } from '@pres/enum-events';
import { UNDEFINED, ENTER, RETURN, LEFT, RIGHT, MIDDLE, UNKNOWN } from '@pres/enum-key-names';
import { gpmClient } from '@pres/gpm-client';
import { toByte, degrade } from '@pres/util-byte-colors';
import { slice } from '@pres/util-helpers';
import { VO, SP, SC } from '@texting/enum-chars';
import { FUN, NUM, STR } from '@typen/enum-data-types';
import { StringDecoder } from 'string_decoder';
import { keypressEventsEmitter } from '@pres/events';
import { GlobalProgram } from '@pres/global-program';
import { Tput } from '@pres/terminfo-parser';
import cp from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs';
import util from 'util';

var id = 0;

function _classPrivateFieldLooseKey(name) {
  return "__private_" + id++ + "_" + name;
}

function _classPrivateFieldLooseBase(receiver, privateKey) {
  if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {
    throw new TypeError("attempted to use private field on non-instance");
  }

  return receiver;
}

const nullish = x => x === null || x === void 0;

const last = ve => ve[ve.length - 1];

const ALL = 'all';

const whichTerminal = options => {
  const terminal = options.terminal || options.term || process.env.TERM || (process.platform === 'win32' ? 'windows-ansi' : 'xterm');
  return terminal.toLowerCase();
};

const nextTick = global.setImmediate || process.nextTick.bind(process);

var _logger = /*#__PURE__*/_classPrivateFieldLooseKey("logger");

var _terminal = /*#__PURE__*/_classPrivateFieldLooseKey("terminal");

var _log = /*#__PURE__*/_classPrivateFieldLooseKey("log");

var _listenInput = /*#__PURE__*/_classPrivateFieldLooseKey("listenInput");

var _listenOutput = /*#__PURE__*/_classPrivateFieldLooseKey("listenOutput");

class IO extends EventEmitter {
  constructor(options) {
    super(options);
    Object.defineProperty(this, _listenOutput, {
      value: _listenOutput2
    });
    Object.defineProperty(this, _listenInput, {
      value: _listenInput2
    });
    Object.defineProperty(this, _log, {
      value: _log2
    });
    Object.defineProperty(this, _logger, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _terminal, {
      writable: true,
      value: null
    });
    this.configIO(options);
  }

  configIO(options) {
    const self = this; // EventEmitter.call(this)

    if (!options || options.__proto__ !== Object.prototype) {
      const [input, output] = arguments;
      options = {
        input,
        output
      };
    } // IO


    this.options = options;
    this.input = options.input || process.stdin; // IO

    this.output = options.output || process.stdout; // IO

    options.log = options.log || options.dump; // IO - logger

    if (options.log) {
      _classPrivateFieldLooseBase(this, _logger)[_logger] = fs.createWriteStream(options.log);
      if (options.dump) this.setupDump();
    } // IO - logger


    this.zero = options.zero !== false;
    this.useBuffer = options.buffer; // IO

    _classPrivateFieldLooseBase(this, _terminal)[_terminal] = whichTerminal(options); // IO
    // OSX

    this.isOSXTerm = process.env.TERM_PROGRAM === 'Apple_Terminal';
    this.isiTerm2 = process.env.TERM_PROGRAM === 'iTerm.app' || !!process.env.ITERM_SESSION_ID; // VTE
    // NOTE: lxterminal does not provide an env variable to check for.
    // NOTE: gnome-terminal and sakura use a later version of VTE
    // which provides VTE_VERSION as well as supports SGR events.

    this.isXFCE = /xfce/i.test(process.env.COLORTERM);
    this.isTerminator = !!process.env.TERMINATOR_UUID;
    this.isLXDE = false;
    this.isVTE = !!process.env.VTE_VERSION || this.isXFCE || this.isTerminator || this.isLXDE; // xterm and rxvt - not accurate

    this.isRxvt = /rxvt/i.test(process.env.COLORTERM);
    this.isXterm = false;
    this.tmux = !!process.env.TMUX; // IO

    this.tmuxVersion = function () {
      if (!self.tmux) return 2;

      try {
        const version = cp.execFileSync('tmux', ['-V'], {
          encoding: 'utf8'
        });
        return +/^tmux ([\d.]+)/i.exec(version.trim().split('\n')[0])[1];
      } catch (e) {
        return 2;
      }
    }(); // IO


    this._buf = VO; // IO

    this._flush = this.flush.bind(this); // IO

    if (options.tput !== false) this.setupTput(); // IO

    console.log(`>> [program.configIO] [terminal] ${_classPrivateFieldLooseBase(this, _terminal)[_terminal]} [tmux] ${this.tmux}`);
  }

  get terminal() {
    return _classPrivateFieldLooseBase(this, _terminal)[_terminal];
  }

  set terminal(terminal) {
    return this.setTerminal(terminal), this.terminal;
  }

  log() {
    return _classPrivateFieldLooseBase(this, _log)[_log]('LOG', util.format.apply(util, arguments));
  }

  debug() {
    return !this.options.debug ? void 0 : _classPrivateFieldLooseBase(this, _log)[_log]('DEBUG', util.format.apply(util, arguments));
  }

  setupDump() {
    const self = this,
          write = this.output.write,
          decoder = new StringDecoder('utf8');

    function stringify(data) {
      return caret(data.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t')).replace(/[^ -~]/g, ch => {
        if (ch.charCodeAt(0) > 0xff) return ch;
        ch = ch.charCodeAt(0).toString(16);

        if (ch.length > 2) {
          if (ch.length < 4) ch = '0' + ch;
          return `\\u${ch}`;
        }

        if (ch.length < 2) ch = '0' + ch;
        return `\\x${ch}`;
      });
    }

    function caret(data) {
      return data.replace(/[\0\x80\x1b-\x1f\x7f\x01-\x1a]/g, ch => {
        if (ch === '\0' || ch === '\x80') {
          ch = '@';
        } else if (ch === ESC) {
          ch = '[';
        } else if (ch === '\x1c') {
          ch = '\\';
        } else if (ch === '\x1d') {
          ch = ']';
        } else if (ch === '\x1e') {
          ch = '^';
        } else if (ch === '\x1f') {
          ch = '_';
        } else if (ch === '\x7f') {
          ch = '?';
        } else {
          ch = ch.charCodeAt(0); // From ('A' - 64) to ('Z' - 64).

          if (ch >= 1 && ch <= 26) {
            ch = String.fromCharCode(ch + 64);
          } else {
            return String.fromCharCode(ch);
          }
        }

        return `^${ch}`;
      });
    }

    this.input.on(DATA, data => _classPrivateFieldLooseBase(self, _log)[_log]('IN', stringify(decoder.write(data))));

    this.output.write = function (data) {
      _classPrivateFieldLooseBase(self, _log)[_log]('OUT', stringify(data));

      return write.apply(this, arguments);
    };
  }

  setupTput() {
    console.log('>> [io.setupTput]');
    if (this._tputSetup) return;
    this._tputSetup = true;
    const self = this,
          options = this.options,
          write = this.wr.bind(this);
    const tput = this.tput = new Tput({
      terminal: this.terminal,
      padding: options.padding,
      extended: options.extended,
      printf: options.printf,
      termcap: options.termcap,
      forceUnicode: options.forceUnicode
    });
    if (tput.error) nextTick(() => self.emit(WARNING, tput.error.message));
    if (tput.padding) nextTick(() => self.emit(WARNING, 'Terminfo padding has been enabled.'));

    this.put = function () {
      const args = slice(arguments),
            cap = args.shift();
      if (tput[cap]) return this.wr(tput[cap].apply(tput, args));
    };

    Object.keys(tput).forEach(key => {
      if (self[key] == null) self[key] = tput[key];
      if (typeof tput[key] !== FUN) return void (self.put[key] = tput[key]);
      self.put[key] = tput.padding ? function () {
        return tput._print(tput[key].apply(tput, arguments), write);
      } : function () {
        return self.wr(tput[key].apply(tput, arguments));
      };
    });
  }

  setTerminal(terminal) {
    _classPrivateFieldLooseBase(this, _terminal)[_terminal] = terminal.toLowerCase();
    delete this._tputSetup;
    this.setupTput();
  }

  has(name) {
    var _this$tput;

    return ((_this$tput = this.tput) == null ? void 0 : _this$tput.has(name)) ?? false;
  }

  term(is) {
    return this.terminal.indexOf(is) === 0;
  }

  listen() {
    const self = this; // console.log(`>> [this.input._presInput = ${this.input._presInput}]`)
    // Potentially reset window title on exit:
    // if (!this.isRxvt) {
    //   if (!this.isVTE) this.setTitleModeFeature(3);
    //   this.manipulateWindow(21, function(err, data) {
    //     if (err) return;
    //     self._originalTitle = data.text;
    //   });
    // }
    // Listen for keys/mouse on input

    if (!this.input._presInput) {
      this.input._presInput = 1;

      _classPrivateFieldLooseBase(this, _listenInput)[_listenInput]();
    } else {
      this.input._presInput++;
    }

    this.on(NEW_LISTENER, this._newHandler = function fn(type) {
      if (type === KEYPRESS || type === MOUSE) {
        self.removeListener(NEW_LISTENER, fn);

        if (self.input.setRawMode && !self.input.isRaw) {
          self.input.setRawMode(true);
          self.input.resume();
        }
      }
    });
    this.on(NEW_LISTENER, function handler(type) {
      if (type === MOUSE) {
        self.removeListener(NEW_LISTENER, handler), self.bindMouse();
      }
    }); // Listen for resize on output

    if (!this.output._presOutput) {
      this.output._presOutput = 1, _classPrivateFieldLooseBase(this, _listenOutput)[_listenOutput]();
    } else {
      this.output._presOutput++;
    }

    console.log(`>> [program.listen] [ ${this.eventNames()} ]`);
  }

  out(name, ...args) {
    this.ret = true;
    const out = this[name].apply(this, args);
    this.ret = false;
    return out;
  }

  ow(text) {
    if (this.output.writable) this.output.write(text);
  }

  wr(text) {
    return this.ret ? text : this.useBuffer ? this.bf(text) : this.ow(text);
  }

  tw(data) {
    const self = this;
    let iter = 0,
        timer;

    if (this.tmux) {
      // Replace all STs with BELs so they can be nested within the DCS code.
      data = data.replace(/\x1b\\/g, BEL); // Wrap in tmux forward DCS:

      data = DCS + 'tmux;' + ESC + data + ST; // If we've never even flushed yet, it means we're still in
      // the normal buffer. Wait for alt screen buffer.

      if (this.output.bytesWritten === 0) {
        timer = setInterval(() => {
          if (self.output.bytesWritten > 0 || ++iter === 50) {
            clearInterval(timer);
            self.flush();
            self.ow(data);
          }
        }, 100);
        return true;
      } // NOTE: Flushing the buffer is required in some cases.
      // The DCS code must be at the start of the output.


      this.flush(); // Write out raw now that the buffer is flushed.

      return this.ow(data);
    }

    return this.wr(data);
  }

  bf(text) {
    if (this._exiting) return void (this.flush(), this.ow(text));
    if (this._buf) return void (this._buf += text);
    this._buf = text;
    nextTick(this._flush);
    return true;
  }

  print(text, attr) {
    return attr ? this.wr(this.text(text, attr)) : this.wr(text);
  }

  flush() {
    if (!this._buf) return;
    this.ow(this._buf);
    this._buf = VO;
  }

}

function _log2(pre, msg) {
  var _classPrivateFieldLoo;

  return (_classPrivateFieldLoo = _classPrivateFieldLooseBase(this, _logger)[_logger]) == null ? void 0 : _classPrivateFieldLoo.write(pre + ': ' + msg + '\n-\n');
}

function _listenInput2() {
  const self = this;
  setTimeout(() => {}, 3000); // Input

  this.input.on(KEYPRESS, this.input._keypressHandler = (ch, key) => {
    key = key || {
      ch: ch
    }; // A mouse sequence. The `keys` module doesn't understand these.

    if (key.name === UNDEFINED && (key.code === '[M' || key.code === '[I' || key.code === '[O')) return void 0; // Not sure what this is, but we should probably ignore it.

    if (key.name === UNDEFINED) return void 0;
    if (key.name === ENTER && key.sequence === '\n') key.name = 'linefeed';
    if (key.name === RETURN && key.sequence === '\r') self.input.emit(KEYPRESS, ch, merge({}, key, {
      name: ENTER
    }));
    const name = `${key.ctrl ? 'C-' : VO}${key.meta ? 'M-' : VO}${key.shift && key.name ? 'S-' : VO}${key.name || ch}`;
    key.full = name;
    GlobalProgram.instances.forEach(program => {
      if (program.input !== self.input) return void 0;
      program.emit(KEYPRESS, ch, key);
      program.emit(KEY + SP + name, ch, key);
    });
  });
  this.input.on(DATA, this.input._dataHandler = data => GlobalProgram.instances.forEach(program => program.input !== self.input ? void 0 : void program.emit(DATA, data)));
  keypressEventsEmitter(this.input);
  console.log(`>> [program.#listenInput] [ ${this.input.eventNames()} ]`);
}

function _listenOutput2() {
  const self = this;
  if (!this.output.isTTY) nextTick(() => self.emit(WARNING, 'Output is not a TTY')); // Output

  function resize() {
    GlobalProgram.instances.forEach(p => {
      const {
        output
      } = p;
      if (output !== self.output) return void 0;
      p.cols = output.columns;
      p.rows = output.rows;
      p.emit(RESIZE);
    });
  }

  this.output.on(RESIZE, this.output._resizeHandler = () => {
    GlobalProgram.instances.forEach(p => {
      if (p.output !== self.output) return;
      const {
        options: {
          resizeTimeout
        },
        _resizeTimer
      } = p;
      if (!resizeTimeout) return resize();
      if (_resizeTimer) clearTimeout(_resizeTimer), delete p._resizeTimer;
      const time = typeof resizeTimeout === NUM ? resizeTimeout : 300;
      p._resizeTimer = setTimeout(resize, time);
    });
  });
  console.log(`>> [program.#listenOutput] [ ${this.output.eventNames()} ]`);
}

function merge(target) {
  slice.call(arguments, 1).forEach(source => Object.keys(source).forEach(key => target[key] = source[key]));
  return target;
}

/**
 * Program
 */

var _boundResponse = /*#__PURE__*/_classPrivateFieldLooseKey("boundResponse");

var _boundMouse = /*#__PURE__*/_classPrivateFieldLooseKey("boundMouse");

var _bindMouse = /*#__PURE__*/_classPrivateFieldLooseKey("bindMouse");

var _bindResponse = /*#__PURE__*/_classPrivateFieldLooseKey("bindResponse");

var _sgr = /*#__PURE__*/_classPrivateFieldLooseKey("sgr");

var _sgr3 = /*#__PURE__*/_classPrivateFieldLooseKey("sgr256");

class Program extends IO {
  constructor(options = {}) {
    super(options);
    Object.defineProperty(this, _sgr3, {
      value: _sgr4
    });
    Object.defineProperty(this, _sgr, {
      value: _sgr2
    });
    Object.defineProperty(this, _bindResponse, {
      value: _bindResponse2
    });
    Object.defineProperty(this, _bindMouse, {
      value: _bindMouse2
    });
    Object.defineProperty(this, _boundResponse, {
      writable: true,
      value: false
    });
    Object.defineProperty(this, _boundMouse, {
      writable: true,
      value: false
    });
    this.type = 'program';
    this.write = this.ow;
    this._write = this.wr;
    this._owrite = this.ow;
    this._twrite = this.tw;
    this._buffer = this.bf;
    this.echo = this.print;
    this.unkey = this.removeKey;
    this.recoords = this.auto;
    this.cursorReset = this.resetCursor;
    this.bel = this.bell;
    this.ff = this.form;
    this.kbs = this.backspace;
    this.ht = this.tab;
    this.cr = this.return;
    this.nel = this.feed;
    this.newline = this.feed;
    this.ind = this.index;
    this.ri = this.reverseIndex;
    this.reverse = this.reverseIndex;
    this.saveCursor = this.sc;
    this.restoreCursor = this.rc;
    this.lsaveCursor = this.scL;
    this.lrestoreCursor = this.rcL;
    this.enter_alt_charset_mode = this.smacs;
    this.as = this.smacs;
    this.exit_alt_charset_mode = this.rmacs;
    this.ae = this.rmacs;
    this.cursorUp = this.cuu;
    this.up = this.cuu;
    this.cursorDown = this.cud;
    this.down = this.cud;
    this.cursorForward = this.cuf;
    this.right = this.cuf;
    this.forward = this.cuf;
    this.cursorBackward = this.cub;
    this.left = this.cub;
    this.back = this.cub;
    this.cursorPos = this.cup;
    this.pos = this.cup;
    this.eraseInDisplay = this.ed;
    this.eraseInLine = this.el;
    this.charAttr = this.sgr;
    this.attr = this.sgr;
    this.parseAttr = _classPrivateFieldLooseBase(this, _sgr)[_sgr];
    this.setForeground = this.fg;
    this.setBackground = this.bg;
    this.deviceStatus = this.dsr;
    this.insertChars = this.ich;
    this.cursorNextLine = this.cnl;
    this.cursorPrecedingLine = this.cpl;
    this.cursorCharAbsolute = this.cha;
    this.insertLines = this.il;
    this.deleteLines = this.dl;
    this.deleteChars = this.dch;
    this.eraseChars = this.ech;
    this.charPosAbsolute = this.hpa;
    this.HPositionRelative = this.hpr;
    this.sendDeviceAttributes = this.da;
    this.linePosAbsolute = this.vpa;
    this.VPositionRelative = this.vpr;
    this.HVPosition = this.hvp;
    this.setMode = this.sm;
    this.setDecPrivMode = this.decset;
    this.dectcem = this.showCursor;
    this.cnorm = this.showCursor;
    this.cvvis = this.showCursor;
    this.alternate = this.alternateBuffer;
    this.smcup = this.alternateBuffer;
    this.resetMode = this.rm;
    this.resetDecPrivMode = this.decrst;
    this.dectcemh = this.hideCursor;
    this.cursor_invisible = this.hideCursor;
    this.vi = this.hideCursor;
    this.civis = this.hideCursor;
    this.rmcup = this.normalBuffer;
    this.setScrollRegion = this.decstbm;
    this.csr = this.decstbm;
    this.scA = this.scosc;
    this.saveCursorA = this.scosc;
    this.rcA = this.scorc;
    this.restoreCursorA = this.scorc;
    this.cursorForwardTab = this.cht;
    this.scrollUp = this.su;
    this.scrollDown = this.sd;
    this.initMouseTracking = this.xthimouse;
    this.resetTitleModes = this.xtrmtitle;
    this.cursorBackwardTab = this.cbt;
    this.repeatPrecedingCharacter = this.rep;
    this.tabClear = this.tbc;
    this.mediaCopy = this.mc;
    this.print_screen = this.ps;
    this.mc0 = this.ps;
    this.prtr_off = this.pf;
    this.mc4 = this.pf;
    this.prtr_on = this.po;
    this.mc5 = this.po;
    this.prtr_non = this.pO;
    this.mc5p = this.pO;
    this.setResources = this.xtmodkeys;
    this.disableModifiers = this.xtunmodkeys;
    this.setPointerMode = this.xtsmpointer;
    this.decstr = this.softReset;
    this.rs2 = this.softReset;
    this.requestAnsiMode = this.decrqm;
    this.requestPrivateMode = this.decrqmp;
    this.setConformanceLevel = this.decscl;
    this.loadLEDs = this.decll;
    this.setCursorStyle = this.decscusr;
    this.setCharProtectionAttr = this.decsca;
    this.restorePrivateValues = this.xtrestore;
    this.setAttrInRectangle = this.deccara;
    this.savePrivateValues = this.xtsave;
    this.manipulateWindow = this.xtwinops;
    this.reverseAttrInRectangle = this.decrara;
    this.setTitleModeFeature = this.xtsmtitle;
    this.setWarningBellVolume = this.decswbv;
    this.setMarginBellVolume = this.decsmbv;
    this.copyRectangle = this.deccra;
    this.enableFilterRectangle = this.decefr;
    this.requestParameters = this.decreqtparm;
    this.selectChangeExtent = this.decsace;
    this.fillRectangle = this.decfra;
    this.enableLocatorReporting = this.decelr;
    this.eraseRectangle = this.decera;
    this.setLocatorEvents = this.decsle;
    this.selectiveEraseRectangle = this.decsera;
    this.decrqlp = this.requestLocatorPosition;
    this.req_mouse_pos = this.requestLocatorPosition;
    this.reqmp = this.requestLocatorPosition;
    this.insertColumns = this.decic;
    this.deleteColumns = this.decdc;
    GlobalProgram.initialize(this);
    this.configGrid();
    this.listen();
    console.log(`>> [new program]`);
  }

  static build(options) {
    return new Program(options);
  }

  configGrid() {
    this.x = 0;
    this.y = 0;
    this.savedX = 0;
    this.savedY = 0;
    this.cols = this.output.columns || 1;
    this.rows = this.output.rows || 1;
    this.scrollTop = 0;
    this.scrollBottom = this.rows - 1;
    console.log(`>> [program.configGrid] (${this.rows},${this.cols}) [tput.colors] (${this.tput.colors})`);
  }

  get title() {
    return this._title;
  }

  set title(title) {
    return this.setTitle(title), this._title;
  }

  destroy() {
    const index = GlobalProgram.instances.indexOf(this);

    if (~index) {
      GlobalProgram.instances.splice(index, 1);
      GlobalProgram.total--;
      this.flush();
      this._exiting = true;
      GlobalProgram.global = GlobalProgram.instances[0];

      if (GlobalProgram.total === 0) {
        GlobalProgram.global = null;
        process.removeListener(EXIT, GlobalProgram._exitHandler.bind(GlobalProgram));
        delete GlobalProgram._exitHandler.bind(GlobalProgram);
        delete GlobalProgram._bound;
      }

      this.input._presInput--;
      this.output._presOutput--;

      if (this.input._presInput === 0) {
        this.input.removeListener(KEYPRESS, this.input._keypressHandler);
        this.input.removeListener(DATA, this.input._dataHandler);
        delete this.input._keypressHandler;
        delete this.input._dataHandler;

        if (this.input.setRawMode) {
          if (this.input.isRaw) {
            this.input.setRawMode(false);
          }

          if (!this.input.destroyed) {
            this.input.pause();
          }
        }
      }

      if (this.output._presOutput === 0) {
        this.output.removeListener(RESIZE, this.output._resizeHandler);
        delete this.output._resizeHandler;
      }

      this.removeListener(NEW_LISTENER, this._newHandler);
      delete this._newHandler;
      this.destroyed = true;
      this.emit(DESTROY);
    }
  }

  key(key, listener) {
    if (typeof key === STR) key = key.split(/\s*,\s*/);
    key.forEach(function (key) {
      return this.on(KEY + SP + key, listener);
    }, this);
  }

  onceKey(key, listener) {
    if (typeof key === STR) key = key.split(/\s*,\s*/);
    key.forEach(function (key) {
      return this.once(KEY + SP + key, listener);
    }, this);
  }

  removeKey(key, listener) {
    if (typeof key === STR) key = key.split(/\s*,\s*/);
    key.forEach(function (key) {
      return this.removeListener(KEY + SP + key, listener);
    }, this);
  } // XTerm mouse events
  // http://invisible-island.net/xterm/ctlseqs/ctlseqs.html#Mouse%20Tracking
  // To better understand these
  // the xterm code is very helpful:
  // Relevant files:
  //   button.c, charproc.c, misc.c
  // Relevant functions in xterm/button.c:
  //   BtnCode, EmitButtonCode, EditorButton, SendMousePosition
  // send a mouse event:
  // regular/utf8: ^[[M Cb Cx Cy
  // urxvt: ^[[ Cb ; Cx ; Cy M
  // sgr: ^[[ Cb ; Cx ; Cy M/m
  // vt300: ^[[ 24(1/3/5)~ [ Cx , Cy ] \r
  // locator: CSI P e ; P b ; P r ; P c ; P p & w
  // motion example of a left click:
  // ^[[M 3<^[[M@4<^[[M@5<^[[M@6<^[[M@7<^[[M#7<
  // mouseup, mousedown, mousewheel
  // left click: ^[[M 3<^[[M#3<
  // mousewheel up: ^[[M`3>


  bindMouse() {
    if (_classPrivateFieldLooseBase(this, _boundMouse)[_boundMouse]) return;
    _classPrivateFieldLooseBase(this, _boundMouse)[_boundMouse] = true;
    const decoder = new StringDecoder('utf8'),
          self = this;
    this.on(DATA, function (data) {
      const text = decoder.write(data);
      if (!text) return;

      _classPrivateFieldLooseBase(self, _bindMouse)[_bindMouse](text, data);
    });
  }

  // gpm support for linux vc
  enableGpm() {
    const self = this;
    if (this.gpm) return;
    const gpm = this.gpm = gpmClient();
    this.gpm.on(BTNDOWN, (button, modifier, x, y) => {
      x--, y--;
      self.emit(MOUSE, gpm.createKey(MOUSEDOWN, button, modifier, x, y));
    });
    this.gpm.on(BTNUP, (button, modifier, x, y) => {
      x--, y--;
      self.emit(MOUSE, gpm.createKey(MOUSEUP, button, modifier, x, y));
    });
    this.gpm.on(MOVE, (button, modifier, x, y) => {
      x--, y--;
      self.emit(MOUSE, gpm.createKey(MOUSEMOVE, button, modifier, x, y));
    });
    this.gpm.on(DRAG, (button, modifier, x, y) => {
      x--, y--;
      self.emit(MOUSE, gpm.createKey(MOUSEMOVE, button, modifier, x, y));
    });
    this.gpm.on(MOUSEWHEEL, (button, modifier, x, y, dx, dy) => {
      self.emit(MOUSE, gpm.createKey(dy > 0 ? WHEELUP : WHEELDOWN, button, modifier, x, y, dx, dy));
    });
  }

  disableGpm() {
    if (this.gpm) {
      this.gpm.stop(), delete this.gpm;
    }
  } // All possible responses from the terminal


  bindResponse() {
    if (_classPrivateFieldLooseBase(this, _boundResponse)[_boundResponse]) return void 0;
    _classPrivateFieldLooseBase(this, _boundResponse)[_boundResponse] = true;
    const decoder = new StringDecoder('utf8'),
          self = this;
    this.on(DATA, data => {
      if (data = decoder.write(data)) {
        _classPrivateFieldLooseBase(self, _bindResponse)[_bindResponse](data);
      }
    });
  }

  response(name, text, callback, noBypass) {
    const self = this;

    if (arguments.length === 2) {
      callback = text;
      text = name;
      name = null;
    }

    if (!callback) callback = () => {};
    this.bindResponse();
    name = name ? RESPONSE + SP + name : RESPONSE;
    let responseHandler;
    this.once(name, responseHandler = event => {
      if (timeout) clearTimeout(timeout);

      if (event.type === ERROR) {
        return callback(new Error(`${event.event}: ${event.text}`));
      }

      return callback(null, event);
    });
    const timeout = setTimeout(() => {
      self.removeListener(name, responseHandler);
      return callback(new Error('Timeout.'));
    }, 2000);
    return noBypass ? this.wr(text) : this.tw(text);
  }

  auto() {
    this.x < 0 ? this.x = 0 : this.x >= this.cols ? this.x = this.cols - 1 : void 0;
    this.y < 0 ? this.y = 0 : this.y >= this.rows ? this.y = this.rows - 1 : void 0;
  }

  setx(x) {
    return this.cha(x);
  }

  sety(y) {
    return this.vpa(y);
  }

  move(x, y) {
    return this.cup(y, x);
  }

  omove(x, y) {
    const {
      zero
    } = this;
    x = !zero ? (x || 1) - 1 : x || 0;
    y = !zero ? (y || 1) - 1 : y || 0;

    if (y === this.y && x === this.x) {
      return;
    }

    if (y === this.y) {
      x > this.x ? this.cuf(x - this.x) : x < this.x ? this.cub(this.x - x) : void 0;
    } else if (x === this.x) {
      y > this.y ? this.cud(y - this.y) : y < this.y ? this.cuu(this.y - y) : void 0;
    } else {
      if (!zero) x++, y++;
      this.cup(y, x);
    }
  }

  rsetx(x) {
    return !x ? void 0 : x > 0 ? this.forward(x) : this.back(-x);
  }

  rsety(y) {
    return !y ? void 0 : y > 0 ? this.up(y) : this.down(-y);
  } // return this.VPositionRelative(y);


  rmove(x, y) {
    this.rsetx(x), this.rsety(y);
  }

  simpleInsert(ch, i, attr) {
    return this.wr(this.repeat(ch, i), attr);
  }

  repeat(ch, i) {
    if (!i || i < 0) i = 0;
    return Array(i + 1).join(ch);
  } // Specific to iTerm2, but I think it's really cool.
  // Example:
  //  if (!screen.copyToClipboard(text)) {
  //    execClipboardProgram(text);
  //  }


  copyToClipboard(text) {
    return this.isiTerm2 ? (this.tw(OSC + `50;CopyToCliboard=${text}` + BEL), true) : false;
  } // Only XTerm and iTerm2. If you know of any others, post them.


  cursorShape(shape, blink) {
    if (this.isiTerm2) {
      switch (shape) {
        case 'block':
          if (!blink) {
            this.tw(OSC + '50;CursorShape=0;BlinkingCursorEnabled=0' + BEL);
          } else {
            this.tw(OSC + '50;CursorShape=0;BlinkingCursorEnabled=1' + BEL);
          }

          break;

        case 'underline':
          // !blink ? this.#writeTm('\x1b]50' + ';CursorShape=n;BlinkingCursorEnabled=0' + BEL) : this.#writeTm('\x1b]50' + ';CursorShape=n;BlinkingCursorEnabled=1' + BEL)
          break;

        case 'line':
          !blink ? this.tw(OSC + '50;CursorShape=1;BlinkingCursorEnabled=0' + BEL) : this.tw(OSC + '50' + ';CursorShape=1;BlinkingCursorEnabled=1' + BEL);
          break;
      }

      return true;
    } else if (this.term('xterm') || this.term('screen')) {
      switch (shape) {
        case 'block':
          !blink ? this.tw(CSI + '0' + DECSCUSR) : this.tw(CSI + '1' + DECSCUSR);
          break;

        case 'underline':
          !blink ? this.tw(CSI + '2' + DECSCUSR) : this.tw(CSI + '3' + DECSCUSR);
          break;

        case 'line':
          !blink ? this.tw(CSI + '4' + DECSCUSR) : this.tw(CSI + '5' + DECSCUSR);
          break;
      }

      return true;
    }

    return false;
  }

  cursorColor(color) {
    return this.term('xterm') || this.term('rxvt') || this.term('screen') ? (this.tw(OSC + `12;${color}` + BEL), true) : false;
  }

  resetCursor() {
    if (this.term('xterm') || this.term('rxvt') || this.term('screen')) {
      // XXX
      // return this.resetColors();
      this.tw(CSI + '0' + DECSCUSR);
      this.tw(OSC + '112' + BEL); // urxvt doesnt support OSC 112

      this.tw(OSC + '12;white' + BEL);
      return true;
    }

    return false;
  }

  getTextParams(arg, callback) {
    return this.response('text-params', OSC + arg + SC + '?' + BEL, (err, data) => err ? callback(err) : callback(null, data.pt));
  }

  getCursorColor(callback) {
    return this.getTextParams(12, callback);
  }
  /**
   * Normal
   */


  nul() {
    return this.wr('\x80');
  }

  bell() {
    return this.has('bel') ? this.put.bel() : this.wr(BEL);
  }

  vtab() {
    this.y++;
    this.auto();
    return this.wr(VT);
  }

  form() {
    return this.has('ff') ? this.put.ff() : this.wr(FF);
  }

  backspace() {
    this.x--;
    this.auto();
    return this.has('kbs') ? this.put.kbs() : this.wr(BS);
  }

  tab() {
    this.x += 8;
    this.auto();
    return this.has('ht') ? this.put.ht() : this.wr(TAB);
  }

  shiftOut() {
    return this.wr(SO);
  }

  shiftIn() {
    return this.wr(SI);
  }

  return() {
    this.x = 0;
    if (this.has('cr')) return this.put.cr();
    return this.wr(RN);
  }

  feed() {
    if (this.tput && this.tput.bools.eat_newline_glitch && this.x >= this.cols) return;
    this.x = 0;
    this.y++;
    this.auto();
    return this.has('nel') ? this.put.nel() : this.wr(LF);
  }
  /**
   * Esc
   */


  index() {
    this.y++;
    this.auto();
    return this.tput ? this.put.ind() : this.wr(IND);
  }

  reverseIndex() {
    this.y--;
    this.auto();
    return this.tput ? this.put.ri() : this.wr(RI);
  }

  nextLine() {
    this.y++;
    this.x = 0;
    this.auto();
    return this.has('nel') ? this.put.nel() : this.wr(NEL);
  }

  reset() {
    this.x = this.y = 0;
    return this.has('rs1') || this.has('ris') ? this.has('rs1') ? this.put.rs1() : this.put.ris() : this.wr(RIS);
  }

  tabSet() {
    return this.tput ? this.put.hts() : this.wr(HTS);
  }

  sc(key) {
    if (key) return this.scL(key);
    this.savedX = this.x || 0;
    this.savedY = this.y || 0;
    if (this.tput) return this.put.sc();
    return this.wr(DECSC);
  }

  rc(key, hide) {
    if (key) return this.rcL(key, hide);
    this.x = this.savedX || 0;
    this.y = this.savedY || 0;
    if (this.tput) return this.put.rc();
    return this.wr(DECRC);
  } // Save Cursor Locally


  scL(key) {
    key = key || 'local';
    this._saved = this._saved || {};
    this._saved[key] = this._saved[key] || {};
    this._saved[key].x = this.x;
    this._saved[key].y = this.y;
    this._saved[key].hidden = this.cursorHidden;
  } // Restore Cursor Locally


  rcL(key, hide) {
    let pos;
    key = key || 'local';
    if (!this._saved || !this._saved[key]) return;
    pos = this._saved[key]; //delete this._saved[key];

    this.cup(pos.y, pos.x);
    if (hide && pos.hidden !== this.cursorHidden) pos.hidden ? this.hideCursor() : this.showCursor();
  } // ESC # 3 DEC line height/width


  lineHeight() {
    return this.wr(ESC + '#');
  } // ESC (,),*,+,-,. Designate G0-G2 Character Set.


  charset(val, level) {
    const name = typeof val === STR ? val.toLowerCase() : val;

    switch (name) {
      case 'acs':
      case 'scld':
        // DEC Special Character and Line Drawing Set.
        if (this.tput) return this.put.smacs();
        val = '0';
        break;

      case 'uk':
        // UK
        val = 'A';
        break;

      case 'us': // United States (USASCII).

      case 'usascii':
      case 'ascii':
        if (this.tput) return this.put.rmacs();
        val = 'B';
        break;

      case 'dutch':
        // Dutch
        val = '4';
        break;

      case 'finnish':
        // Finnish
        val = 'C';
        val = '5';
        break;

      case 'french':
        // French
        val = 'R';
        break;

      case 'frenchcanadian':
        // FrenchCanadian
        val = 'Q';
        break;

      case 'german':
        // German
        val = 'K';
        break;

      case 'italian':
        // Italian
        val = 'Y';
        break;

      case 'norwegiandanish':
        // NorwegianDanish
        val = 'E';
        val = '6';
        break;

      case 'spanish':
        // Spanish
        val = 'Z';
        break;

      case 'swedish':
        // Swedish
        val = 'H';
        val = '7';
        break;

      case 'swiss':
        // Swiss
        val = '=';
        break;

      case 'isolatin':
        // ISOLatin (actually /A)
        val = '/A';
        break;

      default:
        // Default
        if (this.tput) return this.put.rmacs();
        val = 'B';
        break;
    }

    return this.wr(ESC + '(' + val);
  }

  smacs() {
    return this.charset('acs');
  }

  rmacs() {
    return this.charset('ascii');
  } // Invoke the G1 Character Set as GR (LS1R).


  setG(val) {
    // if (this.tput) return this.put.S2();
    // if (this.tput) return this.put.S3();
    switch (val) {
      case 1:
        val = '~'; // GR

        break;

      case 2:
        val = 'n'; // GL

        val = '}'; // GR

        val = 'N'; // Next Char Only

        break;

      case 3:
        val = 'o'; // GL

        val = '|'; // GR

        val = 'O'; // Next Char Only

        break;
    }

    return this.wr(ESC + val);
  }
  /**
   * OSC
   */


  setTitle(title) {
    this._title = title; // if (this.term('screen')) {
    //   // Tmux pane
    //   // if (this.tmux) {
    //   //   return this.wr(OSC + '2;' + title + '\x1b\\');
    //   // }
    //   return this.wr('\x1bk' + title + '\x1b\\');
    // }

    return this.tw(OSC + `0;${title}` + BEL);
  }

  resetColors(arg) {
    return this.has('Cr') ? this.put.Cr(arg) : this.tw(OSC + '112' + BEL);
  } // Change dynamic colors


  dynamicColors(arg) {
    return this.has('Cs') ? this.put.Cs(arg) : this.tw(OSC + `12;${arg}` + BEL);
  } // Sel data


  selData(a, b) {
    return this.has('Ms') ? this.put.Ms(a, b) : this.tw(OSC + `52;${a};${b}` + BEL);
  }
  /**
   * CSI
   */


  cuu(n) {
    this.y -= n || 1;
    this.auto();
    return !this.tput ? this.wr(CSI + (n || VO) + CUU) : !this.tput.strings.parm_up_cursor ? this.wr(this.repeat(this.tput.cuu1(), n)) : this.put.cuu(n);
  }

  cud(n) {
    this.y += n || 1;
    this.auto();
    return !this.tput ? this.wr(CSI + (n || VO) + CUD) : !this.tput.strings.parm_down_cursor ? this.wr(this.repeat(this.tput.cud1(), n)) : this.put.cud(n);
  }

  cuf(n) {
    this.x += n || 1;
    this.auto();
    return !this.tput ? this.wr(CSI + (n || VO) + CUF) : !this.tput.strings.parm_right_cursor ? this.wr(this.repeat(this.tput.cuf1(), n)) : this.put.cuf(n);
  }

  cub(n) {
    this.x -= n || 1;
    this.auto();
    return !this.tput ? this.wr(CSI + (n || VO) + CUB) : !this.tput.strings.parm_left_cursor ? this.wr(this.repeat(this.tput.cub1(), n)) : this.put.cub(n);
  } // XTerm mouse events
  // http://invisible-island.net/xterm/ctlseqs/ctlseqs.html#Mouse%20Tracking
  // To better understand these
  // the xterm code is very helpful:
  // Relevant files:
  //   button.c, charproc.c, misc.c
  // Relevant functions in xterm/button.c:
  //   BtnCode, EmitButtonCode, EditorButton, SendMousePosition
  // send a mouse event:
  // regular/utf8: ^[[M Cb Cx Cy
  // urxvt: ^[[ Cb ; Cx ; Cy M
  // sgr: ^[[ Cb ; Cx ; Cy M/m
  // vt300: ^[[ 24(1/3/5)~ [ Cx , Cy ] \r
  // locator: CSI P e ; P b ; P r ; P c ; P p & w
  // motion example of a left click:
  // ^[[M 3<^[[M@4<^[[M@5<^[[M@6<^[[M@7<^[[M#7<
  // mouseup, mousedown, mousewheel
  // Cursor Position [row;column] (default = [1,1]) (CUP).


  cup(r, c) {
    const {
      zero
    } = this;
    this.x = c = !zero ? (c || 1) - 1 : c || 0;
    this.y = r = !zero ? (r || 1) - 1 : r || 0;
    this.auto();
    return this.tput ? this.put.cup(r, c) : this.wr(CSI + `${r + 1};${c + 1}` + CUP);
  }

  ed(p) {
    return this.tput ? this.put.ed(p === 'above' ? 1 : p === 'all' ? 2 : p === 'saved' ? 3 : p === 'below' ? 0 : 0) : this.wr(CSI + (p === 'above' ? 1 : p === 'all' ? 2 : p === 'saved' ? 3 : p === 'below' ? VO : VO) + ED);
  }

  clear() {
    this.x = 0;
    this.y = 0;
    return this.tput ? this.put.clear() : this.wr(CSI + CUP + CSI + ED);
  }

  el(p) {
    return this.tput ? this.put.el(p === LEFT ? 1 : p === ALL ? 2 : p === RIGHT ? 0 : 0) : this.wr(CSI + (p === LEFT ? 1 : p === ALL ? 2 : p === RIGHT ? VO : VO) + EL);
  }

  sgr(arg, val) {
    return this.wr(_classPrivateFieldLooseBase(this, _sgr)[_sgr](arg, val));
  }

  text(text, attr) {
    return _classPrivateFieldLooseBase(this, _sgr)[_sgr](attr, true) + text + _classPrivateFieldLooseBase(this, _sgr)[_sgr](attr, false);
  }

  fg(color, val) {
    return this.sgr(color.split(/\s*[,;]\s*/).join(' fg, ') + ' fg', val);
  }

  bg(color, val) {
    return this.sgr(color.split(/\s*[,;]\s*/).join(' bg, ') + ' bg', val);
  }

  dsr(arg, callback, dec, noBypass) {
    return dec ? this.response('device-status', CSI + '?' + (arg || '0') + DSR, callback, noBypass) : this.response('device-status', CSI + (arg || '0') + DSR, callback, noBypass);
  }

  getCursor(callback) {
    return this.deviceStatus(6, callback, false, true);
  }

  saveReportedCursor(callback) {
    const self = this;
    return this.tput.strings.user7 === CSI + '6n' || this.term('screen') ? this.getCursor((err, data) => {
      if (data) {
        self._rx = data.status.x, self._ry = data.status.y;
      }

      return callback ? callback(err) : void 0;
    }) : callback ? callback() : void 0;
  }

  restoreReportedCursor() {
    return nullish(this._rx) ? void 0 : this.cup(this._ry, this._rx);
  }
  /**
   * Additions
   */


  ich(arg) {
    this.x += arg || 1;
    this.auto();
    if (this.tput) return this.put.ich(arg);
    return this.wr(CSI + (arg || 1) + ICH);
  }

  cnl(arg) {
    this.y += arg || 1;
    this.auto();
    return this.wr(CSI + (arg || VO) + CNL);
  }

  cpl(arg) {
    this.y -= arg || 1;
    this.auto();
    return this.wr(CSI + (arg || VO) + CPL);
  }

  cha(arg) {
    arg = !this.zero ? (arg || 1) - 1 : arg || 0;
    this.x = arg;
    this.y = 0;
    this.auto();
    if (this.tput) return this.put.hpa(arg);
    return this.wr(CSI + (arg + 1) + CHA);
  }

  il(arg) {
    return this.tput ? this.put.il(arg) : this.wr(CSI + (arg || VO) + IL);
  }

  dl(arg) {
    return this.tput ? this.put.dl(arg) : this.wr(CSI + (arg || VO) + DL);
  }

  dch(arg) {
    return this.tput ? this.put.dch(arg) : this.wr(CSI + (arg || VO) + DCH);
  }

  ech(arg) {
    return this.tput ? this.put.ech(arg) : this.wr(CSI + (arg || VO) + ECH);
  }

  // Character Position Absolute [column] (default = [row,1]) (HPA).
  hpa(arg) {
    this.x = arg || 0;
    this.auto();

    if (this.tput) {
      return this.put.hpa.apply(this.put, arguments);
    }

    arg = slice(arguments).join(SC);
    return this.wr(CSI + (arg || VO) + HPA);
  }

  // Character Position Relative [columns] (default = [row,col+1]) (HPR).
  hpr(arg) {
    if (this.tput) return this.cuf(arg);
    this.x += arg || 1;
    this.auto(); // Does not exist:
    // if (this.tput) return this.put.hpr(arg);

    return this.wr(CSI + (arg || VO) + HPR);
  }

  da(arg, callback) {
    return this.response('device-attributes', CSI + (arg || VO) + DA, callback);
  }

  vpa(arg) {
    this.y = arg || 1;
    this.auto();
    if (this.tput) return this.put.vpa.apply(this.put, arguments);
    arg = slice(arguments).join(SC);
    return this.wr(CSI + (arg || VO) + VPA);
  }

  vpr(arg) {
    if (this.tput) return this.cud(arg);
    this.y += arg || 1;
    this.auto(); // Does not exist:
    // if (this.tput) return this.put.vpr(arg);

    return this.wr(CSI + (arg || VO) + VPR);
  }

  hvp(row, col) {
    if (!this.zero) {
      row = (row || 1) - 1;
      col = (col || 1) - 1;
    } else {
      row = row || 0;
      col = col || 0;
    }

    this.y = row;
    this.x = col;
    this.auto(); // Does not exist (?):
    // if (this.tput) return this.put.hvp(row, col);

    if (this.tput) return this.put.cup(row, col);
    return this.wr(CSI + `${row + 1};${col + 1}` + HVP);
  }

  sm(...args) {
    return this.wr(CSI + args.join(SC) + SM);
  }

  decset(...args) {
    return this.sm('?' + args.join(SC));
  }

  showCursor() {
    this.cursorHidden = false; // NOTE: In xterm terminfo:
    // cnorm stops blinking cursor
    // cvvis starts blinking cursor

    if (this.tput) return this.put.cnorm(); //if (this.tput) return this.put.cvvis();
    // return this.wr(CSI + '?12l\x1b[?25h'); // cursor_normal
    // return this.wr(CSI + '?12;25h'); // cursor_visible

    return this.setMode('?25');
  }

  alternateBuffer() {
    this.isAlt = true;
    if (this.tput) return this.put.smcup();
    if (this.term('vt') || this.term('linux')) return;
    this.setMode('?47');
    return this.setMode('?1049');
  }

  rm(...args) {
    return this.wr(CSI + args.join(SC) + RM);
  }

  decrst(...args) {
    return this.rm('?' + args.join(SC));
  }

  hideCursor() {
    this.cursorHidden = true;
    if (this.tput) return this.put.civis();
    return this.resetMode('?25');
  }

  normalBuffer() {
    this.isAlt = false;
    if (this.tput) return this.put.rmcup();
    this.resetMode('?47');
    return this.resetMode('?1049');
  }

  enableMouse() {
    if (process.env.BLESSED_FORCE_MODES) {
      const modes = process.env.BLESSED_FORCE_MODES.split(',');
      const options = {};

      for (let n = 0; n < modes.length; ++n) {
        const pair = modes[n].split('=');
        const v = pair[1] !== '0';
        const k = pair[0].toUpperCase();
        k === 'SGRMOUSE' ? options.sgrMouse = v : k === 'UTFMOUSE' ? options.utfMouse = v : k === 'VT200MOUSE' ? options.vt200Mouse = v : k === 'URXVTMOUSE' ? options.urxvtMouse = v : k === 'X10MOUSE' ? options.x10Mouse = v : k === 'DECMOUSE' ? options.decMouse = v : k === 'PTERMMOUSE' ? options.ptermMouse = v : k === 'JSBTERMMOUSE' ? options.jsbtermMouse = v : k === 'VT200HILITE' ? options.vt200Hilite = v : k === 'GPMMOUSE' ? options.gpmMouse = v : k === 'CELLMOTION' ? options.cellMotion = v : k === 'ALLMOTION' ? options.allMotion = v : k === 'SENDFOCUS' ? options.sendFocus = v : void 0;
      }

      return this.setMouse(options, true);
    } // NOTE:
    // Cell Motion isn't normally need for anything below here, but we'll
    // activate it for tmux (whether using it or not) in case our all-motion
    // passthrough does not work. It can't hurt.


    if (this.term('rxvt-unicode')) return this.setMouse({
      urxvtMouse: true,
      cellMotion: true,
      allMotion: true
    }, true); // rxvt does not support the X10 UTF extensions

    if (this.term('rxvt')) return this.setMouse({
      vt200Mouse: true,
      x10Mouse: true,
      cellMotion: true,
      allMotion: true
    }, true); // libvte is broken. Older versions do not support the
    // X10 UTF extension. However, later versions do support
    // SGR/URXVT.

    if (this.isVTE) return this.setMouse({
      sgrMouse: true,
      cellMotion: true,
      allMotion: true
    }, true);
    if (this.term('linux')) return this.setMouse({
      vt200Mouse: true,
      gpmMouse: true
    }, true);
    if (this.term('xterm') || this.term('screen') || this.tput && this.tput.strings.key_mouse) return this.setMouse({
      vt200Mouse: true,
      utfMouse: true,
      cellMotion: true,
      allMotion: true
    }, true);
  } // CSI ? Ps$ p
  //   Request DEC private mode (DECRQM).  For VT300 and up, reply is
  //     CSI ? Ps; Pm$ p
  //   where Ps is the mode number as in DECSET, Pm is the mode value


  disableMouse() {
    if (!this._currentMouse) return;
    const o = {};
    Object.keys(this._currentMouse).forEach(key => o[key] = false);
    return this.setMouse(o, false);
  } // Set Mouse


  setMouse(opt, enable) {
    if (opt.normalMouse != null) {
      opt.vt200Mouse = opt.normalMouse, opt.allMotion = opt.normalMouse;
    }

    if (opt.hiliteTracking != null) {
      opt.vt200Hilite = opt.hiliteTracking;
    }

    if (enable === true) {
      if (this._currentMouse) {
        this.setMouse(opt);
        Object.keys(opt).forEach(function (key) {
          this._currentMouse[key] = opt[key];
        }, this);
        return;
      }

      this._currentMouse = opt;
      this.mouseEnabled = true;
    } else if (enable === false) {
      delete this._currentMouse, this.mouseEnabled = false;
    } //     Ps = 9  -> Send Mouse X & Y on button press.  See the section Mouse Tracking.
    //     Ps = 9  -> Don't send Mouse X & Y on button press.
    // x10 mouse


    if (opt.x10Mouse != null) {
      opt.x10Mouse ? this.setMode('?9') : this.resetMode('?9');
    } //     Ps = 1 0 0 0  -> Send Mouse X & Y on button press and release.  See the section Mouse Tracking.
    //     Ps = 1 0 0 0  -> Don't send Mouse X & Y on button press and release.  See the section Mouse Tracking.
    // vt200 mouse


    if (opt.vt200Mouse != null) {
      opt.vt200Mouse ? this.setMode('?1000') : this.resetMode('?1000');
    } //     Ps = 1 0 0 1  -> Use Hilite Mouse Tracking.
    //     Ps = 1 0 0 1  -> Don't use Hilite Mouse Tracking.


    if (opt.vt200Hilite != null) {
      opt.vt200Hilite ? this.setMode('?1001') : this.resetMode('?1001');
    } //     Ps = 1 0 0 2  -> Use Cell Motion Mouse Tracking.
    //     Ps = 1 0 0 2  -> Don't use Cell Motion Mouse Tracking.
    // button event mouse


    if (opt.cellMotion != null) {
      opt.cellMotion ? this.setMode('?1002') : this.resetMode('?1002');
    } //     Ps = 1 0 0 3  -> Use All Motion Mouse Tracking.
    //     Ps = 1 0 0 3  -> Don't use All Motion Mouse Tracking.
    // any event mouse


    if (opt.allMotion != null) {
      // NOTE: Latest versions of tmux seem to only support cellMotion (not
      // allMotion). We pass all motion through to the terminal.
      if (this.tmux && this.tmuxVersion >= 2) {
        opt.allMotion ? this.tw(CSI + '?1003h') : this.tw(CSI + '?1003l');
      } else {
        opt.allMotion ? this.setMode('?1003') : this.resetMode('?1003');
      }
    } //     Ps = 1 0 0 4  -> Send FocusIn/FocusOut events.
    //     Ps = 1 0 0 4  -> Don't send FocusIn/FocusOut events.


    if (opt.sendFocus != null) {
      opt.sendFocus ? this.setMode('?1004') : this.resetMode('?1004');
    } //     Ps = 1 0 0 5  -> Enable Extended Mouse Mode.
    //     Ps = 1 0 0 5  -> Disable Extended Mouse Mode.


    if (opt.utfMouse != null) {
      opt.utfMouse ? this.setMode('?1005') : this.resetMode('?1005');
    } // sgr mouse


    if (opt.sgrMouse != null) {
      opt.sgrMouse ? this.setMode('?1006') : this.resetMode('?1006');
    } // urxvt mouse


    if (opt.urxvtMouse != null) {
      opt.urxvtMouse ? this.setMode('?1015') : this.resetMode('?1015');
    } // dec mouse


    if (opt.decMouse != null) {
      opt.decMouse ? this.wr(CSI + '1;2\'z' + CSI + '1;3\'{') : this.wr(CSI + '\'z');
    } // pterm mouse


    if (opt.ptermMouse != null) {
      // + = advanced mode
      opt.ptermMouse ? this.wr(CSI + '>1h' + CSI + '>6h' + CSI + '>7h' + CSI + '>1h' + CSI + '>9l') : this.wr(CSI + '>1l' + CSI + '>6l' + CSI + '>7l' + CSI + '>1l' + CSI + '>9h');
    } // jsbterm mouse


    if (opt.jsbtermMouse != null) {
      opt.jsbtermMouse ? this.wr(CSI + '0~ZwLMRK+1Q' + ST) : this.wr(CSI + '0~ZwQ' + ST);
    } // gpm mouse


    if (opt.gpmMouse != null) {
      opt.gpmMouse ? this.enableGpm() : this.disableGpm();
    }
  }

  decstbm(top, bottom) {
    if (!this.zero) {
      top = (top || 1) - 1;
      bottom = (bottom || this.rows) - 1;
    } else {
      top = top || 0;
      bottom = bottom || this.rows - 1;
    }

    this.scrollTop = top;
    this.scrollBottom = bottom;
    this.x = 0;
    this.y = 0;
    this.auto();
    if (this.tput) return this.put.csr(top, bottom);
    return this.wr(CSI + `${top + 1};${bottom + 1}` + DECSTBM);
  }

  scosc() {
    this.savedX = this.x;
    this.savedY = this.y;
    if (this.tput) return this.put.sc();
    return this.wr(CSI + SCOSC);
  }

  scorc() {
    this.x = this.savedX || 0;
    this.y = this.savedY || 0;
    if (this.tput) return this.put.rc();
    return this.wr(CSI + SCORC);
  }

  cht(arg) {
    this.x += 8;
    this.auto();
    if (this.tput) return this.put.tab(arg);
    return this.wr(CSI + (arg || 1) + CHT);
  }

  su(arg) {
    this.y -= arg || 1;
    this.auto();
    if (this.tput) return this.put.parm_index(arg);
    return this.wr(CSI + (arg || 1) + SU);
  }

  sd(arg) {
    this.y += arg || 1;
    this.auto();
    if (this.tput) return this.put.parm_rindex(arg);
    return this.wr(CSI + (arg || 1) + SD);
  }

  xthimouse(...args) {
    return this.wr(CSI + args.join(SC) + XTHIMOUSE);
  }

  xtrmtitle(...args) {
    return this.wr(CSI + '>' + args.join(SC) + XTRMTITLE);
  }

  cbt(arg) {
    this.x -= 8;
    this.auto();
    if (this.tput) return this.put.cbt(arg);
    return this.wr(CSI + (arg || 1) + CBT);
  }

  rep(arg) {
    this.x += arg || 1;
    this.auto();
    if (this.tput) return this.put.rep(arg);
    return this.wr(CSI + (arg || 1) + REP);
  }

  tbc(arg) {
    return this.tput ? this.put.tbc(arg) : this.wr(CSI + (arg || 0) + TBC);
  }

  mc(...args) {
    return this.wr(CSI + args.join(SC) + MC);
  }

  ps() {
    return this.tput ? this.put.mc0() : this.mc('0');
  }

  pf() {
    return this.tput ? this.put.mc4() : this.mc('4');
  }

  po() {
    return this.tput ? this.put.mc5() : this.mc('5');
  }

  pO() {
    return this.tput ? this.put.mc5p() : this.mc('?5');
  }

  // Set/reset key modifier options (XTMODKEYS), xterm.
  xtmodkeys(...args) {
    return this.wr(CSI + '>' + args.join(SC) + XTMODKEYS);
  }

  // Disable key modifier options, xterm.
  xtunmodkeys(arg) {
    return this.wr(CSI + '>' + (arg || VO) + XTUNMODKEYS);
  }

  // Set resource value pointerMode (XTSMPOINTER), xterm.
  xtsmpointer(arg) {
    return this.wr(CSI + '>' + (arg || VO) + XTSMPOINTER);
  }

  softReset() {
    //if (this.tput) return this.put.init_2string();
    //if (this.tput) return this.put.reset_2string();
    if (this.tput) return this.put.rs2(); //return this.wr(CSI + '!p');
    //return this.wr(CSI + '!p\x1b[?3;4l\x1b[4l\x1b>'); // init

    return this.wr(CSI + '!p' + CSI + '?3;4l' + CSI + '4l' + DECKPNM); // reset
  }

  decrqm(arg) {
    return this.wr(CSI + (arg || VO) + DECRQM);
  }

  decrqmp(arg = '') {
    return this.wr(CSI + '?' + arg + DECRQM);
  }

  decscl(...args) {
    return this.wr(CSI + args.join(SC) + DECSCL);
  }

  decll(arg = '') {
    return this.wr(CSI + arg + DECLL);
  }

  decscusr(p) {
    p = p === 'blinking block' ? 1 : p === 'block' || p === 'steady block' ? 2 : p === 'blinking underline' ? 3 : p === 'underline' || p === 'steady underline' ? 4 : p === 'blinking bar' ? 5 : p === 'bar' || p === 'steady bar' ? 6 : p;
    if (p === 2 && this.has('Se')) return this.put.Se();
    if (this.has('Ss')) return this.put.Ss(p);
    return this.wr(CSI + (p || 1) + DECSCUSR);
  }

  // Select character protection attribute (DECSCA), VT220.
  decsca(arg) {
    return this.wr(CSI + (arg || 0) + DECSCA);
  }

  xtrestore(...args) {
    return this.wr(CSI + '?' + args.join(SC) + XTRESTORE);
  }

  // Change Attributes in Rectangular Area (DECCARA), VT400 and up.
  deccara(...args) {
    return this.wr(CSI + args.join(SC) + DECCARA);
  }

  xtsave(...args) {
    return this.wr(CSI + '?' + args.join(SC) + XTSAVE);
  }

  xtwinops(...args) {
    const callback = typeof last(args) === FUN ? args.pop() : function () {};
    return this.response('window-manipulation', CSI + args.join(SC) + XTWINOPS, callback);
  }

  getWindowSize(callback) {
    return this.manipulateWindow(18, callback);
  }

  decrara(...args) {
    return this.wr(CSI + args.join(SC) + DECRARA);
  }

  xtsmtitle(...args) {
    return this.tw(CSI + '>' + args.join(SC) + XTSMTITLE);
  }

  decswbv(arg) {
    return this.wr(CSI + (arg || VO) + DECSWBV);
  }

  decsmbv(arg) {
    return this.wr(CSI + (arg || VO) + DECSMBV);
  }

  deccra(...args) {
    return this.wr(CSI + args.join(SC) + DECCRA);
  }

  decefr(...args) {
    return this.wr(CSI + args.join(SC) + DECEFR);
  }

  decreqtparm(arg = 0) {
    return this.wr(CSI + arg + DECREQTPARM);
  } // TODO: pull request - changed x to *x


  decsace(arg = 0) {
    return this.wr(CSI + arg + DECSACE);
  }

  decfra(...args) {
    return this.wr(CSI + args.join(SC) + DECFRA);
  }

  decelr(...args) {
    return this.wr(CSI + args.join(SC) + DECELR);
  }

  decera(...args) {
    return this.wr(CSI + args.join(SC) + DECERA);
  }

  decsle(...args) {
    return this.wr(CSI + args.join(SC) + DECSLE);
  }

  decsera(...args) {
    return this.wr(CSI + args.join(SC) + DECSERA);
  }

  requestLocatorPosition(arg = VO, callback) {
    // See also:
    // get_mouse / getm / Gm
    // mouse_info / minfo / Mi
    // Correct for tput?
    if (this.has('req_mouse_pos')) {
      const code = this.tput.req_mouse_pos(arg);
      return this.response('locator-position', code, callback);
    }

    return this.response('locator-position', CSI + arg + '\'|', callback);
  } // TODO: pull request since modified from ' }' to '\'}'


  // Insert Ps Column(s) (default = 1) (DECIC), VT420 and up.
  decic(...args) {
    return this.wr(CSI + args.join(SC) + DECIC);
  } // TODO: pull request since modified from ' ~' to '\'~'


  // Delete Ps Column(s) (default = 1) (DECDC), VT420 and up.
  decdc(...args) {
    return this.wr(CSI + args.join(SC) + DECDC);
  }

  sigtstp(callback) {
    const resume = this.pause();
    process.once(SIGCONT, () => {
      resume(), callback ? callback() : undefined;
    });
    process.kill(process.pid, SIGTSTP);
  }

  pause(callback) {
    const self = this,
          isAlt = this.isAlt,
          mouseEnabled = this.mouseEnabled;
    this.scL('pause'); //this.csr(0, screen.height - 1);

    if (isAlt) this.normalBuffer();
    this.showCursor();
    if (mouseEnabled) this.disableMouse();
    const write = this.output.write;

    this.output.write = function () {};

    if (this.input.setRawMode) this.input.setRawMode(false);
    this.input.pause();
    return this._resume = function () {
      delete self._resume;
      if (self.input.setRawMode) self.input.setRawMode(true);
      self.input.resume();
      self.output.write = write;
      if (isAlt) self.alternateBuffer(); //self.csr(0, screen.height - 1);

      if (mouseEnabled) self.enableMouse();
      self.rcL('pause', true);
      if (callback) callback();
    };
  }

  resume() {
    if (this._resume) return this._resume();
  }

}
/**
 * Helpers
 */

function _bindMouse2(s, buf) {
  const self = this;
  let key, parts, b, x, y, mod, params, down, page, button;
  key = {
    name: undefined,
    ctrl: false,
    meta: false,
    shift: false
  };

  if (Buffer.isBuffer(s)) {
    if (s[0] > 127 && s[1] === undefined) {
      s[0] -= 128;
      s = ESC + s.toString('utf-8');
    } else {
      s = s.toString('utf-8');
    }
  } // if (this.8bit) {
  //   s = s.replace(/\233/g, CSI);
  //   buf = new Buffer(s, 'utf8');
  // }
  // XTerm / X10 for buggy VTE
  // VTE can only send unsigned chars and no unicode for coords. This limits
  // them to 0xff. However, normally the x10 protocol does not allow a byte
  // under 0x20, but since VTE can have the bytes overflow, we can consider
  // bytes below 0x20 to be up to 0xff + 0x20. This gives a limit of 287. Since
  // characters ranging from 223 to 248 confuse javascript's utf parser, we
  // need to parse the raw binary. We can detect whether the terminal is using
  // a bugged VTE version by examining the coordinates and seeing whether they
  // are a value they would never otherwise be with a properly implemented x10
  // protocol. This method of detecting VTE is only 99% reliable because we
  // can't check if the coords are 0x00 (255) since that is a valid x10 coord
  // technically.


  const bx = s.charCodeAt(4);
  const by = s.charCodeAt(5);

  if (buf[0] === 0x1b && buf[1] === 0x5b && buf[2] === 0x4d && (this.isVTE || bx >= 65533 || by >= 65533 || bx > 0x00 && bx < 0x20 || by > 0x00 && by < 0x20 || buf[4] > 223 && buf[4] < 248 && buf.length === 6 || buf[5] > 223 && buf[5] < 248 && buf.length === 6)) {
    b = buf[3];
    x = buf[4];
    y = buf[5]; // unsigned char overflow.

    if (x < 0x20) x += 0xff;
    if (y < 0x20) y += 0xff; // Convert the coordinates into a
    // properly formatted x10 utf8 sequence.

    s = CSI + `M${String.fromCharCode(b)}${String.fromCharCode(x)}${String.fromCharCode(y)}`;
  } // XTerm / X10


  if (parts = /^\x1b\[M([\x00\u0020-\uffff]{3})/.exec(s)) {
    b = parts[1].charCodeAt(0);
    x = parts[1].charCodeAt(1);
    y = parts[1].charCodeAt(2);
    key.name = MOUSE;
    key.type = 'X10';
    key.raw = [b, x, y, parts[0]];
    key.buf = buf;
    key.x = x - 32;
    key.y = y - 32;
    if (this.zero) key.x--, key.y--;
    if (x === 0) key.x = 255;
    if (y === 0) key.y = 255;
    mod = b >> 2;
    key.shift = !!(mod & 1);
    key.meta = !!(mod >> 1 & 1);
    key.ctrl = !!(mod >> 2 & 1);
    b -= 32;

    if (b >> 6 & 1) {
      key.action = b & 1 ? WHEELDOWN : WHEELUP;
      key.button = MIDDLE;
    } else if (b === 3) {
      // NOTE: x10 and urxvt have no way
      // of telling which button mouseup used.
      key.action = MOUSEUP;
      key.button = this._lastButton || UNKNOWN;
      delete this._lastButton;
    } else {
      key.action = MOUSEDOWN;
      button = b & 3;
      key.button = button === 0 ? LEFT : button === 1 ? MIDDLE : button === 2 ? RIGHT : UNKNOWN;
      this._lastButton = key.button;
    } // Probably a movement.
    // The *newer* VTE gets mouse movements comepletely wrong.
    // This presents a problem: older versions of VTE that get it right might
    // be confused by the second conditional in the if statement.
    // NOTE: Possibly just switch back to the if statement below.
    // none, shift, ctrl, alt
    // gnome: 32, 36, 48, 40
    // xterm: 35, _, 51, _
    // urxvt: 35, _, _, _
    // if (key.action === MOUSEDOWN && key.button === UNKNOWN) {


    if (b === 35 || b === 39 || b === 51 || b === 43 || this.isVTE && (b === 32 || b === 36 || b === 48 || b === 40)) {
      delete key.button;
      key.action = MOUSEMOVE;
    }

    self.emit(MOUSE, key);
    return;
  } // URxvt


  if (parts = /^\x1b\[(\d+;\d+;\d+)M/.exec(s)) {
    params = parts[1].split(SC);
    b = +params[0];
    x = +params[1];
    y = +params[2];
    key.name = MOUSE;
    key.type = 'urxvt';
    key.raw = [b, x, y, parts[0]];
    key.buf = buf;
    key.x = x;
    key.y = y;
    if (this.zero) key.x--, key.y--;
    mod = b >> 2;
    key.shift = !!(mod & 1);
    key.meta = !!(mod >> 1 & 1);
    key.ctrl = !!(mod >> 2 & 1); // XXX Bug in urxvt after wheelup/down on mousemove
    // NOTE: This may be different than 128/129 depending
    // on mod keys.

    if (b === 128 || b === 129) b = 67;
    b -= 32;

    if (b >> 6 & 1) {
      key.action = b & 1 ? WHEELDOWN : WHEELUP;
      key.button = MIDDLE;
    } else if (b === 3) {
      // NOTE: x10 and urxvt have no way
      // of telling which button mouseup used.
      key.action = MOUSEUP;
      key.button = this._lastButton || UNKNOWN;
      delete this._lastButton;
    } else {
      key.action = MOUSEDOWN;
      button = b & 3;
      key.button = button === 0 ? LEFT : button === 1 ? MIDDLE : button === 2 ? RIGHT : UNKNOWN; // NOTE: 0/32 = mousemove, 32/64 = mousemove with left down
      // if ((b >> 1) === 32)

      this._lastButton = key.button;
    } // Probably a movement.
    // The *newer* VTE gets mouse movements comepletely wrong.
    // This presents a problem: older versions of VTE that get it right might
    // be confused by the second conditional in the if statement.
    // NOTE: Possibly just switch back to the if statement below.
    // none, shift, ctrl, alt
    // urxvt: 35, _, _, _
    // gnome: 32, 36, 48, 40
    // if (key.action === MOUSEDOWN && key.button === UNKNOWN) {


    if (b === 35 || b === 39 || b === 51 || b === 43 || this.isVTE && (b === 32 || b === 36 || b === 48 || b === 40)) {
      delete key.button;
      key.action = MOUSEMOVE;
    }

    self.emit(MOUSE, key);
    return;
  } // SGR


  if (parts = /^\x1b\[<(\d+;\d+;\d+)([mM])/.exec(s)) {
    down = parts[2] === 'M';
    params = parts[1].split(SC);
    b = +params[0];
    x = +params[1];
    y = +params[2];
    key.name = MOUSE;
    key.type = 'sgr';
    key.raw = [b, x, y, parts[0]];
    key.buf = buf;
    key.x = x;
    key.y = y;
    if (this.zero) key.x--, key.y--;
    mod = b >> 2;
    key.shift = !!(mod & 1);
    key.meta = !!(mod >> 1 & 1);
    key.ctrl = !!(mod >> 2 & 1);

    if (b >> 6 & 1) {
      key.action = b & 1 ? WHEELDOWN : WHEELUP;
      key.button = MIDDLE;
    } else {
      key.action = down ? MOUSEDOWN : MOUSEUP;
      button = b & 3;
      key.button = button === 0 ? LEFT : button === 1 ? MIDDLE : button === 2 ? RIGHT : UNKNOWN;
    } // Probably a movement.
    // The *newer* VTE gets mouse movements comepletely wrong.
    // This presents a problem: older versions of VTE that get it right might
    // be confused by the second conditional in the if statement.
    // NOTE: Possibly just switch back to the if statement below.
    // none, shift, ctrl, alt
    // xterm: 35, _, 51, _
    // gnome: 32, 36, 48, 40
    // if (key.action === MOUSEDOWN && key.button === UNKNOWN) {


    if (b === 35 || b === 39 || b === 51 || b === 43 || this.isVTE && (b === 32 || b === 36 || b === 48 || b === 40)) {
      delete key.button;
      key.action = MOUSEMOVE;
    }

    self.emit(MOUSE, key);
    return;
  } // DEC
  // The xterm mouse documentation says there is a
  // `<` prefix, the DECRQLP says there is no prefix.


  if (parts = /^\x1b\[<(\d+;\d+;\d+;\d+)&w/.exec(s)) {
    params = parts[1].split(SC);
    b = +params[0];
    x = +params[1];
    y = +params[2];
    page = +params[3];
    key.name = MOUSE;
    key.type = 'dec';
    key.raw = [b, x, y, parts[0]];
    key.buf = buf;
    key.x = x;
    key.y = y;
    key.page = page;
    if (this.zero) key.x--, key.y--;
    key.action = b === 3 ? MOUSEUP : MOUSEDOWN;
    key.button = b === 2 ? LEFT : b === 4 ? MIDDLE : b === 6 ? RIGHT : UNKNOWN;
    self.emit(MOUSE, key);
    return;
  } // vt300


  if (parts = /^\x1b\[24([0135])~\[(\d+),(\d+)\]\r/.exec(s)) {
    b = +parts[1];
    x = +parts[2];
    y = +parts[3];
    key.name = MOUSE;
    key.type = 'vt300';
    key.raw = [b, x, y, parts[0]];
    key.buf = buf;
    key.x = x;
    key.y = y;
    if (this.zero) key.x--, key.y--;
    key.action = MOUSEDOWN;
    key.button = b === 1 ? LEFT : b === 2 ? MIDDLE : b === 5 ? RIGHT : UNKNOWN;
    self.emit(MOUSE, key);
    return;
  }

  if (parts = /^\x1b\[(O|I)/.exec(s)) {
    key.action = parts[1] === 'I' ? FOCUS : BLUR;
    self.emit(MOUSE, key);
    self.emit(key.action);
  }
}

function _bindResponse2(s) {
  const out = {};
  let parts;

  if (Buffer.isBuffer(s)) {
    if (s[0] > 127 && nullish(s[1])) {
      s[0] -= 128, s = ESC + s.toString('utf-8');
    } else {
      s = s.toString('utf-8');
    }
  } // CSI P s c
  // Send Device Attributes (Primary DA).
  // CSI > P s c
  // Send Device Attributes (Secondary DA).


  if (parts = /^\x1b\[(\?|>)(\d*(?:;\d*)*)c/.exec(s)) {
    parts = parts[2].split(SC).map(ch => +ch || 0);
    out.event = 'device-attributes';
    out.code = 'DA';

    if (parts[1] === '?') {
      out.type = 'primary-attribute'; // VT100-style params:

      if (parts[0] === 1 && parts[2] === 2) {
        out.term = 'vt100', out.advancedVideo = true;
      } else if (parts[0] === 1 && parts[2] === 0) {
        out.term = 'vt101';
      } else if (parts[0] === 6) {
        out.term = 'vt102';
      } else if (parts[0] === 60 && parts[1] === 1 && parts[2] === 2 && parts[3] === 6 && parts[4] === 8 && parts[5] === 9 && parts[6] === 15) {
        out.term = 'vt220';
      } else {
        // VT200-style params:
        parts.forEach(attr => attr === 1 ? out.cols132 = true : attr === 2 ? out.printer = true : attr === 6 ? out.selectiveErase = true : attr === 8 ? out.userDefinedKeys = true : attr === 9 ? out.nationalReplacementCharsets = true : attr === 15 ? out.technicalCharacters = true : attr === 18 ? out.userWindows = true : attr === 21 ? out.horizontalScrolling = true : attr === 22 ? out.ansiColor = true : attr === 29 ? out.ansiTextLocator = true : void 0);
      }
    } else {
      out.type = 'secondary-attribute';
      out.term = parts[0] === 0 ? 'vt100' : parts[0] === 1 ? 'vt220' : parts[0] === 2 ? 'vt240' : parts[0] === 18 ? 'vt330' : parts[0] === 19 ? 'vt340' : parts[0] === 24 ? 'vt320' : parts[0] === 41 ? 'vt420' : parts[0] === 61 ? 'vt510' : parts[0] === 64 ? 'vt520' : parts[0] === 65 ? 'vt525' : out.term;
      out.firmwareVersion = parts[1];
      out.romCartridgeRegistrationNumber = parts[2];
    } // LEGACY


    out.deviceAttributes = out;
    this.emit(RESPONSE, out);
    this.emit(RESPONSE + SP + out.event, out);
    return void 0;
  } // CSI Ps n  Device Status Report (DSR).
  //     Ps = 5  -> Status Report.  Result (``OK'') is
  //   CSI 0 n
  // CSI ? Ps n
  //   Device Status Report (DSR, DEC-specific).
  //     Ps = 1 5  -> Report Printer status as CSI ? 1 0  n  (ready).
  //     or CSI ? 1 1  n  (not ready).
  //     Ps = 2 5  -> Report UDK status as CSI ? 2 0  n  (unlocked)
  //     or CSI ? 2 1  n  (locked).
  //     Ps = 2 6  -> Report Keyboard status as
  //   CSI ? 2 7  ;  1  ;  0  ;  0  n  (North American).
  //   The last two parameters apply to VT400 & up, and denote key-
  //   board ready and LK01 respectively.
  //     Ps = 5 3  -> Report Locator status as
  //   CSI ? 5 3  n  Locator available, if compiled-in, or
  //   CSI ? 5 0  n  No Locator, if not.


  if (parts = /^\x1b\[(\?)?(\d+)(?:;(\d+);(\d+);(\d+))?n/.exec(s)) {
    out.event = 'device-status';
    out.code = 'DSR';

    if (!parts[1] && parts[2] === '0' && !parts[3]) {
      out.type = 'device-status';
      out.status = 'OK'; // LEGACY

      out.deviceStatus = out.status;
      this.emit(RESPONSE, out);
      this.emit(RESPONSE + SP + out.event, out);
      return;
    }

    if (parts[1] && (parts[2] === '10' || parts[2] === '11') && !parts[3]) {
      out.type = 'printer-status';
      out.status = parts[2] === '10' ? 'ready' : 'not ready'; // LEGACY

      out.printerStatus = out.status;
      this.emit(RESPONSE, out);
      this.emit(RESPONSE + SP + out.event, out);
      return;
    }

    if (parts[1] && (parts[2] === '20' || parts[2] === '21') && !parts[3]) {
      out.type = 'udk-status';
      out.status = parts[2] === '20' ? 'unlocked' : 'locked'; // LEGACY

      out.UDKStatus = out.status;
      this.emit(RESPONSE, out);
      this.emit(RESPONSE + SP + out.event, out);
      return;
    }

    if (parts[1] && parts[2] === '27' && parts[3] === '1' && parts[4] === '0' && parts[5] === '0') {
      out.type = 'keyboard-status';
      out.status = 'OK'; // LEGACY

      out.keyboardStatus = out.status;
      this.emit(RESPONSE, out);
      this.emit(RESPONSE + SP + out.event, out);
      return;
    }

    if (parts[1] && (parts[2] === '53' || parts[2] === '50') && !parts[3]) {
      out.type = 'locator-status';
      out.status = parts[2] === '53' ? 'available' : 'unavailable'; // LEGACY

      out.locator = out.status;
      this.emit(RESPONSE, out);
      this.emit(RESPONSE + SP + out.event, out);
      return;
    }

    out.type = 'error';
    out.text = `Unhandled: ${JSON.stringify(parts)}`; // LEGACY

    out.error = out.text;
    this.emit(RESPONSE, out);
    this.emit(RESPONSE + SP + out.event, out);
    return;
  } // CSI Ps n  Device Status Report (DSR).
  //     Ps = 6  -> Report Cursor Position (CPR) [row;column].
  //   Result is
  //   CSI r ; c R
  // CSI ? Ps n
  //   Device Status Report (DSR, DEC-specific).
  //     Ps = 6  -> Report Cursor Position (CPR) [row;column] as CSI
  //     ? r ; c R (assumes page is zero).


  if (parts = /^\x1b\[(\?)?(\d+);(\d+)R/.exec(s)) {
    out.event = 'device-status';
    out.code = 'DSR';
    out.type = 'cursor-status';
    out.status = {
      x: +parts[3],
      y: +parts[2],
      page: !parts[1] ? undefined : 0
    };
    out.x = out.status.x;
    out.y = out.status.y;
    out.page = out.status.page; // LEGACY

    out.cursor = out.status;
    this.emit(RESPONSE, out);
    this.emit(RESPONSE + SP + out.event, out);
    return;
  } // CSI Ps ; Ps ; Ps t
  //   Window manipulation (from dtterm, as well as extensions).
  //   These controls may be disabled using the allowWindowOps
  //   resource.  Valid values for the first (and any additional
  //   parameters) are:
  //     Ps = 1 1  -> Report xterm window state.  If the xterm window
  //     is open (non-iconified), it returns CSI 1 t .  If the xterm
  //     window is iconified, it returns CSI 2 t .
  //     Ps = 1 3  -> Report xterm window position.  Result is CSI 3
  //     ; x ; y t
  //     Ps = 1 4  -> Report xterm window in pixels.  Result is CSI
  //     4  ;  height ;  width t
  //     Ps = 1 8  -> Report the size of the text area in characters.
  //     Result is CSI  8  ;  height ;  width t
  //     Ps = 1 9  -> Report the size of the screen in characters.
  //     Result is CSI  9  ;  height ;  width t


  if (parts = /^\x1b\[(\d+)(?:;(\d+);(\d+))?t/.exec(s)) {
    out.event = 'window-manipulation';
    out.code = VO;

    if ((parts[1] === '1' || parts[1] === '2') && !parts[2]) {
      out.type = 'window-state';
      out.state = parts[1] === '1' ? 'non-iconified' : 'iconified'; // LEGACY

      out.windowState = out.state;
      this.emit(RESPONSE, out);
      this.emit(RESPONSE + SP + out.event, out);
      return;
    }

    if (parts[1] === '3' && parts[2]) {
      out.type = 'window-position';
      out.position = {
        x: +parts[2],
        y: +parts[3]
      };
      out.x = out.position.x;
      out.y = out.position.y; // LEGACY

      out.windowPosition = out.position;
      this.emit(RESPONSE, out);
      this.emit(RESPONSE + SP + out.event, out);
      return;
    }

    if (parts[1] === '4' && parts[2]) {
      out.type = 'window-size-pixels';
      out.size = {
        height: +parts[2],
        width: +parts[3]
      };
      out.height = out.size.height;
      out.width = out.size.width; // LEGACY

      out.windowSizePixels = out.size;
      this.emit(RESPONSE, out);
      this.emit(RESPONSE + SP + out.event, out);
      return;
    }

    if (parts[1] === '8' && parts[2]) {
      out.type = 'textarea-size';
      out.size = {
        height: +parts[2],
        width: +parts[3]
      };
      out.height = out.size.height;
      out.width = out.size.width; // LEGACY

      out.textAreaSizeCharacters = out.size;
      this.emit(RESPONSE, out);
      this.emit(RESPONSE + SP + out.event, out);
      return;
    }

    if (parts[1] === '9' && parts[2]) {
      out.type = 'screen-size';
      out.size = {
        height: +parts[2],
        width: +parts[3]
      };
      out.height = out.size.height;
      out.width = out.size.width; // LEGACY

      out.screenSizeCharacters = out.size;
      this.emit(RESPONSE, out);
      this.emit(RESPONSE + SP + out.event, out);
      return;
    }

    out.type = 'error';
    out.text = `Unhandled: ${JSON.stringify(parts)}`; // LEGACY

    out.error = out.text;
    this.emit(RESPONSE, out);
    this.emit(RESPONSE + SP + out.event, out);
    return;
  } // rxvt-unicode does not support window manipulation
  //   Result Normal: OSC l/L 0xEF 0xBF 0xBD
  //   Result ASCII: OSC l/L 0x1c (file separator)
  //   Result UTF8->ASCII: OSC l/L 0xFD
  // Test with:
  //   echo -ne '\ePtmux;\e\e[>3t\e\\'
  //   sleep 2 && echo -ne '\ePtmux;\e\e[21t\e\\' & cat -v
  //   -
  //   echo -ne '\e[>3t'
  //   sleep 2 && echo -ne '\e[21t' & cat -v


  if (parts = /^\x1b\](l|L)([^\x07\x1b]*)$/.exec(s)) {
    parts[2] = 'rxvt';
    s = OSC + parts[1] + parts[2] + ST;
  } // CSI Ps ; Ps ; Ps t
  //   Window manipulation (from dtterm, as well as extensions).
  //   These controls may be disabled using the allowWindowOps
  //   resource.  Valid values for the first (and any additional
  //   parameters) are:
  //     Ps = 2 0  -> Report xterm window's icon label.  Result is
  //     OSC  L  label ST
  //     Ps = 2 1  -> Report xterm window's title.  Result is OSC  l
  //     label ST


  if (parts = /^\x1b\](l|L)([^\x07\x1b]*)(?:\x07|\x1b\\)/.exec(s)) {
    out.event = 'window-manipulation';
    out.code = VO;

    if (parts[1] === 'L') {
      out.type = 'window-icon-label';
      out.text = parts[2]; // LEGACY

      out.windowIconLabel = out.text;
      this.emit(RESPONSE, out);
      this.emit(RESPONSE + SP + out.event, out);
      return;
    }

    if (parts[1] === 'l') {
      out.type = 'window-title';
      out.text = parts[2]; // LEGACY

      out.windowTitle = out.text;
      this.emit(RESPONSE, out);
      this.emit(RESPONSE + SP + out.event, out);
      return;
    }

    out.type = 'error';
    out.text = `Unhandled: ${JSON.stringify(parts)}`; // LEGACY

    out.error = out.text;
    this.emit(RESPONSE, out);
    this.emit(RESPONSE + SP + out.event, out);
    return;
  }

  if (parts = /^\x1b\[(\d+(?:;\d+){4})&w/.exec(s)) {
    parts = parts[1].split(SC).map(ch => +ch);
    out.event = 'locator-position';
    out.code = 'DECRQLP';
    out.status = parts[0] === 0 ? 'locator-unavailable' : parts[0] === 1 ? 'request' : parts[0] === 2 ? 'left-button-down' : parts[0] === 3 ? 'left-button-up' : parts[0] === 4 ? 'middle-button-down' : parts[0] === 5 ? 'middle-button-up' : parts[0] === 6 ? 'right-button-down' : parts[0] === 7 ? 'right-button-up' : parts[0] === 8 ? 'm4-button-down' : parts[0] === 9 ? 'm4-button-up' : parts[0] === 10 ? 'locator-outside' : out.status;
    out.mask = parts[1];
    out.row = parts[2];
    out.col = parts[3];
    out.page = parts[4]; // LEGACY

    out.locatorPosition = out;
    this.emit(RESPONSE, out);
    this.emit(RESPONSE + SP + out.event, out);
    return;
  } // OSC Ps ; Pt BEL
  // OSC Ps ; Pt ST
  // Set Text Parameters


  if (parts = /^\x1b\](\d+);([^\x07\x1b]+)(?:\x07|\x1b\\)/.exec(s)) {
    out.event = 'text-params';
    out.code = 'Set Text Parameters';
    out.ps = +s[1];
    out.pt = s[2];
    this.emit(RESPONSE, out);
    this.emit(RESPONSE + SP + out.event, out);
  }
}

function _sgr2(params, grain = true) {
  // console.log('>> [program.#sgr]', params, grain)
  const self = this;
  let arg,
      parts = Array.isArray(params) ? (arg = params[0] || 'normal', params) : (arg = params || 'normal').split(/\s*[,;]\s*/);

  if (parts.length > 1) {
    const used = {},
          accum = [];
    parts.forEach(el => {
      if ((el = _classPrivateFieldLooseBase(self, _sgr)[_sgr](el, grain).slice(2, -1)) && el !== VO && !used[el]) {
        used[el] = true, accum.push(el);
      }
    });
    return CSI + accum.join(SC) + SGR;
  }

  grain = arg.startsWith('no ') && (arg = arg.slice(3)) ? false : arg.startsWith('!') && (arg = arg.slice(1)) ? false : grain;

  if (arg === 'normal') {
    return grain ? CSI + SGR : VO;
  }

  if (arg === 'bold') {
    return CSI + (grain ? '1' : '22') + SGR;
  }

  if (arg === 'ul' || arg === 'underline' || arg === 'underlined') {
    return CSI + (grain ? '4' : '24') + SGR;
  }

  if (arg === 'blink') {
    return CSI + (grain ? '5' : '25') + SGR;
  }

  if (arg === 'inverse') {
    return CSI + (grain ? '7' : '27') + SGR;
  }

  if (arg === 'invisible') {
    return CSI + (grain ? '8' : '28') + SGR;
  }

  if (arg.startsWith('default')) {
    if (arg.endsWith('fg bg')) {
      return grain ? CSI + (this.term('rxvt') ? '100' : '39;49') + SGR : VO;
    }

    if (arg.endsWith('fg')) {
      return grain ? CSI + '39' + SGR : VO;
    }

    if (arg.endsWith('bg')) {
      return grain ? CSI + '49' + SGR : VO;
    }

    return grain ? CSI + SGR : VO;
  }

  if (arg.endsWith('fg')) {
    // 8-color foreground
    if (arg.startsWith('black')) {
      return CSI + (grain ? '30' : '39') + SGR;
    }

    if (arg.startsWith('red')) {
      return CSI + (grain ? '31' : '39') + SGR;
    }

    if (arg.startsWith('green')) {
      return CSI + (grain ? '32' : '39') + SGR;
    }

    if (arg.startsWith('yellow')) {
      return CSI + (grain ? '33' : '39') + SGR;
    }

    if (arg.startsWith('blue')) {
      return CSI + (grain ? '34' : '39') + SGR;
    }

    if (arg.startsWith('magenta')) {
      return CSI + (grain ? '35' : '39') + SGR;
    }

    if (arg.startsWith('cyan')) {
      return CSI + (grain ? '36' : '39') + SGR;
    }

    if (arg.startsWith('white')) {
      return CSI + (grain ? '37' : '39') + SGR;
    }

    if (arg.startsWith('grey') || arg.startsWith('gray')) {
      return CSI + (grain ? '90' : '39') + SGR;
    } // 16-color foreground


    if (arg.startsWith('light') || arg.startsWith('bright')) {
      if (arg.includes('black')) {
        return CSI + (grain ? '90' : '39') + SGR;
      }

      if (arg.includes('red')) {
        return CSI + (grain ? '91' : '39') + SGR;
      }

      if (arg.includes('green')) {
        return CSI + (grain ? '92' : '39') + SGR;
      }

      if (arg.includes('yellow')) {
        return CSI + (grain ? '93' : '39') + SGR;
      }

      if (arg.includes('blue')) {
        return CSI + (grain ? '94' : '39') + SGR;
      }

      if (arg.includes('magenta')) {
        return CSI + (grain ? '95' : '39') + SGR;
      }

      if (arg.includes('cyan')) {
        return CSI + (grain ? '96' : '39') + SGR;
      }

      if (arg.includes('white')) {
        return CSI + (grain ? '97' : '39') + SGR;
      }

      if (arg.includes('grey') || arg.includes('gray')) {
        return CSI + (grain ? '37' : '39') + SGR;
      }
    }
  }

  if (arg.endsWith('bg')) {
    // 8-color background
    if (arg.startsWith('black')) {
      return CSI + (grain ? '40' : '49') + SGR;
    }

    if (arg.startsWith('red')) {
      return CSI + (grain ? '41' : '49') + SGR;
    }

    if (arg.startsWith('green')) {
      return CSI + (grain ? '42' : '49') + SGR;
    }

    if (arg.startsWith('yellow')) {
      return CSI + (grain ? '43' : '49') + SGR;
    }

    if (arg.startsWith('blue')) {
      return CSI + (grain ? '44' : '49') + SGR;
    }

    if (arg.startsWith('magenta')) {
      return CSI + (grain ? '45' : '49') + SGR;
    }

    if (arg.startsWith('cyan')) {
      return CSI + (grain ? '46' : '49') + SGR;
    }

    if (arg.startsWith('white')) {
      return CSI + (grain ? '47' : '49') + SGR;
    }

    if (arg.startsWith('grey') || arg.startsWith('gray')) {
      return CSI + (grain ? '100' : '49') + SGR;
    } // 16-color background


    if (arg.startsWith('light') || arg.startsWith('bright')) {
      if (arg.includes('black')) {
        return CSI + (grain ? '100' : '49') + SGR;
      }

      if (arg.includes('red')) {
        return CSI + (grain ? '101' : '49') + SGR;
      }

      if (arg.includes('green')) {
        return CSI + (grain ? '102' : '49') + SGR;
      }

      if (arg.includes('yellow')) {
        return CSI + (grain ? '103' : '49') + SGR;
      }

      if (arg.includes('blue')) {
        return CSI + (grain ? '104' : '49') + SGR;
      }

      if (arg.includes('magenta')) {
        return CSI + (grain ? '105' : '49') + SGR;
      }

      if (arg.includes('cyan')) {
        return CSI + (grain ? '106' : '49') + SGR;
      }

      if (arg.includes('white')) {
        return CSI + (grain ? '107' : '49') + SGR;
      }

      if (arg.includes('grey') || arg.includes('gray')) {
        return CSI + (grain ? '47' : '49') + SGR;
      }
    }
  } // 256-color fg and bg


  return _classPrivateFieldLooseBase(this, _sgr3)[_sgr3](arg, grain);
}

function _sgr4(arg, grain) {
  if (arg[0] === '#') arg = arg.replace(/#(?:[0-9a-f]{3}){1,2}/i, toByte); // console.log('program.#sgr256', temp, 'to', arg)

  let matches, byte, scope;

  if ((matches = /^(-?\d+) (fg|bg)$/.exec(arg)) && ([, byte, scope] = matches)) {
    var _this$tput;

    if (!grain || (byte = +byte) === 0x1ff) {
      return _classPrivateFieldLooseBase(this, _sgr)[_sgr](`default ${scope}`);
    }

    byte = degrade(byte, this.tput.colors);

    if (byte < 16 || ((_this$tput = this.tput) == null ? void 0 : _this$tput.colors) <= 16) {
      if (scope === 'fg') {
        byte < 8 ? byte += 30 : byte < 16 ? (byte -= 8, byte += 90) : void 0;
      } else if (scope === 'bg') {
        byte < 8 ? byte += 40 : byte < 16 ? (byte -= 8, byte += 100) : void 0;
      }

      return CSI + byte + SGR;
    }

    if (scope === 'fg') return CSI + `38;5;${byte}` + SGR;
    if (scope === 'bg') return CSI + `48;5;${byte}` + SGR;
  }

  return /^[\d;]*$/.test(arg) ? CSI + arg + SGR : null;
}

export { Program };
