import { rgbToInt }       from '@palett/convert'
import { SC }             from '@texting/enum-chars'
import { mixColors }      from './blender'
import { lumToPrimitive } from './lumToPrimitive'

// const NAC    = 1 << 24
const NAC = null
const GREY = rgbToInt([ 127, 127, 127 ])

export class Lum {
  constructor(m = null, f = null, b = null, c) {
    this.m = m
    this.f = f
    this.b = b
    if (c) this.ch = c
  }
  static build(m, f, b, c) { return new Lum(m, f, b, c) }
  static from(lum, c) { return new Lum(lum.m, lum.f, lum.b, c ?? lum.ch) }
  [Symbol.toPrimitive](h) { return lumToPrimitive.call(this, h) }
  toString() { return lumToPrimitive.call(this) }
  get mode() { return this.m }
  set mode(value) { return this.m = value }
  get fore() { return this.f }
  set fore(value) { return this.f = value }
  get back() { return this.b }
  set back(value) { return this.b = value }
  inject(m, f, b, c) {
    this.m = m
    this.f = f
    this.b = b
    if (c) this.ch = c
    return this
  }
  assign(lum, ch) {
    this.m = lum.m
    this.f = lum.f
    this.b = lum.b
    if (ch) this.ch = ch
    return this
  }
  copy(ch) { return new Lum(this.m, this.f, this.b, ch ?? this.ch) }
  eq(some) {
    return this === some
      ? true
      : this?.m === some?.m && this.f === some.f && this.b === some.b
  }
  blend(some, alpha) {
    if (some) { // if right provided: mixColors
      let [ , f_, b_ ] = this,
          [ , _f, _b ] = some
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
    let { m, f, b } = this
    for (let i = 0, hi = vec.length, c; i < hi; i++) {
      c = +vec[i] || 0
      if (c === 0) { ( { m, f, b } = norm ) } // normal / reset
      else if (c === 1) { m |= 1 } // bold
      else if (c === 4) { m |= 2 } // underline
      else if (c === 5) { m |= 4 } // blink
      else if (c === 7) { m |= 8 } // inverse
      else if (c === 8) { m |= 16 } // invisible / conceal / hide
      else if (c === 22) { m = norm.m } // normal intensity
      else if (c === 24) { m = norm.m } // not underlined
      else if (c === 25) { m = norm.m } // not blink
      else if (c === 27) { m = norm.m } // not inverse / reversed
      else if (c === 28) { m = norm.m } // not conceal / reveal
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
    return this.inject(m, f, b)
  }
  get modeSign() {
    const { m } = this
    let tx = ''
    tx += m & 1 ? 'B' : '-' // bold
    tx += m & 2 ? 'U' : '-' // underline
    tx += m & 4 ? 'B' : '-' // blink
    tx += m & 8 ? 'I' : '-' // inverse
    tx += m & 16 ? 'H' : '-' // hide
    return tx
  }
  get bold() { return this.m & 1 }
  get underline() { return this.m & 2 }
  get blink() { return this.m & 4 }
  get inverse() { return this.m & 8 }
  get hide() { return this.m & 16 }
}
