import { NUM, OBJ } from '@typen/enum-data-types'

export class Cadre {
  constructor(t = 0, b = 0, l = 0, r = 0) {
    this.t = t
    this.b = b
    this.l = l
    this.r = r
  }
  static build(o) {
    const t = typeof o
    if (!o || t === NUM) return new Cadre(o, o, o, o)
    if (t === OBJ) return new Cadre(o.t ?? o.top, o.b ?? o.bottom, o.l ?? o.left, o.r ?? o.right)
    return new Cadre(0, 0, 0, 0)
  }
  get top() { return this.t }
  get bottom() { return this.b }
  get left() { return this.l }
  get right() { return this.r }
  set top(val) { return this.t = val }
  set bottom(val) { return this.b = val }
  set left(val) { return this.l = val }
  set right(val) { return this.r = val }
  get vert() { return this.t + this.b }
  get hori() { return this.l + this.r }
}