/**
 * TerminfoParser.js - parse and compile terminfo caps to javascript.
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

// Resources:
//   $ man term
//   $ man terminfo
//   http://invisible-island.net/ncurses/man/term.5.html
//   https://en.wikipedia.org/wiki/Terminfo

// Todo:
// - xterm's XT (set-title capability?) value should be true (at least tmux thinks it should).
//   It's not parsed as true. Investigate.
// - Possibly switch to other method of finding the extended data string table: i += h.symOffsetCount * 2;

import { Logger, merge, slice } from '@pres/util-helpers'
import { BOO, FUN, NUM, STR }   from '@typen/enum-data-types'
import { nullish }              from '@typen/nullish'
import assert                   from 'assert'
import cp                       from 'child_process'
import fs                       from 'fs'
import path, { dirname }        from 'path'
import { fileURLToPath }        from 'url'
import { UTOA }                 from '../assets'
import { capToInfo }            from '../util/capToInfo'
import { sprintf, tryRead }     from '../util/helpers'
import { noop }                 from '../util/noop'
import { termPrint }            from '../util/termPrint'
import { whichTerminal }        from '../util/whichTerminal'
import { TerminfoLib }          from './TerminfoLib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCOPES = [ 'booleans', 'numerics', 'literals' ]
const HEADERS = [ 'name', 'names', 'desc', 'file', 'termcap' ]
const USR = __dirname + '/../usr/'

/**
 * Terminfo
 * TerminfoParser
 */
export class TerminfoParser {
  // boo
  // num
  // str
  // all
  // info
  // methods
  // features
  // terminal

  debug = false
  error = null
  utoa = UTOA // Convert ACS unicode characters to the most similar-looking ascii characters.
  #boo = null
  #num = null
  #str = null

  constructor(options = {}) {
    if (typeof options === STR) options = { terminal: options }
    this.configTput(options)
    if (options.terminal || options.term) this.setup()
    console.log('>> [TerminfoParser.constructor]',
      `[booleans] (${Object.keys(this.booleans).length})`,
      `[numerics] (${Object.keys(this.numerics).length})`,
      `[literals] (${Object.keys(this.literals).length})`,
      `[all] (${Object.keys(this.all).length})`,
      `[colors] (${this.colors})`)
  }
  static build(options) {return new TerminfoParser(options)}
  configTput(options) {
    this.options = options
    this.terminal = whichTerminal(options)
    this.debug = options.debug
    this.padding = options.padding
    this.extended = options.extended
    this.printf = options.printf
    this.termcap = options.termcap
    this.terminfoPrefix = options.terminfoPrefix
    this.terminfoFile = options.terminfoFile
    this.termcapFile = options.termcapFile
    console.log(`>> [TerminfoParser.config] [terminal] (${this.terminal}) [termcap] (${!!this.termcap})`)
  }
  setup() {
    this.error = null
    try {
      if (this.termcap) {
        try {
          this.termcap ? this.injectTermcap() : this.injectTerminfo()
        } catch (e) {
          if (this.debug) throw e
          this.error = new Error(`${this.termcap ? 'Termcap' : 'Terminfo'} parse error.`)
          this.#useInternalCap(this.terminal)
        }
      }
      else {
        try {
          this.injectTerminfo()
        } catch (e) {
          if (this.debug) throw e
          this.error = new Error('Terminfo parse error.')
          this.#useInternalInfo(this.terminal)
        }
      }
    } catch (e) {
      // If there was an error, fallback
      // to an internally stored terminfo/cap.
      if (this.debug) throw e
      this.error = new Error('Terminfo not found.')
      this.#useXtermInfo()
    }
  }
  term(is) { return this.terminal.indexOf(is) === 0 }
  #debug() { if (this.debug) return console.log.apply(console, arguments) }

