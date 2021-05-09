/**
 * tput.js - parse and compile terminfo caps to javascript.
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

// Resources:
//   $ man term
//   $ man terminfo
//   http://invisible-island.net/ncurses/man/term.5.html
//   https://en.wikipedia.org/wiki/Terminfo

// Todo:
// - xterm's XT (set-title capability?) value should
//   be true (at least tmux thinks it should).
//   It's not parsed as true. Investigate.
// - Possibly switch to other method of finding the
//   extended data string table: i += h.symOffsetCount * 2;

import * as alias                                                       from '@pres/enum-terminfo-alias'
import { merge, slice }                                                 from '@pres/util-helpers'
import { BOO, FUN, NUM, STR }                                           from '@typen/enum-data-types'
import assert                                                           from 'assert'
import cp                                                               from 'child_process'
import fs                                                               from 'fs'
import path                                                             from 'path'
import { ACSC, BOOLS, CPATHS, IPATHS, NUMBERS, STRINGS, TERMCAP, UTOA } from '../assets'
import { noop, sprintf, tryRead, write }                                from './helpers'

const SCOPES = [ 'bools', 'numbers', 'strings' ]
const HEADERS = [ 'name', 'names', 'desc', 'file', 'termcap' ]
const USR = __dirname + '/../usr/'
/**
 * Terminfo
 */
/**
 * Tput
 */
