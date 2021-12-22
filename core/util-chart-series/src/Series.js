import { unwind } from '@vect/entries-unwind'

export class Series {
  constructor(x, y, title, style) {
    this.title = title
    this.style = style
    this.xs = x ?? []
    this.ys = y ?? []
  }
  get x() { return this.xs }
  set x(vec) { return this.xs = vec }
  get y() { return this.ys }
  set y(vec) { return this.ys = vec }
  get xValues() { return this.xs }
  set xValues(vec) { return this.xs = vec }
  get values() { return this.ys }
  set values(vec) { return this.ys = vec }
  static fromEntries(entries, title) {
    const [ xs, ys ] = unwind(entries)
    return new Series(xs, ys, title)
  }
}