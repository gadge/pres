import { assignDeep } from '@pres/util-helpers'

const SPACING = 0

export class Grid {
  constructor(options) {
    if (!options.screen) throw 'Error: A screen property must be specified in the grid options.\r\n' +
    'Note: Release 2.0.0 has breaking changes. Please refer to the README or to https://github.com/yaronn/blessed-contrib/issues/39'
    this.screen = options.screen
    this.colNo = options.cols ?? 12
    this.rowNo = options.rows ?? 12
    this.margin = options.dashboardMargin ?? 0
    this.unit = {
      h: ( ( 100 - this.margin * 2 ) / this.rowNo ),
      w: ( ( 100 - this.margin * 2 ) / this.colNo ),
      border: { type: 'line', fg: options.color ?? 'cyan' }
    }
    this.hideBorder = !!options.hideBorder
  }
  static build(options) { return new Grid(options) }
  set(t, l, h, w, component, options) {
    if (component instanceof Grid) {
      throw 'Error: A Grid is not allowed to be nested inside another grid.\r\n' +
      'Note: Release 2.0.0 has breaking changes. Please refer to the README or to https://github.com/yaronn/blessed-contrib/issues/39'
    }
    //var options = JSON.parse(JSON.stringify(opts));
    let p = {}
    p = assignDeep(p, options)
    p.top = ( t * this.unit.h + this.margin ) + '%'
    p.left = ( l * this.unit.w + this.margin ) + '%'
    p.height = ( this.unit.h * h - SPACING ) + '%'
    p.width = ( this.unit.w * w - SPACING ) + '%'
    if (!this.hideBorder) p.border = this.unit.border
    const instance = component(p)
    this.screen.append(instance)
    return instance
  }
}
