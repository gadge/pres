export class Detic {
  constructor(t, b, l, r, h, w) {
    this.t = t
    this.b = b
    this.l = l
    this.r = r
    this.h = h
    this.w = w
  }
  static build(o) {
    return new Detic(
      o.top ?? o.t,
      o.bottom ?? o.b,
      o.left ?? o.l,
      o.right ?? o.r,
      o.height ?? o.h,
      o.width ?? o.w,
    )
  }
  get top() { return this.t }
  get bottom() { return this.b }
  get left() { return this.l }
  get right() { return this.r }
  get height() { return this.h }
  get width() { return this.w }
  set top(val) { return this.t = val }
  set bottom(val) { return this.b = val }
  set left(val) { return this.l = val }
  set right(val) { return this.r = val }
  set height(val) { return this.h = val }
  set width(val) { return this.w = val }
}
