export class Bars {
  constructor(options) {
    this.width = options.barWidth ?? options.width ?? 6
    this.spacing = options.barSpacing ?? options.spacing ?? 9
    if ((this.spacing - this.width) < 3) this.spacing = this.width + 3
    this.preset = {
      fore: options.barFgColor ?? options.preset.fore ?? 'white',
      back: options.barBgColor ?? options.preset.back ?? 'blue',
      label: options.labelColor ?? options.preset.label ?? 'white'
    }
  }
  static build(options) { return new Bars(options) }
}