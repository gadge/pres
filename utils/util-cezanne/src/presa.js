import { SC } from '@texting/enum-chars'

export class Presa extends Array {
  constructor() {
    super(3) // this[0] = e, this[1] = f, this[2] = b
  }
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
  shallow() {
    const vec = this.slice()
    vec.ch = this.ch
    return vec
  }
  eq(y) { return this[0] === y[0] && this[1] === y[1] && this[2] === y[2] }

  mergeSGR(sgrAttr, norm) {
    const vec = sgrAttr.slice(2, -1).split(';')
    if (!vec[0]) vec[0] = '0'
    let effect, fore, back
    if (this) { [ effect, fore, back ] = this }
    for (let i = 0, hi = vec.length, c; i < hi; i++) {
      c = +vec[i] || 0
      if (c === 0) { [ effect, fore, back ] = norm } // normal / reset
      else if (c === 1) { effect |= 1 } // bold
      else if (c === 4) { effect |= 2 } // underline
      else if (c === 5) { effect |= 4 } // blink
      else if (c === 7) { effect |= 8 } // inverse
      else if (c === 8) { effect |= 16 } // invisible / conceal / hide
      else if (c === 22) { effect = norm[0] } // normal intensity
      else if (c === 24) { effect = norm[0] } // not underlined
      else if (c === 25) { effect = norm[0] } // not blink
      else if (c === 27) { effect = norm[0] } // not inverse / reversed
      else if (c === 28) { effect = norm[0] } // not conceal / reveal
      else if (c >= 30 && c <= 37) { fore = c - 30 } // color
      else if (c === 38) {
        if (+vec[i + 1] === 5) { i += 2, fore = +vec[i] }
        else if (+vec[i + 1] === 2) { ++i , fore = vec[++i] + SC + vec[++i] + SC + vec[++i] }
      }
      else if (c === 39) { fore = norm[1] } // default fg
      else if (c >= 40 && c <= 47) { back = c - 40 }
      else if (c === 48) {
        if (+vec[i + 1] === 5) { i += 2, back = +vec[i] }
        else if (+vec[i + 1] === 2) { ++i , back = vec[++i] + SC + vec[++i] + SC + vec[++i] }
      }
      else if (c === 49) { back = norm[2] } // default bg
      else if (c === 100) { fore = norm[1], back = norm[2] } // default fg/bg
      else if (c >= 90 && c <= 97) { fore = c - 90, fore += 8 }
      else if (c >= 100 && c <= 107) { back = c - 100, back += 8 }
    }
    return this ? Presa.prototype.inject.call(this, effect, fore, back) : [ effect, fore, back ]
  }

  static inject = Presa.prototype.inject
  static assign = Presa.prototype.assign
  static shallow = Presa.prototype.shallow

  static equal(x, y) { return x[0] === y[0] && x[1] === y[1] && x[2] === y[2] }
}