import { rgbToInt }         from '@palett/convert'
import { SC }               from '@texting/enum-chars'
import { mixColors }        from './colors'
import { presaToPrimitive } from './presaToPrimitive'

// const NAC    = 1 << 24
const NAC  = null
const GREY = rgbToInt([ 127, 127, 127 ])

export class Presa extends Array {
  constructor(e = null, f = null, b = null, c) {
    super(e, f, b)
    if (c) this.ch = c
  }
  static build() { return new Presa() }
  static by(presa, ch) { return new Presa(presa[0], presa[1], presa[2], ch ?? presa.ch) }
  [Symbol.toPrimitive](h) { return presaToPrimitive.call(this, h) }
  toString() { return presaToPrimitive.call(this) }
  get style() { return this[0] }
  set style(value) { return this[0] = value }
  get fore() { return this[1] }
  set fore(value) { return this[1] = value }
  get back() { return this[2] }
  set back(value) { return this[2] = value }
  inject(e, f, b, c) {
    this[0] = e
    this[1] = f
    this[2] = b
    if (c) this.ch = c
    return this
  }
  assign(source, char) {
    this[0] = source[0]
    this[1] = source[1]
    this[2] = source[2]
    if (char) this.ch = char
    return this
  }
  copy(ch) { return new Presa(this[0], this[1], this[2], ch ?? this.ch) }
  shallow() {
    const vec = this.slice()
    vec.ch    = this.ch
    return vec
  }
  eq(y) {
    if (this === y) return true
    if (!this) return false
    if (!y) return false
    return this[0] === y[0] && this[1] === y[1] && this[2] === y[2]
  }
  blend(support, alpha) {
    if (support) { // if right provided: mixColors
      let [ , f_, b_ ] = this,
          [ , _f, _b ] = support
      if (b_ === NAC) b_ = 0 // if left is NAC: left is noir
      if (_b === NAC) _b = 0 // if right is NAC: right is noir
      b_ = mixColors(b_, _b, alpha) // mix
      if (f_ === NAC) { f_ = GREY } // if left is NAC: left is grey
      else {
        if (_f === NAC) _f = GREY // if right is NAC: right is grey
        f_ = mixColors(f_, _f, alpha) // mix
      }
      this[1] = f_, this[2] = b_
    }
    else {

    }
    return this
  }
  reblend(main, alpha) {
    if (main) { // if right provided: mixColors
      let [ , f_, b_ ] = this,
          [ , _f, _b ] = main
      if (b_ === NAC) b_ = 0 // if left is NAC: left is noir
      if (_b === NAC) _b = 0 // if right is NAC: right is noir
      _b = mixColors(_b, b_, alpha) // mix
      if (_f === NAC) { _f = GREY } // if left is NAC: left is grey
      else {
        if (f_ === NAC) f_ = GREY // if right is NAC: right is grey
        _f = mixColors(_f, f_, alpha) // mix
      }
      this[1] = _f, this[2] = _b
    }
    return this
  }
  mergeSGR(sgrAttr, norm) {
    const vec = sgrAttr.slice(2, -1).split(';')
    if (!vec[0]) vec[0] = '0'
    let [ e, f, b ] = this
    for (let i = 0, hi = vec.length, c; i < hi; i++) {
      c = +vec[i] || 0
      if (c === 0) { [ e, f, b ] = norm } // normal / reset
      else if (c === 1) { e |= 1 } // bold
      else if (c === 4) { e |= 2 } // underline
      else if (c === 5) { e |= 4 } // blink
      else if (c === 7) { e |= 8 } // inverse
      else if (c === 8) { e |= 16 } // invisible / conceal / hide
      else if (c === 22) { e = norm[0] } // normal intensity
      else if (c === 24) { e = norm[0] } // not underlined
      else if (c === 25) { e = norm[0] } // not blink
      else if (c === 27) { e = norm[0] } // not inverse / reversed
      else if (c === 28) { e = norm[0] } // not conceal / reveal
      else if (c >= 30 && c <= 37) { f = c - 30 } // color
      else if (c === 38) {
        if (+vec[i + 1] === 5) { i += 2, f = +vec[i] }
        else if (+vec[i + 1] === 2) { ++i , f = vec[++i] + SC + vec[++i] + SC + vec[++i] }
      }
      else if (c === 39) { f = norm[1] } // default fg
      else if (c >= 40 && c <= 47) { b = c - 40 }
      else if (c === 48) {
        if (+vec[i + 1] === 5) { i += 2, b = +vec[i] }
        else if (+vec[i + 1] === 2) { ++i , b = vec[++i] + SC + vec[++i] + SC + vec[++i] }
      }
      else if (c === 49) { b = norm[2] } // default bg
      else if (c === 100) { f = norm[1], b = norm[2] } // default fg/bg
      else if (c >= 90 && c <= 97) { f = c - 90, f += 8 }
      else if (c >= 100 && c <= 107) { b = c - 100, b += 8 }
    }
    return this.inject(this, e, f, b)
  }
  get effectCollection() {
    const [ e ] = this
    let t       = ''
    t += e & 1 ? 'B' : '-' // bold
    t += e & 2 ? 'U' : '-' // underline
    t += e & 4 ? 'B' : '-' // blink
    t += e & 8 ? 'I' : '-' // inverse
    t += e & 16 ? 'H' : '-' // hide
    return t
  }
  get bold() { return this[0] & 1 }
  get underline() { return this[0] & 2 }
  get blink() { return this[0] & 4 }
  get inverse() { return this[0] & 8 }
  get hide() { return this[0] & 16 }
  static equal(x, y) { return x[0] === y[0] && x[1] === y[1] && x[2] === y[2] }
}
