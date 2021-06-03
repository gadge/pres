import { CSI }                            from '@pres/enum-control-chars'
import { SGR }                            from '@pres/enum-csi-codes'
import { byteToBackSgra, byteToForeSgra } from '@pres/util-byte-colors'
import * as colors                        from '@pres/util-colors'
import { DOT }                            from '@texting/enum-chars'
import { DEF, NUM, STR }                  from '@typen/enum-data-types'
import { concatSgr }                      from '../util'
import { modeToSgra }                     from './modeToSgra'

export class Mor extends Array {
  constructor(at, ch) { super(at, ch) }

  assign(mor) { return this.at = mor.at, this.ch = mor.ch, this}
  inject(at, ch) { return this.at = at, ch ? ( this.ch = ch ) : void 0, this }

  static by(mor) { return new Mor(mor[0], mor[1]) }
  static build(at, ch) { return new Mor(at, ch) }
  static init(mode, fore, back, ch) { return new Mor(( mode & 0x1ff ) << 18 | ( fore & 0x1ff ) << 9 | ( back & 0x1ff ), ch) }

  get at() { return this[0] }
  set at(value) { return this[0] = value }
  get ch() { return this[1] }
  set ch(value) { return this[1] = value }

  get mode() { return this.at >> 18 & 0x1ff }
  get fore() { return this.at >> 9 & 0x1ff }
  get back() { return this.at & 0x1ff }
  set mode(value) { return this.at &= ~( 0x1ff << 18 ) , this.at |= ( value & 0x1ff ) << 18 }
  set fore(value) { return this.at &= ~( 0x1ff << 9 ) , this.at |= ( value & 0x1ff ) << 9 }
  set back(value) { return this.at &= ~( 0x1ff << 0 ) , this.at |= ( value & 0x1ff ) }

  get foreValid() { return this.fore !== 0x1ff }
  get backValid() { return this.back !== 0x1ff }

  clearMode() { return this.mode = 0, this }
  clearFore() { return this.fore = 0, this }
  clearBack() { return this.back = 0, this }
  clearChar() { delete this.ch, this }
  clear() { return this.at = 0, this }

  get bold() { return !!( this.mode & 1 ) }
  get underline() { return !!( this.mode & 2 ) }
  get blink() { return !!( this.mode & 4 ) }
  get inverse() { return !!( this.mode & 8 ) }
  get hide() { return !!( this.mode & 16 ) }
  set bold(value) { return value ? ( this.mode |= 1 ) : ( this.mode &= ~1 ) }
  set underline(value) { return value ? ( this.mode |= 2 ) : ( this.mode &= ~2 ) }
  set blink(value) { return value ? ( this.mode |= 4 ) : ( this.mode &= ~4 ) }
  set inverse(value) { return value ? ( this.mode |= 8 ) : ( this.mode &= ~8 ) }
  set hide(value) { return value ? ( this.mode |= 16 ) : ( this.mode &= ~16 ) }

  get modeSign() {
    const mode = this.mode
    let tx = ''
    tx += mode & 1 ? 'B' : '-' // bold
    tx += mode & 2 ? 'U' : '-' // underline
    tx += mode & 4 ? 'B' : '-' // blink
    tx += mode & 8 ? 'I' : '-' // inverse
    tx += mode & 16 ? 'H' : '-' // hide
    return tx
  }

  clearBold() {
    let at = this.at
    let mode = at >> 18 & 0x1ff // get mode part
    mode &= ~1 // set bold of mode part to false
    at &= ~( 0x1ff << 18 ) // clear mode part of attr
    at |= ( mode & 0x1ff ) << 18 //  paste mode back to attr
    return Mor.build(at, this.ch)
  }

  atEq(mor) { return this.at === mor.at }
  chEq(mor) { return this.ch === mor.ch }
  eq(mor) { return this.at === mor.at && this.ch === mor.ch }
  toSgr(total = 256) {
    let fore = this.fore,
        back = this.back
    let out = modeToSgra(this.mode)
    out = concatSgr(out, byteToForeSgra(fore !== 0x1ff ? colors.reduce(fore, total) : fore))
    out = concatSgr(out, byteToBackSgra(back !== 0x1ff ? colors.reduce(back, total) : back))
    return CSI + out + SGR
  }
  render(text) { return this.toSgr() + text + CSI + SGR }
  toString() { return this.modeSign + String(this.fore).padStart(3, '0') + DOT + String(this.back).padStart(3, '0') }
  [Symbol.toPrimitive](hint) {
    if (hint === NUM) { return ( this.mode & 0x1FF ) << 18 | ( this.fore & 0X1FF ) << 9 | this.back & 0x1FF }
    if (hint === STR) { return this.render(this.toString()) }
    if (hint === DEF) { return this.render(this.toString()) }
    return this.render(this.toString())
  }
  copy() { return Mor.by(this) }
  toArray() { return [ this.at, this.ch ] }
}