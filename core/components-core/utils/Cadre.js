import { NUM, OBJ } from '@typen/enum-data-types'

export class Cadre {
  constructor(t, b, l, r) {
    this.t = t
    this.b = b
    this.l = l
    this.r = r
  }
  static build(o) {
    const t = typeof o
    if (!o || t === NUM) return ( o = o ?? 0, new Cadre(o, o, o, o) )
    if (t === OBJ) return new Cadre(o.t ?? o.top ?? 0, o.b ?? o.bottom ?? 0, o.l ?? o.left ?? 0, o.r ?? o.right ?? 0)
    return new Cadre(0, 0, 0, 0)
  }
  get any() { return this.t || this.b || this.l || this.r }
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
  get dVert() { return this.b - this.t}
  get dHori() { return this.r - this.l }
}