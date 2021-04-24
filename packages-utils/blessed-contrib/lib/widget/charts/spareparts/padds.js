export class Padds {
  constructor(options) {
    this.labelX = options.xLabelPadding ?? options.labelX ?? 5
    this.labelY = 3
    this.x = options.xPadding ?? options.x ?? 10
    this.y = 11
  }
  static build(options) { return new Padds(options) }
  get relativeX() { return this.x - this.labelX }
  get relativeY() { return this.y - this.labelY }
  adjustPadding(tickWidth) {
    if (this.labelX < tickWidth) this.labelX = tickWidth
    if ((this.relativeX) < 0) this.x = this.labelX
  }
}