export class Tput {
  constructor(options = {}) {
    if (!(this instanceof Tput)) return new Tput(options)
    if (typeof options === STR) options = { terminal: options }
    this.options = options
    this.terminal = options.terminal || options.term || process.env.TERM || (process.platform === 'win32' ? 'windows-ansi' : 'xterm')
    this.terminal = this.terminal.toLowerCase()
    this.debug = options.debug
    this.padding = options.padding
    this.extended = options.extended
    this.printf = options.printf
    this.termcap = options.termcap
    this.error = null
    this.terminfoPrefix = options.terminfoPrefix
    this.terminfoFile = options.terminfoFile
    this.termcapFile = options.termcapFile
    if (options.terminal || options.term) this.setup()
    // Convert ACS unicode characters to the
    // most similar-looking ascii characters.
    this.utoa = UTOA
  }
  setup() {
    this.error = null
    try {
      if (this.termcap) {
        try {
          this.injectTermcap()
        } catch (e) {
          if (this.debug) throw e
          this.error = new Error('Termcap parse error.')
          this._useInternalCap(this.terminal)
        }
      }
      else {
        try {
          this.injectTerminfo()
        } catch (e) {
          if (this.debug) throw e
          this.error = new Error('Terminfo parse error.')
          this._useInternalInfo(this.terminal)
        }
      }
    } catch (e) {
      // If there was an error, fallback
      // to an internally stored terminfo/cap.
      if (this.debug) throw e
      this.error = new Error('Terminfo not found.')
      this._useXtermInfo()
    }
  }
  term(is) { return this.terminal.indexOf(is) === 0 }
  #debug() { if (this.debug) return console.log.apply(console, arguments) }
  // Example:
  // vt102|dec vt102:\
  //  :do=^J:co#80:li#24:cl=50\E[;H\E[2J:\
  //  :le=^H:bs:cm=5\E[%i%d;%dH:nd=2\E[C:up=2\E[A:\
  //  :ce=3\E[K:cd=50\E[J:so=2\E[7m:se=2\E[m:us=2\E[4m:ue=2\E[m:\
  //  :md=2\E[1m:mr=2\E[7m:mb=2\E[5m:me=2\E[m:is=\E[1;24r\E[24;1H:\
  //  :rs=\E>\E[?3l\E[?4l\E[?5l\E[?7h\E[?8h:ks=\E[?1h\E=:ke=\E[?1l\E>:\
  //  :ku=\EOA:kd=\EOB:kr=\EOC:kl=\EOD:kb=^H:\
  //  :ho=\E[H:k1=\EOP:k2=\EOQ:k3=\EOR:k4=\EOS:pt:sr=5\EM:vt#3:\
  //  :sc=\E7:rc=\E8:cs=\E[%i%d;%dr:vs=\E[?7l:ve=\E[?7h:\
  /**
   * Fallback
   */
  _useVt102Cap() { return this.injectTermcap('vt102') }
  _useXtermCap() { return this.injectTermcap(USR + 'xterm.termcap') }
  _useXtermInfo() { return this.injectTerminfo(USR + 'xterm') }
  _useInternalInfo(name) { return this.injectTerminfo(USR + path.basename(name)) }
  _useInternalCap(name) { return this.injectTermcap(USR + path.basename(name) + '.termcap') }
  _prefix(term) {
    // If we have a terminfoFile, or our
    // term looks like a filename, use it.
    if (term) {
      if (~term.indexOf(path.sep)) return term
      if (this.terminfoFile) return this.terminfoFile
    }
    const paths = Tput.ipaths.slice()
    let file
    if (this.terminfoPrefix) paths.unshift(this.terminfoPrefix)
    // Try exact matches.
    file = this._tprefix(paths, term)
    if (file) return file
    // Try similar matches.
    file = this._tprefix(paths, term, true)
    if (file) return file
    // Not found.
    throw new Error('Terminfo directory not found.')
  }
  _tprefix(prefix, term, soft) {
    if (!prefix) return
    let file,
        dir,
        i,
        sdiff,
        sfile,
        list
    if (Array.isArray(prefix)) {
      for (i = 0; i < prefix.length; i++) if ((file = this._tprefix(prefix[i], term, soft))) return file
      return void 0
    }
    const find = function (word) {
      let file, ch
      file = path.resolve(prefix, word[0])
      try {
        fs.statSync(file)
        return file
      } catch (e) { }
      ch = word[0].charCodeAt(0).toString(16)
      if (ch.length < 2) ch = '0' + ch
      file = path.resolve(prefix, ch)
      try {
        fs.statSync(file)
        return file
      } catch (e) { }
    }
    if (!term) {
      // Make sure the directory's sub-directories
      // are all one-letter, or hex digits.
      // return find('x') ? prefix : null;
      try {
        dir = fs
          .readdirSync(prefix)
          .filter(file => file.length !== 1 && !/^[0-9a-fA-F]{2}$/.test(file))
        if (!dir.length) return prefix
      } catch (e) {}
      return
    }
    term = path.basename(term)
    dir = find(term)
    if (!dir) return
    if (soft) {
      try {
        list = fs.readdirSync(dir)
      } catch (e) { return }
      list.forEach(function (file) {
        if (file.indexOf(term) === 0) {
          const diff = file.length - term.length
          if (!sfile || diff < sdiff) {
            sdiff = diff
            sfile = file
          }
        }
      })
      return sfile && (soft || sdiff === 0)
        ? path.resolve(dir, sfile)
        : null
    }
    file = path.resolve(dir, term)
    try {
      fs.statSync(file)
      return file
    } catch (e) { }
  }
  /**
   * Terminfo Parser
   * All shorts are little-endian
   */
  parseTerminfo(data, file) {
    const info = {}
    let extended,
        l = data.length,
        i = 0,
        v,
        o
    const h = info.header = {
      dataSize: data.length,
      headerSize: 12,
      magicNumber: (data[1] << 8) | data[0],
      namesSize: (data[3] << 8) | data[2],
      boolCount: (data[5] << 8) | data[4],
      numCount: (data[7] << 8) | data[6],
      strCount: (data[9] << 8) | data[8],
      strTableSize: (data[11] << 8) | data[10]
    }
    h.total = h.headerSize + h.namesSize + h.boolCount + h.numCount * 2 + h.strCount * 2 + h.strTableSize
    i += h.headerSize
    // Names Section
    const names = data.toString('ascii', i, i + h.namesSize - 1),
          parts = names.split('|'),
          name  = parts[0],
          desc  = parts.pop()
    info.name = name
    info.names = parts
    info.desc = desc

    info.dir = path.resolve(file, '..', '..')
    info.file = file

    i += h.namesSize - 1
    // Names is nul-terminated.
    assert.equal(data[i], 0)
    i++
    // Booleans Section
    // One byte for each flag
    // Same order as <term.h>
    info.bools = {}
    l = i + h.boolCount
    o = 0
    for (; i < l; i++) {
      v = Tput.bools[o++]
      info.bools[v] = data[i] === 1
    }
    // Null byte in between to make sure numbers begin on an even byte.
    if (i % 2) {
      assert.equal(data[i], 0)
      i++
    }
    // Numbers Section
    info.numbers = {}
    l = i + h.numCount * 2
    o = 0
    for (; i < l; i += 2) {
      v = Tput.numbers[o++]
      if (data[i + 1] === 0xff && data[i] === 0xff) { info.numbers[v] = -1 }
      else { info.numbers[v] = (data[i + 1] << 8) | data[i] }
    }
    // Strings Section
    info.strings = {}
    l = i + h.strCount * 2
    o = 0
    for (; i < l; i += 2) {
      v = Tput.strings[o++]
      info.strings[v] = data[i + 1] === 0xff && data[i] === 0xff ? -1 : (data[i + 1] << 8) | data[i]
    }
    // String Table
    Object.keys(info.strings).forEach(function (key) {
      if (info.strings[key] === -1) {
        delete info.strings[key]
        return
      }
      // Workaround: fix an odd bug in the screen-256color terminfo where it tries
      // to set -1, but it appears to have {0xfe, 0xff} instead of {0xff, 0xff}.
      // TODO: Possibly handle errors gracefully below, as well as in the
      // extended info. Also possibly do: `if (info.strings[key] >= data.length)`.
      if (info.strings[key] === 65534) {
        delete info.strings[key]
        return
      }
      const s = i + info.strings[key]
      let j = s
      while (data[j]) j++

      assert(j < data.length)
      info.strings[key] = data.toString('ascii', s, j)
    })
    // Extended Header
    if (this.extended !== false) {
      i--
      i += h.strTableSize
      if (i % 2) {
        assert.equal(data[i], 0)
        i++
      }
      l = data.length
      if (i < l - 1) {
        try {
          extended = this.parseExtended(data.slice(i))
        } catch (e) {
          if (this.debug) { throw e }
          return info
        }
        info.header.extended = extended.header
        SCOPES.forEach(key => merge(info[key], extended[key]))
      }
    }
    return info
  }
  // For some reason TERM=linux has smacs/rmacs, but it maps to `^[[11m`
  // and it does not switch to the DEC SCLD character set. What the hell?
  // xterm: \x1b(0, screen: \x0e, linux: \x1b[11m (doesn't work)
  // `man console_codes` says:
  // 11  select null mapping, set display control flag, reset tog‐
  //     gle meta flag (ECMA-48 says "first alternate font").
  // See ncurses:
  // ~/ncurses/ncurses/base/lib_set_term.c
  // ~/ncurses/ncurses/tinfo/lib_acs.c
  // ~/ncurses/ncurses/tinfo/tinfo_driver.c
  //   h.symOffsetSize = (h.strTableSize - h.strCount) * 2;
  parseExtended(data) {
    const info = {}
    let l = data.length,
        i = 0
    const h = info.header = {
      dataSize: data.length,
      headerSize: 10,
      boolCount: (data[i + 1] << 8) | data[i + 0],
      numCount: (data[i + 3] << 8) | data[i + 2],
      strCount: (data[i + 5] << 8) | data[i + 4],
      strTableSize: (data[i + 7] << 8) | data[i + 6],
      lastStrTableOffset: (data[i + 9] << 8) | data[i + 8]
    }
    // h.symOffsetCount = h.strTableSize - h.strCount;

    h.total = h.headerSize
      + h.boolCount
      + h.numCount * 2
      + h.strCount * 2
      + h.strTableSize

    i += h.headerSize
    // Booleans Section
    // One byte for each flag
    const _bools = []
    l = i + h.boolCount
    for (; i < l; i++) {
      _bools.push(data[i] === 1)
    }
    // Null byte in between to make sure numbers begin on an even byte.
    if (i % 2) {
      assert.equal(data[i], 0)
      i++
    }
    // Numbers Section
    const _numbers = []
    l = i + h.numCount * 2
    for (; i < l; i += 2)
      data[i + 1] === 0xff && data[i] === 0xff
        ? _numbers.push(-1)
        : _numbers.push((data[i + 1] << 8) | data[i])
    // Strings Section
    const _strings = []
    l = i + h.strCount * 2
    for (; i < l; i += 2)
      data[i + 1] === 0xff && data[i] === 0xff
        ? _strings.push(-1)
        : _strings.push((data[i + 1] << 8) | data[i])
    // Pass over the sym offsets and get to the string table.
    i = data.length - h.lastStrTableOffset
    // Might be better to do this instead if the file has trailing bytes:
    // i += h.symOffsetCount * 2;
    // String Table
    let high = 0
    _strings.forEach(function (offset, k) {
      if (offset === -1) {
        _strings[k] = ''
        return void 0
      }
      const s = i + offset
      let j = s
      while (data[j]) j++

      assert(j < data.length)
      // Find out where the string table ends by
      // getting the highest string length.
      if (high < j - i) high = j - i
      _strings[k] = data.toString('ascii', s, j)
    })
    // Symbol Table
    // Add one to the highest string length because we didn't count \0.
    i += high + 1
    l = data.length

    const sym = []
    let j

    for (; i < l; i++) {
      j = i
      while (data[j]) j++
      sym.push(data.toString('ascii', i, j))
      i = j
    }
    // Identify by name
    j = 0

    info.bools = {}
    info.numbers = {}
    info.strings = {}
    _bools.forEach(bool => info.bools[sym[j++]] = bool)
    _numbers.forEach(number => info.numbers[sym[j++]] = number)
    _strings.forEach(string => info.strings[sym[j++]] = string)
    // Should be the very last bit of data.
    assert.equal(i, data.length)
    return info
  }
  // If enter_pc_charset is the same as enter_alt_charset,
  // the terminal does not support SCLD as ACS.
  //      total: 245 },
  compileTerminfo(term) { return this.compile(this.readTerminfo(term)) }
  //   total: 2342 }
  injectTerminfo(term) { return this.inject(this.compileTerminfo(term)) }
  /**
   * Compiler - terminfo cap->javascript
   */
  compile(info) {
    const self = this
    if (!info) throw new Error('Terminal not found.')
    this.detectFeatures(info)
    this.#debug(info)
    const all = info.all = {}
    const methods = info.methods = {}

    for (const type of SCOPES) {
      const o = info[type]
      Object.keys(o).forEach(key => methods[key] = self._compile(info, key, all[key] = o[key]))
    }
    Tput.bools.forEach(key => { if (methods[key] == null) methods[key] = false })
    Tput.numbers.forEach(key => { if (methods[key] == null) methods[key] = -1 })
    Tput.strings.forEach(key => { if (!methods[key]) methods[key] = noop })
    Object.keys(methods).forEach(key => { if (Tput.alias[key]) { Tput.alias[key].forEach(alias => { methods[alias] = methods[key] }) } })
    // Could just use:
    // Object.keys(Tput.aliasMap).forEach(function(key) {
    //   methods[key] = methods[Tput.aliasMap[key]];
    // });
    return info
  }
  // Some data to help understand:
  inject(info) {
    const self    = this,
          methods = info.methods || info
    Object.keys(methods).forEach(key => {
      if (typeof methods[key] !== FUN) { return void (self[key] = methods[key]) }
      self[key] = function () { return methods[key].call(self, slice(arguments)) }
    })
    this.info = info
    this.all = info.all
    this.methods = info.methods
    this.bools = info.bools
    this.numbers = info.numbers
    this.strings = info.strings
    if (!~info.names.indexOf(this.terminal)) this.terminal = info.name
    this.features = info.features
    Object.keys(info.features).forEach(key => {
      if (key === 'padding') {
        if (!info.features.padding && self.options.padding !== true) self.padding = false
        return void 0
      }
      self[key] = info.features[key]
    })
  }
  // ~/ncurses/ncurses/tinfo/comp_scan.c
  _compile(info, key, str) {
    let v
    this.#debug('Compiling %s: %s', key, JSON.stringify(str))
    switch (typeof str) {
      case BOO:
        return str
      case NUM:
        return str
      case STR:
        break
      default:
        return noop
    }
    if (!str) return noop
    // See:
    // ~/ncurses/progs/tput.c - tput() - L149
    // ~/ncurses/progs/tset.c - set_init() - L992
    if (key === 'init_file' || key === 'reset_file') {
      try {
        str = fs.readFileSync(str, 'utf8')
        if (this.debug) {
          v = ('return ' + JSON.stringify(str) + ';')
            .replace(/\x1b/g, '\\x1b')
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
          process.stdout.write(v + '\n')
        }
        return function () { return str }
      } catch (e) {
        return noop
      }
    }
    const tkey   = info.name + '.' + key,
          header = 'var v, dyn = {}, stat = {}, stack = [], out = [];',
          footer = ';return out.join("");'
    let code = header,
        val  = str,
        buff = '',
        cap,
        ch,
        fi,
        then,
        els,
        end

    function read(regex, no) {
      cap = regex.exec(val)
      if (!cap) return
      val = val.substring(cap[0].length)
      ch = cap[1]
      if (!no) clear()
      return cap
    }
    function stmt(c) {
      if (code[code.length - 1] === ',') code = code.slice(0, -1)
      code += c
    }
    function expr(c) {
      code += c + ','
    }
    function echo(c) {
      if (c === '""') return
      expr('out.push(' + c + ')')
    }
    function print(c) {
      buff += c
    }
    function clear() {
      if (buff) {
        echo(JSON.stringify(buff).replace(/\\u00([0-9a-fA-F]{2})/g, '\\x$1'))
        buff = ''
      }
    }
    while (val) {
      // Ignore newlines
      if (read(/^\n /, true)) {
        continue
      }
      // '^A' -> ^A
      if (read(/^\^(.)/i, true)) {
        if (!(ch >= ' ' && ch <= '~')) {
          this.#debug('%s: bad caret char.', tkey)
          // NOTE: ncurses appears to simply
          // continue in this situation, but
          // I could be wrong.
          print(cap[0])
          continue
        }
        if (ch === '?') {
          ch = '\x7f'
        }
        else {
          ch = ch.charCodeAt(0) & 31
          if (ch === 0) ch = 128
          ch = String.fromCharCode(ch)
        }
        print(ch)
        continue
      }
      // 3 octal digits -> character
      if (read(/^\\([0-7]{3})/, true)) {
        print(String.fromCharCode(parseInt(ch, 8)))
        continue
      }
      // '\e' -> ^[
      // '\n' -> \n
      // '\r' -> \r
      // '\0' -> \200 (special case)
      if (read(/^\\([eEnlrtbfs\^\\,:0]|.)/, true)) {
        ch = ch === 'e' || ch === 'E' ? '\x1b'
          : ch === 'n' ? '\n'
            : ch === 'l' ? '\x85'
              : ch === 'r' ? '\r'
                : ch === 't' ? '\t'
                  : ch === 'b' ? '\x08'
                    : ch === 'f' ? '\x0c'
                      : ch === 's' ? ' '
                        : ch === '^' ? '^'
                          : ch === '\\' ? '\\'
                            : ch === ',' ? ','
                              : ch === ':' ? ':'
                                : ch === '0' ? '\x80'
                                  : ch === 'a' ? '\x07'
                                    : (this.#debug('%s: bad backslash char.', tkey), cap[0])
        print(ch)
        continue
      }
      // $<5> -> padding
      // e.g. flash_screen: '\u001b[?5h$<100/>\u001b[?5l',
      if (read(/^\$<(\d+)([*\/]{0,2})>/, true)) {
        if (this.padding) print(cap[0])
        continue
      }
      // %%   outputs `%'
      if (read(/^%%/, true)) {
        print('%')
        continue
      }
      // %[[:]flags][width[.precision]][doxXs]
      //   as in printf, flags are [-+#] and space.  Use a `:' to allow the
      //   next character to be a `-' flag, avoiding interpreting "%-" as an
      //   operator.
      // %c   print pop() like %c in printf
      // Example from screen terminfo:
      //   S0: "\u001b(%p1%c"
      // %d   print pop()
      // "Print (e.g., "%d") is a special case."
      // %s   print pop() like %s in printf
      if (read(/^%((?::-|[+# ]){1,4})?(\d+(?:\.\d+)?)?([doxXsc])/)) {
        if (this.printf || cap[1] || cap[2] || ~'oxX'.indexOf(cap[3])) { echo('sprintf("' + cap[0].replace(':-', '-') + '", stack.pop())') }
        else if (cap[3] === 'c') { echo('(v = stack.pop(), isFinite(v) ' + '? String.fromCharCode(v || 0200) : "")') }
        else { echo('stack.pop()') }
        continue
      }
      // %p[1-9]
      //   push i'th parameter
      if (read(/^%p([1-9])/)) {
        expr('(stack.push(v = params[' + (ch - 1) + ']), v)')
        continue
      }
      // %P[a-z]
      //   set dynamic variable [a-z] to pop()
      if (read(/^%P([a-z])/)) {
        expr('dyn.' + ch + ' = stack.pop()')
        continue
      }
      // %g[a-z]
      //   get dynamic variable [a-z] and push it
      if (read(/^%g([a-z])/)) {
        expr('(stack.push(dyn.' + ch + '), dyn.' + ch + ')')
        continue
      }
      // %P[A-Z]
      //   set static variable [a-z] to pop()
      if (read(/^%P([A-Z])/)) {
        expr('stat.' + ch + ' = stack.pop()')
        continue
      }
      // %g[A-Z]
      //   get static variable [a-z] and push it
      //   The  terms  "static"  and  "dynamic" are misleading.  Historically,
      //   these are simply two different sets of variables, whose values are
      //   not reset between calls to tparm.  However, that fact is not
      //   documented in other implementations.  Relying on it will adversely
      //   impact portability to other implementations.
      if (read(/^%g([A-Z])/)) {
        expr('(stack.push(v = stat.' + ch + '), v)')
        continue
      }
      // %'c' char constant c
      // NOTE: These are stored as c chars, exemplified by:
      // cursor_address: "\u001b=%p1%' '%+%c%p2%' '%+%c"
      if (read(/^%'(.)'/)) {
        expr('(stack.push(v = ' + ch.charCodeAt(0) + '), v)')
        continue
      }
      // %{nn}
      //   integer constant nn
      if (read(/^%\{(\d+)\}/)) {
        expr('(stack.push(v = ' + ch + '), v)')
        continue
      }
      // %l   push strlen(pop)
      if (read(/^%l/)) {
        expr('(stack.push(v = (stack.pop() || "").length || 0), v)')
        continue
      }
      // %+ %- %* %/ %m
      //   arithmetic (%m is mod): push(pop() op pop())
      // %& %| %^
      //   bit operations (AND, OR and exclusive-OR): push(pop() op pop())
      // %= %> %<
      //   logical operations: push(pop() op pop())
      if (read(/^%([+\-*\/m&|\^=><])/)) {
        if (ch === '=') ch = '==='
        else if (ch === 'm') ch = '%'
        expr('(v = stack.pop(),'
          + ' stack.push(v = (stack.pop() ' + ch + ' v) || 0),'
          + ' v)')
        continue
      }
      // %A, %O
      //   logical AND and OR operations (for conditionals)
      if (read(/^%([AO])/)) {
        // Are we supposed to store the result on the stack?
        expr('(stack.push(v = (stack.pop() '
          + (ch === 'A' ? '&&' : '||')
          + ' stack.pop())), v)')
        continue
      }
      // %! %~
      //   unary operations (logical and bit complement): push(op pop())
      if (read(/^%([!~])/)) {
        expr('(stack.push(v = ' + ch + 'stack.pop()), v)')
        continue
      }
      // %i   add 1 to first two parameters (for ANSI terminals)
      if (read(/^%i/)) {
        // Are these supposed to go on the stack in certain situations?
        // ncurses doesn't seem to put them on the stack, but xterm.user6
        // seems to assume they're on the stack for some reason. Could
        // just be a bad terminfo string.
        // user6: "\u001b[%i%d;%dR" - possibly a termcap-style string.
        // expr('(params[0] |= 0, params[1] |= 0, params[0]++, params[1]++)');
        expr('(params[0]++, params[1]++)')
        continue
      }
      // %? expr %t thenpart %e elsepart %;
      //   This forms an if-then-else.  The %e elsepart is optional.  Usually
      //   the %? expr part pushes a value onto the stack, and %t pops it from
      //   the stack, testing if it is nonzero (true).  If it is zero (false),
      //   control passes to the %e (else) part.
      //   It is possible to form else-if's a la Algol 68:
      //     %? c1 %t b1 %e c2 %t b2 %e c3 %t b3 %e c4 %t b4 %e %;
      //   where ci are conditions, bi are bodies.
      if (read(/^%\?/)) {
        end = -1
        stmt(';if (')
        continue
      }
      if (read(/^%t/)) {
        end = -1
        // Technically this is supposed to pop everything off the stack that was
        // pushed onto the stack after the if statement, see man terminfo.
        // Right now, we don't pop anything off. This could cause compat issues.
        // Perhaps implement a "pushed" counter from the time the if statement
        // is added, to the time the then statement is added, and pop off
        // the appropriate number of elements.
        // while (pushed--) expr('stack.pop()');
        stmt(') {')
        continue
      }
      // Terminfo does elseif's like
      // this: %?[expr]%t...%e[expr]%t...%;
      if (read(/^%e/)) {
        fi = val.indexOf('%?')
        then = val.indexOf('%t')
        els = val.indexOf('%e')
        end = val.indexOf('%;')
        if (end === -1) end = Infinity
        if (
          then !== -1 && then < end &&
          (fi === -1 || then < fi) &&
          (els === -1 || then < els)
        ) { stmt('} else if (') }
        else { stmt('} else {') }
        continue
      }
      if (read(/^%;/)) {
        end = null
        stmt('}')
        continue
      }
      buff += val[0]
      val = val.substring(1)
    }
    // Clear the buffer of any remaining text.
    clear()
    // Some terminfos (I'm looking at you, atari-color), don't end an if
    // statement. It's assumed terminfo will automatically end it for
    // them, because they are a bunch of lazy bastards.
    if (end != null) stmt('}')
    // Add the footer.
    stmt(footer)
    // Optimize and cleanup generated code.
    v = code.slice(header.length, -footer.length)
    if (!v.length) { code = 'return "";' }
    else if ((v = /^out\.push\(("(?:[^"]|\\")+")\)$/.exec(v))) { code = 'return ' + v[1] + ';' }
    else {
      // Turn `(stack.push(v = params[0]), v),out.push(stack.pop())`
      // into `out.push(params[0])`.
      code = code.replace(
        /\(stack\.push\(v = params\[(\d+)\]\), v\),out\.push\(stack\.pop\(\)\)/g,
        'out.push(params[$1])')
      // Remove unnecessary variable initializations.
      v = code.slice(header.length, -footer.length)
      if (!~v.indexOf('v = ')) code = code.replace('v, ', '')
      if (!~v.indexOf('dyn')) code = code.replace('dyn = {}, ', '')
      if (!~v.indexOf('stat')) code = code.replace('stat = {}, ', '')
      if (!~v.indexOf('stack')) code = code.replace('stack = [], ', '')
      // Turn `var out = [];out.push("foo"),` into `var out = ["foo"];`.
      code = code.replace(
        /out = \[\];out\.push\(("(?:[^"]|\\")+")\),/,
        'out = [$1];')
    }
    // Terminfos `wyse350-vb`, and `wy350-w`
    // seem to have a few broken strings.
    if (str === '\u001b%?') code = 'return "\\x1b";'
    if (this.debug) {
      v = code
        .replace(/\x1b/g, '\\x1b')
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n')
      process.stdout.write(v + '\n')
    }
    try {
      if (this.options.stringify && code.indexOf('return ') === 0) {
        return new Function('', code)()
      }
      return this.printf || ~code.indexOf('sprintf(')
        ? new Function('sprintf, params', code).bind(null, sprintf)
        : new Function('params', code)
    } catch (e) {
      console.error('')
      console.error('Error on %s:', tkey)
      console.error(JSON.stringify(str))
      console.error('')
      console.error(code.replace(/(,|;)/g, '$1\n'))
      e.stack = e.stack.replace(/\x1b/g, '\\x1b')
      throw e
    }
  }
  // See: ~/ncurses/ncurses/tinfo/lib_tputs.c
  _print(code, print, done) {
    const xon = !this.bools.needs_xon_xoff || this.bools.xon_xoff
    print = print || write
    done = done || noop
    if (!this.padding) {
      print(code)
      return done()
    }
    const parts = code.split(/(?=\$<[\d.]+[*\/]{0,2}>)/)
    let i = 0;
    (function next() {
      if (i === parts.length) return done()
      let part = parts[i++]
      const padding = /^\$<([\d.]+)([*\/]{0,2})>/.exec(part)
      let amount,
          suffix
      // , affect;
      if (!padding) {
        print(part)
        return next()
      }
      part = part.substring(padding[0].length)
      amount = +padding[1]
      suffix = padding[2]
      // A `/'  suffix indicates  that  the  padding  is  mandatory and forces a
      // delay of the given number of milliseconds even on devices for which xon
      // is present to indicate flow control.
      if (xon && !~suffix.indexOf('/')) {
        print(part)
        return next()
      }
      // A `*' indicates that the padding required is proportional to the number
      // of lines affected by the operation, and  the amount  given  is the
      // per-affected-unit padding required.  (In the case of insert character,
      // the factor is still the number of lines affected.) Normally, padding is
      // advisory if the device has the xon capability; it is used for cost
      // computation but does not trigger delays.
      if (~suffix.indexOf('*')) {
        // XXX Disable this for now.
        amount = amount
        // if ((affect = /\x1b\[(\d+)[LM]/.exec(part))) {
        //   amount *= +affect[1];
        // }
        // The above is a huge workaround. In reality, we need to compile
        // `_print` into the string functions and check the cap name and
        // params.
        // if (cap === 'insert_line' || cap === 'delete_line') {
        //   amount *= params[0];
        // }
        // if (cap === 'clear_screen') {
        //   amount *= process.stdout.rows;
        // }
      }
      return setTimeout(() => (print(part), next()), amount)
    })()
  }
  _tryCap(file, term) {
    if (!file) return
    let terms,
        data,
        i
    if (Array.isArray(file)) {
      for (i = 0; i < file.length; i++) {
        data = this._tryCap(file[i], term)
        if (data) return data
      }
      return
    }
    // If the termcap string starts with `/`,
    // ncurses considers it a filename.
    data = file[0] === '/'
      ? tryRead(file)
      : file
    if (!data) return
    terms = this.parseTermcap(data, file)
    return term && !terms[term] ? void 0 : terms
  }
  //  :mi:al=\E[L:dc=\E[P:dl=\E[M:ei=\E[4l:im=\E[4h:
  parseTermcap(data, file) {
    const terms = {}
    let parts,
        term,
        entries,
        fields,
        field,
        names,
        i,
        j,
        k
    // remove escaped newlines
    data = data.replace(/\\\n[ \t]*/g, '')
    // remove comments
    data = data.replace(/^#[^\n]+/gm, '')
    // split entries
    entries = data.trim().split(/\n+/)
    for (i = 0; i < entries.length; i++) {
      fields = entries[i].split(/:+/)
      for (j = 0; j < fields.length; j++) {
        field = fields[j].trim()
        if (!field) continue
        if (j === 0) {
          names = field.split('|')
          term = {
            name: names[0],
            names: names,
            desc: names.pop(),
            file: ~file.indexOf(path.sep)
              ? path.resolve(file)
              : file,
            termcap: true
          }
          for (k = 0; k < names.length; k++) {
            terms[names[k]] = term
          }
          term.bools = {}
          term.numbers = {}
          term.strings = {}
          continue
        }
        if (~field.indexOf('=')) {
          parts = field.split('=')
          term.strings[parts[0]] = parts.slice(1).join('=')
        }
        else if (~field.indexOf('#')) {
          parts = field.split('#')
          term.numbers[parts[0]] = +parts.slice(1).join('#')
        }
        else {
          term.bools[field] = true
        }
      }
    }
    return terms
  }
  /**
   * Termcap Compiler
   *  man termcap
   */
  translateTermcap(info) {
    const self = this,
          out  = {}
    if (!info) return
    this.#debug(info)
    HEADERS.forEach(key => out[key] = info[key])
    // Separate aliases for termcap
    const map = (() => {
      const out = {}
      Object.keys(Tput.alias).forEach(key => {
        const aliases = Tput.alias[key]
        out[aliases.termcap] = key
      })
      return out
    })()
    // Translate termcap cap names to terminfo cap names.
    // e.g. `up` -> `cursor_up`
    SCOPES.forEach(key => {
      out[key] = {}
      Object.keys(info[key]).forEach(function (cap) {
        if (key === 'strings') info.strings[cap] = self._captoinfo(cap, info.strings[cap], 1)
        if (map[cap]) { out[key][map[cap]] = info[key][cap] }
        else {
          // NOTE: Possibly include all termcap names
          // in a separate alias.js file. Some are
          // missing from the terminfo alias.js file
          // which is why we have to do this:
          // See: $ man termcap
          out[key][cap] = info[key][cap]
        }
      })
    })
    return out
  }
  // A small helper function if we want
  /**
   * Termcap Parser
   *  http://en.wikipedia.org/wiki/Termcap
   *  http://www.gnu.org/software
   *    /termutils/manual/termcap-1.3/html_mono/termcap.html
   *  http://www.gnu.org/software
   *    /termutils/manual/termcap-1.3/html_mono/termcap.html#SEC17
   *  http://tldp.org/HOWTO/Text-Terminal-HOWTO.html#toc16
   *  man termcap
   */
  compileTermcap(term) { return this.compile(this.readTermcap(term)) }
  injectTermcap(term) { return this.inject(this.compileTermcap(term)) }
  /**
   * _nc_captoinfo - ported to javascript directly from ncurses.
   * Copyright (c) 1998-2009,2010 Free Software Foundation, Inc.
   * See: ~/ncurses/ncurses/tinfo/captoinfo.c
   *
   * Convert a termcap string to terminfo format.
   * 'cap' is the relevant terminfo capability index.
   * 's' is the string value of the capability.
   * 'parameterized' tells what type of translations to do:
   *    % translations if 1
   *    pad translations if >=0
   */
  _captoinfo(cap, s, parameterized) {
    const self = this
    let capstart
    if (parameterized == null) parameterized = 0
    const MAX_PUSHED = 16,
          stack      = []
    let stackptr = 0,
        onstack  = 0,
        seenm    = 0,
        seenn    = 0,
        seenr    = 0,
        param    = 1,
        i        = 0,
        out      = ''

    function warn() {
      const args = slice(arguments)
      args[0] = 'captoinfo: ' + (args[0] || '')
      return self.#debug.apply(self, args)
    }
    function isdigit(ch) { return ch >= '0' && ch <= '9' }
    function isgraph(ch) { return ch > ' ' && ch <= '~' }
    // convert a character to a terminfo push
    function cvtchar(sp) {
      let c = '\0',
          len
      let j = i
      switch (sp[j]) {
        case '\\':
          switch (sp[++j]) {
            case '\'':
            case '$':
            case '\\':
            case '%':
              c = sp[j]
              len = 2
              break
            case '\0':
              c = '\\'
              len = 1
              break
            case '0':
            case '1':
            case '2':
            case '3':
              len = 1
              while (isdigit(sp[j])) {
                c = String.fromCharCode(8 * c.charCodeAt(0)
                  + (sp[j++].charCodeAt(0) - '0'.charCodeAt(0)))
                len++
              }
              break
            default:
              c = sp[j]
              len = 2
              break
          }
          break
        case '^':
          c = String.fromCharCode(sp[++j].charCodeAt(0) & 0x1f)
          len = 2
          break
        default:
          c = sp[j]
          len = 1
      }
      if (isgraph(c) && c !== ',' && c !== '\'' && c !== '\\' && c !== ':') {
        out += '%\''
        out += c
        out += '\''
      }
      else {
        out += '%{'
        if (c.charCodeAt(0) > 99) {
          out += String.fromCharCode((c.charCodeAt(0) / 100 | 0) + '0'.charCodeAt(0))
        }
        if (c.charCodeAt(0) > 9) {
          out += String.fromCharCode((c.charCodeAt(0) / 10 | 0) % 10 + '0'.charCodeAt(0))
        }
        out += String.fromCharCode(c.charCodeAt(0) % 10 + '0'.charCodeAt(0))
        out += '}'
      }
      return len
    }
    // push n copies of param on the terminfo stack if not already there
    function getparm(parm, n) {
      if (seenr) parm = parm === 1 ? 2 : parm === 2 ? 1 : parm
      if (onstack === parm) {
        if (n > 1) {
          warn('string may not be optimal')
          out += '%Pa'
          while (n--) { out += '%ga' }
        }
        return
      }
      if (onstack !== 0) { push() }
      onstack = parm
      while (n--) {
        out += '%p'
        out += String.fromCharCode('0'.charCodeAt(0) + parm)
      }
      if (seenn && parm < 3) { out += '%{96}%^' }
      if (seenm && parm < 3) { out += '%{127}%^' }
    }
    // push onstack on to the stack
    function push() {
      if (stackptr >= MAX_PUSHED) { warn('string too complex to convert') }
      else { stack[stackptr++] = onstack }
    }
    // pop the top of the stack into onstack
    function pop() {
      if (stackptr === 0) {
        if (onstack === 0) { warn('I\'m confused') }
        else { onstack = 0 }
      }
      else {
        onstack = stack[--stackptr]
      }
      param++
    }
    function see03() {
      getparm(param, 1)
      out += '%3d'
      pop()
    }
    function invalid() {
      out += '%'
      i--
      warn('unknown %% code %s (%#x) in %s', JSON.stringify(s[i]), s[i].charCodeAt(0), cap)
    }
    // skip the initial padding (if we haven't been told not to)
    capstart = null
    if (s == null) s = ''
    if (parameterized >= 0 && isdigit(s[i])) {
      for (capstart = i; ; i++) {
        if (!(isdigit(s[i]) || s[i] === '*' || s[i] === '.')) {
          break
        }
      }
    }
    while (s[i]) {
      switch (s[i]) {
        case '%':
          i++
          if (parameterized < 1) {
            out += '%'
            break
          }
          switch (s[i++]) {
            case '%':
              out += '%'
              break
            case 'r':
              if (seenr++ === 1) warn('saw %%r twice in %s', cap)
              break
            case 'm':
              if (seenm++ === 1) warn('saw %%m twice in %s', cap)
              break
            case 'n':
              if (seenn++ === 1) warn('saw %%n twice in %s', cap)
              break
            case 'i':
              out += '%i'
              break
            case '6':
            case 'B':
              getparm(param, 1)
              out += '%{10}%/%{16}%*'
              getparm(param, 1)
              out += '%{10}%m%+'
              break
            case '8':
            case 'D':
              getparm(param, 2)
              out += '%{2}%*%-'
              break
            case '>':
              getparm(param, 2)
              // %?%{x}%>%t%{y}%+%;
              out += '%?'
              i += cvtchar(s)
              out += '%>%t'
              i += cvtchar(s)
              out += '%+%;'
              break
            case 'a':
              if ((s[i] === '=' || s[i] === '+' || s[i] === '-' ||
                s[i] === '*' || s[i] === '/') &&
                (s[i + 1] === 'p' || s[i + 1] === 'c') &&
                s[i + 2] !== '\0' && s[i + 2]) {
                let l
                l = 2
                if (s[i] !== '=') { getparm(param, 1) }
                if (s[i + 1] === 'p') {
                  getparm(param + s[i + 2].charCodeAt(0) - '@'.charCodeAt(0), 1)
                  if (param !== onstack) {
                    pop()
                    param--
                  }
                  l++
                }
                else { i += 2, l += cvtchar(s), i -= 2 }
                switch (s[i]) {
                  case '+':
                    out += '%+'
                    break
                  case '-':
                    out += '%-'
                    break
                  case '*':
                    out += '%*'
                    break
                  case '/':
                    out += '%/'
                    break
                  case '=':
                    onstack = seenr ? param === 1 ? 2 : param === 2 ? 1 : param : param
                    break
                }
                i += l
                break
              }
              getparm(param, 1)
              i += cvtchar(s)
              out += '%+'
              break
            case '+':
              getparm(param, 1)
              i += cvtchar(s)
              out += '%+%c'
              pop()
              break
            case 's':
              // #ifdef WATERLOO
              //          i += cvtchar(s);
              //          getparm(param, 1);
              //          out += '%-';
              // #else
              getparm(param, 1)
              out += '%s'
              pop()
              // #endif /* WATERLOO */
              break
            case '-':
              i += cvtchar(s)
              getparm(param, 1)
              out += '%-%c'
              pop()
              break
            case '.':
              getparm(param, 1)
              out += '%c'
              pop()
              break
            case '0': // not clear any of the historical termcaps did this
              if (s[i] === '3') {
                see03() // goto
                break
              }
              else if (s[i] !== '2') {
                invalid() // goto
                break
              }
            // FALLTHRU
            case '2':
              getparm(param, 1)
              out += '%2d'
              pop()
              break
            case '3':
              see03()
              break
            case 'd':
              getparm(param, 1)
              out += '%d'
              pop()
              break
            case 'f':
              param++
              break
            case 'b':
              param--
              break
            case '\\':
              out += '%\\'
              break
            default:
              invalid()
              break
          }
          break
        default:
          out += s[i++]
          break
        // #endif
      }
    }
    // Now, if we stripped off some leading padding, add it at the end
    // of the string as mandatory padding.
    if (capstart != null) {
      out += '$<'
      for (i = capstart; ; i++) {
        if (isdigit(s[i]) || s[i] === '*' || s[i] === '.') { out += s[i] }
        else { break }
      }
      out += '/>'
    }
    if (s !== out) {
      warn('Translating %s from %s to %s.', cap, JSON.stringify(s), JSON.stringify(out))
    }
    return out
  }
  /**
   * Compile All Terminfo
   */
  getAll() {
    const dir   = this._prefix(),
          list  = asort(fs.readdirSync(dir)),
          infos = []
    list.forEach(letter => {
      const terms = asort(fs.readdirSync(path.resolve(dir, letter)))
      infos.push.apply(infos, terms)
    })
    function asort(obj) { return obj.sort((a, b) => a.toLowerCase().charCodeAt(0) - b.toLowerCase().charCodeAt(0)) }
    return infos
  }
  compileAll(start) {
    const self = this,
          all  = {}
    this.getAll().forEach(name => {
      if (start && name !== start) { return }
      else { start = null }
      all[name] = self.compileTerminfo(name)
    })
    return all
  }
  /**
   * Detect Features / Quirks
   */
  detectFeatures(info) {
    const data = this.parseACS(info)
    info.features = {
      unicode: this.detectUnicode(info),
      brokenACS: this.detectBrokenACS(info),
      PCRomSet: this.detectPCRomSet(info),
      magicCookie: this.detectMagicCookie(info),
      padding: this.detectPadding(info),
      setbuf: this.detectSetbuf(info),
      acsc: data.acsc,
      acscr: data.acscr
    }
    return info.features
  }
  // ~/ncurses/ncurses/tinfo/lib_setup.c
  detectBrokenACS(info) {
    // ncurses-compatible env variable.
    if (process.env.NCURSES_NO_UTF8_ACS != null) return !!+process.env.NCURSES_NO_UTF8_ACS
    // If the terminal supports unicode, we don't need ACS.
    if (info.numbers.U8 >= 0) return !!info.numbers.U8
    // The linux console is just broken for some reason.
    // Apparently the Linux console does not support ACS,
    // but it does support the PC ROM character set.
    if (info.name === 'linux') return true
    // PC alternate charset
    // if (acsc.indexOf('+\x10,\x11-\x18.\x190') === 0) {
    if (this.detectPCRomSet(info)) return true
    // screen termcap is bugged?
    if (this.termcap &&
      info.name.indexOf('screen') === 0 &&
      process.env.TERMCAP &&
      ~process.env.TERMCAP.indexOf('screen') &&
      ~process.env.TERMCAP.indexOf('hhII00')) {
      if (~info.strings.enter_alt_charset_mode.indexOf('\x0e') ||
        ~info.strings.enter_alt_charset_mode.indexOf('\x0f') ||
        ~info.strings.set_attributes.indexOf('\x0e') ||
        ~info.strings.set_attributes.indexOf('\x0f')) {
        return true
      }
    }
    return false
  }
  // See: ~/ncurses/ncurses/tinfo/lib_acs.c
  detectPCRomSet(info) {
    const s = info.strings
    return !!(
      s.enter_pc_charset_mode &&
      s.enter_alt_charset_mode &&
      s.enter_pc_charset_mode === s.enter_alt_charset_mode &&
      s.exit_pc_charset_mode === s.exit_alt_charset_mode
    )
  }
  detectMagicCookie() { return process.env.NCURSES_NO_MAGIC_COOKIE == null }
  detectPadding() { return process.env.NCURSES_NO_PADDING == null }
  detectSetbuf() { return process.env.NCURSES_NO_SETBUF == null }
  parseACS(info) {
    const data = {}
    data.acsc = {}
    data.acscr = {}
    // Possibly just return an empty object, as done here, instead of
    // specifically saying ACS is "broken" above. This would be more
    // accurate to ncurses logic. But it doesn't really matter.
    if (this.detectPCRomSet(info)) {
      return data
    }
    // See: ~/ncurses/ncurses/tinfo/lib_acs.c: L208
    Object.keys(Tput.acsc).forEach(function (ch) {
      const acs_chars = info.strings.acs_chars || '',
            i         = acs_chars.indexOf(ch),
            next      = acs_chars[i + 1]
      if (!next || i === -1 || !Tput.acsc[next]) {
        return
      }
      data.acsc[ch] = Tput.acsc[next]
      data.acscr[Tput.acsc[next]] = ch
    })
    return data
  }
  GetConsoleCP() {
    let ccp
    if (process.platform !== 'win32') return -1
    // Allow unicode on all windows consoles for now:
    if (+process.env.NCURSES_NO_WINDOWS_UNICODE !== 1) return 65001
    // cp.execSync('chcp 65001', { stdio: 'ignore', timeout: 1500 });
    try {
      // Produces something like: 'Active code page: 437\n\n'
      ccp = cp.execFileSync(process.env.WINDIR + '\\system32\\chcp.com', [], {
        stdio: [ 'ignore', 'pipe', 'ignore' ],
        encoding: 'ascii',
        timeout: 1500
      })
      // ccp = cp.execSync('chcp', {
      //   stdio: ['ignore', 'pipe', 'ignore'],
      //   encoding: 'ascii',
      //   timeout: 1500
      // });
    } catch (e) {}
    ccp = /\d+/.exec(ccp)
    return !ccp ? -1 : (ccp = +ccp[0], ccp)

  }
  has(name) {
    name = Tput.aliasMap[name]
    const val = this.all[name]
    return !name ? false : typeof val === NUM ? val !== -1 : !!val
  }
  _readTermcap = this.readTermcap
  readTermcap(term) {
    const self = this
    let
      terms,
      term_,
      root,
      paths

    term = term || this.terminal
    // Termcap has a bunch of terminals usually stored in one file/string,
    // so we need to find the one containing our desired terminal.
    if (~term.indexOf(path.sep) && (terms = this._tryCap(path.resolve(term)))) {
      term_ = path.basename(term).split('.')[0]
      term = terms[process.env.TERM] ? process.env.TERM : terms[term_] ? term_ : Object.keys(terms)[0]
    }
    else {
      paths = Tput.cpaths.slice()
      if (this.termcapFile) paths.unshift(this.termcapFile)
      paths.push(Tput.termcap)
      terms = this._tryCap(paths, term)
    }
    if (!terms) throw new Error('Cannot find termcap for: ' + term)
    root = terms[term]
    if (this.debug) this._termcap = terms
    (function tc(term) {
      if (term && term.strings.tc) {
        root.inherits = root.inherits || []
        root.inherits.push(term.strings.tc)
        const names = terms[term.strings.tc]
          ? terms[term.strings.tc].names
          : [ term.strings.tc ]
        self.#debug('%s inherits from %s.',
          term.names.join('/'), names.join('/'))
        const inherit = tc(terms[term.strings.tc])
        if (inherit) {
          SCOPES.forEach(function (type) {
            merge(term[type], inherit[type])
          })
        }
      }
      return term
    })(root)
    // Translate termcap names to terminfo-style names.
    root = this.translateTermcap(root)
    return root
  }
  // DEC Special Character and Line Drawing Set.
  detectUnicode() {
    const { env } = process
    if (env.NCURSES_FORCE_UNICODE != null) return !!+env.NCURSES_FORCE_UNICODE
    if (this.options.forceUnicode != null) return this.options.forceUnicode
    const LANG = env.LANG + ':' + env.LANGUAGE + ':' + env.LC_ALL + ':' + env.LC_CTYPE
    return /utf-?8/i.test(LANG) || (this.GetConsoleCP() === 65001)
  }
  readTerminfo(term) {
    let data,
        file,
        info
    term = term || this.terminal
    file = path.normalize(this._prefix(term))
    data = fs.readFileSync(file)
    info = this.parseTerminfo(data, file)
    if (this.debug) this._terminfo = info
    return info
  }

  static ipaths = IPATHS
  /**
   * Extended Parsing
   */
  /**
   * Termcap
   */
  static cpaths = CPATHS
  static _prefix = CPATHS
  static _tprefix = CPATHS
  /**
   * Aliases
   */
  static _alias = alias
  static alias = {}
  /**
   * Feature Checking
   */
  static aliasMap = {}
  /**
   * Fallback Termcap Entry
   */
  static termcap = TERMCAP
  /**
   * Terminfo Data
   */
  static bools = BOOLS
  static numbers = NUMBERS
  static strings = STRINGS
  static acsc = ACSC
  static utoa = UTOA
  static _tprefix(prefix, term, soft) {
    if (!prefix) return
    let file,
        dir,
        i,
        sdiff,
        sfile,
        list
    if (Array.isArray(prefix)) {
      for (i = 0; i < prefix.length; i++) {
        file = this._tprefix(prefix[i], term, soft)
        if (file) return file
      }
      return
    }
    const find = function (word) {
      let file, ch

      file = path.resolve(prefix, word[0])
      try {
        fs.statSync(file)
        return file
      } catch (e) { }
      ch = word[0].charCodeAt(0).toString(16)
      if (ch.length < 2) ch = '0' + ch
      file = path.resolve(prefix, ch)
      try {
        fs.statSync(file)
        return file
      } catch (e) { }
    }
    if (!term) {
      // Make sure the directory's sub-directories
      // are all one-letter, or hex digits.
      // return find('x') ? prefix : null;
      try {
        dir = fs
          .readdirSync(prefix)
          .filter(file => file.length !== 1 && !/^[0-9a-fA-F]{2}$/.test(file))
        if (!dir.length) return prefix
      } catch (e) {}
      return
    }
    term = path.basename(term)
    dir = find(term)
    if (!dir) return
    if (soft) {
      try { list = fs.readdirSync(dir) } catch (e) { return }
      list.forEach(function (file) {
        if (file.indexOf(term) === 0) {
          const diff = file.length - term.length
          if (!sfile || diff < sdiff) { sdiff = diff, sfile = file }
        }
      })
      return sfile && (soft || sdiff === 0) ? path.resolve(dir, sfile) : null
    }
    file = path.resolve(dir, term)
    try {
      fs.statSync(file)
      return file
    } catch (e) { }
  }
  static _prefix(term) {
    // If we have a terminfoFile, or our
    // term looks like a filename, use it.
    if (term) {
      if (~term.indexOf(path.sep)) { return term }
      if (this.terminfoFile) { return this.terminfoFile }
    }
    const paths = Tput.ipaths.slice()
    let file
    if (this.terminfoPrefix) paths.unshift(this.terminfoPrefix)
    // Try exact matches.
    file = this._tprefix(paths, term)
    if (file) return file
    // Try similar matches.
    file = this._tprefix(paths, term, true)
    if (file) return file
    // Not found.
    throw new Error('Terminfo directory not found.')
  }
  // to easily output text with setTimeouts.
  static print() {
    const fake = {
      padding: true,
      bools: { needs_xon_xoff: true, xon_xoff: false }
    }
    return Tput.prototype._print.apply(fake, arguments)
  }
  // See:
  // ~/ncurses/ncurses/tinfo/lib_tparm.c
}

for (const type of SCOPES) {
  const o = Tput._alias[type]
  Object.keys(o).forEach(key => {
    const [ terminfo, termcap ] = o[key]
    Tput.alias[key] = [ terminfo ]
    Tput.alias[key].terminfo = terminfo
    Tput.alias[key].termcap = termcap
  })
}
// Bools
Tput.alias.no_esc_ctlc.push('beehive_glitch')
Tput.alias.dest_tabs_magic_smso.push('teleray_glitch')
// Numbers
Tput.alias.micro_col_size.push('micro_char_size')
Object.keys(Tput.alias).forEach(key => {
  Tput.aliasMap[key] = key
  Tput.alias[key].forEach(k => Tput.aliasMap[k] = key)
})
