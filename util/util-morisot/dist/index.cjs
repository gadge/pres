'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var enumAnsiCodes = require('@palett/enum-ansi-codes')
var utilSgrMode = require('@pres/util-sgr-mode')
var utilSgrAttr = require('@pres/util-sgr-attr')
var enumChars = require('@texting/enum-chars')
var enumDataTypes = require('@typen/enum-data-types')

class Mor extends Array {
  constructor(at, ch) {
    super(at, ch)
  }
  get at() {
    return this[0]
  }
  set at(value) {
    return this[0] = value
  }
  get ch() {
    return this[1]
  }
  set ch(value) {
    return this[1] = value
  }
  get mode() {
    return this.at >> 18 & 0x1ff
  }
  set mode(value) {
    return this.at &= ~( 0x1ff << 18 ), this.at |= ( value & 0x1ff ) << 18
  }
  get fore() {
    return this.at >> 9 & 0x1ff
  }
  set fore(value) {
    return this.at &= ~( 0x1ff << 9 ), this.at |= ( value & 0x1ff ) << 9
  }
  get back() {
    return this.at & 0x1ff
  }
  set back(value) {
    return this.at &= ~( 0x1ff << 0 ), this.at |= value & 0x1ff
  }
  get foreValid() {
    return this.fore !== 0x1ff
  }
  get backValid() {
    return this.back !== 0x1ff
  }
  get bold() {
    return !!( this.mode & 1 )
  }
  set bold(value) {
    return value ? this.mode |= 1 : this.mode &= ~1
  }
  get underline() {
    return !!( this.mode & 2 )
  }
  set underline(value) {
    return value ? this.mode |= 2 : this.mode &= ~2
  }
  get blink() {
    return !!( this.mode & 4 )
  }
  set blink(value) {
    return value ? this.mode |= 4 : this.mode &= ~4
  }
  get inverse() {
    return !!( this.mode & 8 )
  }
  set inverse(value) {
    return value ? this.mode |= 8 : this.mode &= ~8
  }
  get hide() {
    return !!( this.mode & 16 )
  }
  set hide(value) {
    return value ? this.mode |= 16 : this.mode &= ~16
  }
  get modeSign() {
    return utilSgrMode.modeToSign(this.mode)
  }
  static by(mor) {
    return new Mor(mor[0], mor[1])
  }
  static build(at, ch) {
    return new Mor(at, ch)
  }
  static init(mode, fore, back, ch) {
    return new Mor(( mode & 0x1ff ) << 18 | ( fore & 0x1ff ) << 9 | back & 0x1ff, ch)
  }
  assign(mor) {
    return this.at = mor.at, this.ch = mor.ch, this
  }
  inject(at, ch) {
    return this.at = at, ch ? this.ch = ch : void 0, this
  }
  clearMode() {
    return this.mode = 0, this
  }
  clearFore() {
    return this.fore = 0, this
  }
  clearBack() {
    return this.back = 0, this
  }
  clearChar() {
    delete this.ch
  }
  clear() {
    return this.at = 0, this
  }
  atEq(mor) {
    return this.at === mor.at
  }

  chEq(mor) {
    return this.ch === mor.ch
  }

  eq(mor) {
    return this.at === mor.at && this.ch === mor.ch
  }

  toSgr(total) {
    return utilSgrAttr.attrToSgra(this.at, total)
  }

  render(text) {
    return this.toSgr() + text + enumAnsiCodes.CSI + enumAnsiCodes.SGR
  }

  toString() {
    return this.modeSign + String(this.fore).padStart(3, '0') + enumChars.DOT + String(this.back).padStart(3, '0')
  }

  [Symbol.toPrimitive](hint) {
    if (hint === enumDataTypes.NUM) {
      return ( this.mode & 0x1FF ) << 18 | ( this.fore & 0X1FF ) << 9 | this.back & 0x1FF
    }

    if (hint === enumDataTypes.STR) {
      return this.render(this.toString())
    }

    if (hint === enumDataTypes.DEF) {
      return this.render(this.toString())
    }

    return this.render(this.toString())
  }

  copy() {
    return Mor.by(this)
  }

  toArray() {
    return [ this.at, this.ch ]
  }

} // clearBold() { return Mor.build(( this.at & ~( 0x1ff << 18 ) ) | ( ( this.mode & ~1 ) << 18 ), this.ch) }

exports.Mor = Mor