  get booleans() { return this.#boo }
  get numerics() { return this.#num }
  get literals() { return this.#str }

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
  #useVt102Cap() { return this.injectTermcap('vt102') }
  #useXtermCap() { return this.injectTermcap(USR + 'xterm.termcap') }
  #useXtermInfo() { return this.injectTerminfo(USR + 'xterm') }
  #useInternalInfo(name) { return this.injectTerminfo(USR + path.basename(name)) }
  #useInternalCap(name) { return this.injectTermcap(USR + path.basename(name) + '.termcap') }

  _prefix(term) {
    // If we have a terminfoFile, or our term looks like a filename, use it.
    if (term) {
      if (~term.indexOf(path.sep)) return term
      if (this.terminfoFile) return this.terminfoFile
    }
    const paths = TerminfoLib.ipaths.slice()
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
      for (i = 0; i < prefix.length; i++) if (( file = this._tprefix(prefix[i], term, soft) )) return file
      return void 0
    }
    const find = word => {
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
      list.forEach(file => {
        if (file.indexOf(term) === 0) {
          const diff = file.length - term.length
          if (!sfile || diff < sdiff) { sdiff = diff, sfile = file }
        }
      })
      return sfile && ( soft || sdiff === 0 )
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
    let extended
    const h = info.header = {
      dataSize: data.length,
      headerSize: 12,
      magicNumber: ( data[1] << 8 ) | data[0],
      namesSize: ( data[3] << 8 ) | data[2],
      booleanNo: ( data[5] << 8 ) | data[4],
      numericNo: ( data[7] << 8 ) | data[6],
      literalNo: ( data[9] << 8 ) | data[8],
      strTableSize: ( data[11] << 8 ) | data[10]
    }
    h.total = h.headerSize + h.namesSize + h.booleanNo + h.numericNo * 2 + h.literalNo * 2 + h.strTableSize
    let i = 0
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
    info.booleans = {}
    info.numerics = {}
    info.literals = {}

    i += h.namesSize - 1
    // Names is nul-terminated.
    assert.equal(data[i], 0)
    i++

    // Booleans Section
    //  One byte for each flag
    //  Same order as <term.h>
    for (let o = 0, l = i + h.booleanNo; i < l; i++) {
      let v = TerminfoLib.booleans[o++]
      info.booleans[v] = data[i] === 1
    }
    // Null byte in between to make sure numbers begin on an even byte.
    if (i % 2) {
      assert.equal(data[i], 0)
      i++
    }

    // Numbers Section
    for (let o = 0, l = i + h.numericNo * 2; i < l; i += 2) {
      let v = TerminfoLib.numerics[o++]
      if (data[i + 1] === 0xff && data[i] === 0xff) { info.numerics[v] = -1 }
      else { info.numerics[v] = ( data[i + 1] << 8 ) | data[i] }
    }

    // Strings Section
    for (let o = 0, l = i + h.literalNo * 2; i < l; i += 2) {
      let v = TerminfoLib.literals[o++]
      info.literals[v] = data[i + 1] === 0xff && data[i] === 0xff ? -1 : ( data[i + 1] << 8 ) | data[i]
    }
    // String Table
    Object.keys(info.literals).forEach(key => {
      if (info.literals[key] === -1) return void ( delete info.literals[key] )
      // WORKAROUND: fix an odd bug in the screen-256color terminfo where it tries to set -1, but it appears to have {0xfe, 0xff} instead of {0xff, 0xff}.
      // TODO: Possibly handle errors gracefully below, as well as in the extended info. Also possibly do: `if (info.literals[key] >= data.length)`.
      if (info.literals[key] === 65534) return void ( delete info.literals[key] )
      const s = i + info.literals[key]
      let j = s
      while (data[j]) j++
      assert(j < data.length)
      info.literals[key] = data.toString('ascii', s, j)
    })

    Logger.localInfo("terminfo-parser-info", info)
    // Extended Header
    if (this.extended !== false) {
      i--
      i += h.strTableSize
      if (i % 2) {
        assert.equal(data[i], 0)
        i++
      }
      let l = data.length
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
  //   h.symOffsetSize = (h.strTableSize - h.literalNo) * 2;
  parseExtended(data) {
    const info = {}
    let l = data.length,
        i = 0
    const h = info.header = {
      dataSize: data.length,
      headerSize: 10,
      booleanNo: ( data[i + 1] << 8 ) | data[i + 0],
      numericNo: ( data[i + 3] << 8 ) | data[i + 2],
      literalNo: ( data[i + 5] << 8 ) | data[i + 4],
      strTableSize: ( data[i + 7] << 8 ) | data[i + 6],
      lastStrTableOffset: ( data[i + 9] << 8 ) | data[i + 8]
    }
    // h.symOffsetCount = h.strTableSize - h.literalNo;

    h.total = h.headerSize + h.booleanNo + h.numericNo * 2 + h.literalNo * 2 + h.strTableSize

    i += h.headerSize
    // Booleans Section
    // One byte for each flag
    const booleanList = []
    for (let l = i + h.booleanNo; i < l; i++)
      booleanList.push(data[i] === 1)
    // Null byte in between to make sure numbers begin on an even byte.
    if (i % 2) {
      assert.equal(data[i], 0)
      i++
    }
    // Numbers Section
    const numericList = []
    for (let l = i + h.numericNo * 2; i < l; i += 2)
      data[i + 1] === 0xff && data[i] === 0xff
        ? numericList.push(-1)
        : numericList.push(( data[i + 1] << 8 ) | data[i])

    // Strings Section
    const literalList = []

    for (let l = i + h.literalNo * 2; i < l; i += 2)
      data[i + 1] === 0xff && data[i] === 0xff
        ? literalList.push(-1)
        : literalList.push(( data[i + 1] << 8 ) | data[i])
    // Pass over the sym offsets and get to the string table.
    i = data.length - h.lastStrTableOffset
    // Might be better to do this instead if the file has trailing bytes:
    // i += h.symOffsetCount * 2;
    // String Table
    let high = 0
    literalList.forEach((offset, index) => {
      if (offset === -1) return void ( literalList[index] = '' )
      const s = i + offset
      let j = s
      while (data[j]) j++

      assert(j < data.length)
      // Find out where the string table ends by
      // getting the highest string length.
      if (high < j - i) high = j - i
      literalList[index] = data.toString('ascii', s, j)
    })
    // Symbol Table
    // Add one to the highest string length because we didn't count \0.
    i += high + 1

    const sym = []
    for (let l = data.length; i < l; i++) {
      let j = i
      while (data[j]) j++
      sym.push(data.toString('ascii', i, j))
      i = j
    }

    // Identify by name
    let idx = 0
    info.booleans = {}
    info.numerics = {}
    info.literals = {}
    booleanList.forEach(boolean => info.booleans[sym[idx++]] = boolean)
    numericList.forEach(numeric => info.numerics[sym[idx++]] = numeric)
    literalList.forEach(literal => info.literals[sym[idx++]] = literal)
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
    if (!info) throw new Error('Terminal not found.')
    this.detectFeatures(info)
    this.#debug(info)
    const all = info.all = {}
    const methods = info.methods = {}

    // boo, num, str
    for (const scope of SCOPES)
      for (const [ key, value ] of Object.entries(info[scope])) {
        methods[key] = this.#compile(info, key, all[key] = value)
      }

    for (const key of TerminfoLib.booleans) if (nullish(methods[key])) methods[key] = false
    for (const key of TerminfoLib.numerics) if (nullish(methods[key])) methods[key] = -1
    for (const key of TerminfoLib.literals) if (nullish(methods[key])) methods[key] = noop

    for (const [ key, method ] of Object.entries(methods))
      if (TerminfoLib.alias[key])
        for (const alias of TerminfoLib.alias[key]) {
          methods[alias] = method
        }

    // Could just use:
    // Object.keys(TerminfoLib.keyMap).forEach(function(key) {
    //   methods[key] = methods[TerminfoLib.keyMap[key]];
    // });
    return info
  }
  // Some data to help understand:
  inject(info) {
    const self = this

    this.info = info
    this.all = info.all
    this.methods = info.methods
    this.#boo = info.booleans
    this.#num = info.numerics
    this.#str = info.literals
    if (!~info.names.indexOf(this.terminal)) this.terminal = info.name
    this.features = info.features

    for (const [ key, method ] of Object.entries(info.methods || info))
      this[key] = typeof method === FUN
        ? function () { return method.call(self, slice(arguments)) }
        : method
    for (const [ key, feature ] of Object.entries(info.features))
      this[key] = key === 'padding'
        ? ( !feature && this.options.padding !== true ) ? false : this[key]
        : feature
  }
  // ~/ncurses/ncurses/tinfo/comp_scan.c
  #compile(info, key, value) {
    let v
    if (key === 'max_colors') console.log('>> [TerminfoParser.#compile]', key, value)
    this.#debug('Compiling %s: %s', key, JSON.stringify(value))
    const type = typeof value
    if (type === BOO || type === NUM) return value
    if (!value || type !== STR) return noop
    // See:
    // ~/ncurses/progs/tput.c - tput() - L149
    // ~/ncurses/progs/tset.c - set_init() - L992
    if (key === 'init_file' || key === 'reset_file') {
      try {
        value = fs.readFileSync(value, 'utf8')
        if (this.debug) {
          v = ( 'return ' + JSON.stringify(value) + ';' )
            .replace(/\x1b/g, '\\x1b')
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
          process.stdout.write(v + '\n')
        }
        return function () { return value }
      } catch (e) {
        return noop
      }
    }
    const tkey   = info.name + '.' + key,
          header = 'var v, dyn = {}, stat = {}, stack = [], out = [];',
          footer = ';return out.join("");'
    let code = header,
        val  = value,
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
    function expr(c) { code += c + ',' }
    function echo(c) { return c === '""' ? void 0 : expr('out.push(' + c + ')') }
    function print(c) {buff += c}
    function clear() {
      if (buff) {
        echo(JSON.stringify(buff).replace(/\\u00([0-9a-fA-F]{2})/g, '\\x$1'))
        buff = ''
      }
    }
    while (val) {
      // Ignore newlines
      if (read(/^\n /, true)) continue
      // '^A' -> ^A
      if (read(/^\^(.)/i, true)) {
        if (!( ' ' <= ch && ch <= '~' )) {
          this.#debug('%s: bad caret char.', tkey)
          // NOTE: ncurses appears to simply
          // continue in this situation, but
          // I could be wrong.
          print(cap[0])
          continue
        }
        if (ch === '?') {ch = '\x7f'}
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
                                    : ( this.#debug('%s: bad backslash char.', tkey), cap[0] )
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
        expr('(stack.push(v = params[' + ( ch - 1 ) + ']), v)')
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
        if (ch === '=') {ch = '==='}
        else if (ch === 'm') {ch = '%'}
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
          + ( ch === 'A' ? '&&' : '||' )
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
        if (then !== -1 && then < end && ( fi === -1 || then < fi ) && ( els === -1 || then < els )) { stmt('} else if (') }
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
    else if (( v = /^out\.push\(("(?:[^"]|\\")+")\)$/.exec(v) )) { code = 'return ' + v[1] + ';' }
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
    // seem to have a few broken literals.
    if (value === '\u001b%?') code = 'return "\\x1b";'
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
      console.error(JSON.stringify(value))
      console.error('')
      console.error(code.replace(/(,|;)/g, '$1\n'))
      e.stack = e.stack.replace(/\x1b/g, '\\x1b')
      throw e
    }
  }
  // See: ~/ncurses/ncurses/tinfo/lib_tputs.c
  _print(code, print, done) { return termPrint.call(this, code, print, done)}
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
          term.booleans = {}
          term.numerics = {}
          term.literals = {}
          continue
        }
        if (~field.indexOf('=')) {
          parts = field.split('=')
          term.literals[parts[0]] = parts.slice(1).join('=')
        }
        else if (~field.indexOf('#')) {
          parts = field.split('#')
          term.numerics[parts[0]] = +parts.slice(1).join('#')
        }
        else {
          term.booleans[field] = true
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
    console.log(`>> [TerminfoParser.translateTermcap] ${info}`)
    const self = this,
          out  = {}
    if (!info) return
    this.#debug(info)
    HEADERS.forEach(key => out[key] = info[key])
    // Separate aliases for termcap
    const map = ( () => {
      const out = {}
      Object.keys(TerminfoLib.alias).forEach(key => {
        const aliases = TerminfoLib.alias[key]
        out[aliases.termcap] = key
      })
      return out
    } )()
    // Translate termcap cap names to terminfo cap names.
    // e.g. `up` -> `cursor_up`
    SCOPES.forEach(key => {
      const source = info[key],
            target = out[key] = {}
      Object.keys(source).forEach(cap => {
        if (key === STR) info.literals[cap] = capToInfo.call(self, cap, info.literals[cap], 1)
        if (map[cap]) { target[map[cap]] = source[cap] }
        else {
          // NOTE: Possibly include all termcap names
          // in a separate alias.js file. Some are
          // missing from the terminfo alias.js file
          // which is why we have to do this:
          // See: $ man termcap
          target[cap] = source[cap]
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
  detectFeatures(info) {
    /**
     * Detect Features / Quirks
     */
    const data = this.parseACS(info)
    info.features = {
      unicode: this.detectUnicode(info),
      brokenACS: this.detectBrokenACS(info),
      PCRomSet: this.detectPCRomSet(info),
      magicCookie: this.detectMagicCookie(info),
      padding: this.detectPadds(info),
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
    if (( info.numerics || info.numerics )?.U8 >= 0) return !!( info.numerics || info.numerics ).U8
    // The linux console is just broken for some reason.
    // Apparently the Linux console does not support ACS,
    // but it does support the PC ROM character set.
    if (info.name === 'linux') return true
    // PC alternate charset
    // if (acsc.indexOf('+\x10,\x11-\x18.\x190') === 0) {
    if (this.detectPCRomSet(info)) return true
    // screen termcap is bugged?
    if (this.termcap &&
      info.name.indexOf('screen') === 0 && process.env.TERMCAP && ~process.env.TERMCAP.indexOf('screen') && ~process.env.TERMCAP.indexOf('hhII00')) {
      if (~info.literals.enter_alt_charset_mode.indexOf('\x0e') ||
        ~info.literals.enter_alt_charset_mode.indexOf('\x0f') ||
        ~info.literals.set_attributes.indexOf('\x0e') ||
        ~info.literals.set_attributes.indexOf('\x0f')) {
        return true
      }
    }
    return false
  }
  // See: ~/ncurses/ncurses/tinfo/lib_acs.c
  detectPCRomSet(info) {
    const s = info.literals
    return !!(
      s.enter_pc_charset_mode &&
      s.enter_alt_charset_mode &&
      s.enter_pc_charset_mode === s.enter_alt_charset_mode &&
      s.exit_pc_charset_mode === s.exit_alt_charset_mode
    )
  }
  detectMagicCookie() { return process.env.NCURSES_NO_MAGIC_COOKIE == null }
  detectPadds() { return process.env.NCURSES_NO_PADDING == null }
  detectSetbuf() { return process.env.NCURSES_NO_SETBUF == null }
  parseACS(info) {
    const data = {}
    data.acsc = {}
    data.acscr = {}
    // Possibly just return an empty object, as done here, instead of
    // specifically saying ACS is "broken" above. This would be more
    // accurate to ncurses logic. But it doesn't really matter.
    if (this.detectPCRomSet(info)) { return data }
    // See: ~/ncurses/ncurses/tinfo/lib_acs.c: L208
    Object.keys(TerminfoLib.acsc).forEach(ch => {
      const acs_chars = info.literals.acs_chars || '',
            i         = acs_chars.indexOf(ch),
            next      = acs_chars[i + 1],
            value     = TerminfoLib.acsc[next]
      if (!next || i === -1 || !value) { return }
      data.acsc[ch] = value
      data.acscr[value] = ch
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
    return !ccp ? -1 : ( ccp = +ccp[0], ccp )

  }
  has(name) {
    name = TerminfoLib.keyMap[name]
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
    if (~term.indexOf(path.sep) && ( terms = this._tryCap(path.resolve(term)) )) {
      term_ = path.basename(term).split('.')[0]
      term = terms[process.env.TERM] ? process.env.TERM : terms[term_] ? term_ : Object.keys(terms)[0]
    }
    else {
      paths = TerminfoLib.cpaths.slice()
      if (this.termcapFile) paths.unshift(this.termcapFile)
      paths.push(TerminfoLib.termcap)
      terms = this._tryCap(paths, term)
    }
    if (!terms) throw new Error('Cannot find termcap for: ' + term)
    root = terms[term]
    if (this.debug) this._termcap = terms
    (function tc(term) {
      if (term && term.literals.tc) {
        root.inherits = root.inherits || []
        root.inherits.push(term.literals.tc)
        const names = terms[term.literals.tc]
          ? terms[term.literals.tc].names
          : [ term.literals.tc ]
        self.#debug('%s inherits from %s.',
          term.names.join('/'), names.join('/'))
        const inherit = tc(terms[term.literals.tc])
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
    return /utf-?8/i.test(LANG) || ( this.GetConsoleCP() === 65001 )
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
    // console.log('>> [tput.readTerminfo]', term, 'max_colors', info.numerics.max_colors)
    if (term.endsWith('xterm')) info.numerics.max_colors = 256
    return info
  }
}