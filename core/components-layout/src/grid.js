import { roundD2, roundD4 } from '@aryth/math'
import { Cadre }            from '@pres/components-core'
import { assignDeep }       from '@pres/util-helpers'

const SPACING = 0

export class Grid {
  constructor(options) {
    if (!options.screen) throw 'Error: A screen property must be specified in the grid options.\r\n' +
    'Note: Release 2.0.0 has breaking changes. Please refer to the README or to https://github.com/yaronn/blessed-contrib/issues/39'
    this.screen = options.screen
    this.colNo = options.cols ?? 12
    this.rowNo = options.rows ?? 12
    this.margin = Cadre.build(options.margin)
    this.unit = {
      h: roundD4(( 100 - this.margin.vert ) / this.rowNo), // roundD2(( 100 - this.margin * 2 ) / this.rowNo),
      w: roundD4(( 100 - this.margin.hori ) / this.colNo), // roundD2(( 100 - this.margin * 2 ) / this.colNo),
      border: { type: 'line', fg: options.color ?? 'cyan' }
    }
    this.hideBorder = options.hideBorder
  }
  static build(options) { return new Grid(options) }

  add = this.set
  set(t, l, h, w, component, options) {
    if (component instanceof Grid) {
      throw 'Error: A Grid is not allowed to be nested inside another grid.\r\n' +
      'Note: Release 2.0.0 has breaking changes. Please refer to the README or to https://github.com/yaronn/blessed-contrib/issues/39'
    }
    //var options = JSON.parse(JSON.stringify(opts));
    let p = {}
    p = assignDeep(p, options)
    p.top = options.t ?? ( roundD2(t * this.unit.h) + '%' + ( this.margin.t ? '+' + this.margin.t : '' ) )  // ( t * this.unit.h + this.margin ) + '%'
    p.left = options.l ?? ( roundD2(l * this.unit.w) + '%' + ( this.margin.l ? '+' + this.margin.l : '' ) ) // ( l * this.unit.w + this.margin ) + '%'
    p.height = options.h ?? ( roundD2(this.unit.h * h - SPACING) + '%' ) // + '-' + this.margin.t
    p.width = options.w ?? ( roundD2(this.unit.w * w - SPACING) + '%' )
    // console.log('[coord]', `(${ p.top },${ p.left })`, '[size]', `(${ p.height },${ p.width })`)
    p.border = options.hideBorder ?? this.hideBorder ? null : p.border ?? this.unit.border
    p.inGrid = true
    const instance = component(p)
    if (!options.sup) this.screen.append(instance)
    return instance
  }
}
