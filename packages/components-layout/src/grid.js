import { assignDeep } from '@pres/util-helpers'

const SPACING = 0

export class Grid {
  constructor(options) {
    if (!options.screen) throw 'Error: A screen property must be specified in the grid options.\r\n' +
    'Note: Release 2.0.0 has breaking changes. Please refer to the README or to https://github.com/yaronn/blessed-contrib/issues/39'
    this.options = options
    this.options.dashboardMargin = this.options.dashboardMargin || 0
    this.cellWidth = ((100 - this.options.dashboardMargin * 2) / this.options.cols)
    this.cellHeight = ((100 - this.options.dashboardMargin * 2) / this.options.rows)
  }
  static build(options) { return new Grid(options) }
  set(row, col, rowSpan, colSpan, obj, opts) {
    if (obj instanceof Grid) {
      throw 'Error: A Grid is not allowed to be nested inside another grid.\r\n' +
      'Note: Release 2.0.0 has breaking changes. Please refer to the README or to https://github.com/yaronn/blessed-contrib/issues/39'
    }
    const top = row * this.cellHeight + this.options.dashboardMargin
    const left = col * this.cellWidth + this.options.dashboardMargin
    //var options = JSON.parse(JSON.stringify(opts));
    let options = {}
    options = assignDeep(options, opts)
    options.top = top + '%'
    options.left = left + '%'
    options.width = (this.cellWidth * colSpan - SPACING) + '%'
    options.height = (this.cellHeight * rowSpan - SPACING) + '%'
    if (!this.options.hideBorder) options.border = { type: 'line', fg: this.options.color || 'cyan' }
    const instance = obj(options)
    this.options.screen.append(instance)
    return instance
  }
}
