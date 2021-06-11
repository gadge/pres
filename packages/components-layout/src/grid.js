import { roundD2, roundD4 } from '@aryth/math'
import { assignDeep }       from '@pres/util-helpers'
import { NUM, OBJ, STR }    from '@typen/enum-data-types'
import { nullish }          from '@typen/nullish'


export const parseMargin = margin => {
  const t = typeof margin
  if (nullish(margin)) return { t: 0, b: 0, l: 0, r: 0 }
  if (t === NUM) return { t: margin, b: margin, l: margin, r: margin }
  if (t === STR) return parseInt(margin)
  if (t === OBJ) return { t: margin.t ?? 0, b: margin.b ?? 0, l: margin.l ?? 0, r: margin.r ?? 0 }
  return { t: 0, b: 0, l: 0, r: 0 }
}

const SPACING = 0

export class Grid {
  constructor(options) {
    if (!options.screen) throw 'Error: A screen property must be specified in the grid options.\r\n' +
    'Note: Release 2.0.0 has breaking changes. Please refer to the README or to https://github.com/yaronn/blessed-contrib/issues/39'
    this.screen = options.screen
    this.colNo = options.cols ?? 12
    this.rowNo = options.rows ?? 12
    this.margin = parseMargin(options.margin)
    this.unit = {
      h: roundD4(( 100 - this.marginVert ) / this.rowNo), // roundD2(( 100 - this.margin * 2 ) / this.rowNo),
      w: roundD4(( 100 - this.marginHori ) / this.colNo), // roundD2(( 100 - this.margin * 2 ) / this.colNo),
      border: { type: 'line', fg: options.color ?? 'cyan' }
    }
    this.hideBorder = options.hideBorder
  }
  static build(options) { return new Grid(options) }
  get marginVert() { return this.margin.t + this.margin.b }
  get marginHori() { return this.margin.l + this.margin.r }
  set(t, l, h, w, component, options) {
    if (component instanceof Grid) {
      throw 'Error: A Grid is not allowed to be nested inside another grid.\r\n' +
      'Note: Release 2.0.0 has breaking changes. Please refer to the README or to https://github.com/yaronn/blessed-contrib/issues/39'
    }
    //var options = JSON.parse(JSON.stringify(opts));
    let p = {}
    p = assignDeep(p, options)
    p.top = roundD2(t * this.unit.h) + '%' + '+' + this.margin.t // ( t * this.unit.h + this.margin ) + '%'
    p.left = roundD2(l * this.unit.w) + '%' + '+' + this.margin.l // ( l * this.unit.w + this.margin ) + '%'
    p.height = roundD2(this.unit.h * h - SPACING) + '%' // + '-' + this.margin.t
    p.width = roundD2(this.unit.w * w - SPACING) + '%'
    console.log('[coord]', `(${ p.top },${ p.left })`, '[size]', `(${ p.height },${ p.width })`)
    p.border = options.hideBorder ?? this.hideBorder ? null : p.border ?? this.unit.border
    const instance = component(p)
    if (!options.sup) this.screen.append(instance)
    return instance
  }
}
