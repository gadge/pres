import { roundD2, roundD4 } from '@aryth/math'
import { Box }              from '@pres/components-core'
import { assignDeep }       from '@pres/util-helpers'

export class Page extends Box {
  constructor(options) {
    options.sku = 'page'
    options.height = '100%'
    options.width = '100%'
    super(options)
    this.colNo = options.cols ?? 12
    this.rowNo = options.rows ?? 12
    this.hideBorder = options.hideBorder
    this.unit = {
      h: roundD4(100 / this.rowNo),
      w: roundD4(100 / this.colNo),
      border: { type: 'line', fg: options.color ?? 'cyan' }
    }
    this.type = 'page'
  }
  static build(options) { return new Page(options) }
  add(t, l, h, w, component, options) {
    if (component instanceof Page) {
      throw 'Error: A Page is not allowed to be nested inside another page.\r\n' +
      'Note: Release 2.0.0 has breaking changes. Please refer to the README or to https://github.com/yaronn/blessed-contrib/issues/39'
    }
    //var options = JSON.parse(JSON.stringify(opts));
    let p = {}
    p = assignDeep(p, options)
    p.top = options.t ?? ( roundD2(t * this.unit.h) + '%' )
    p.left = options.l ?? ( roundD2(l * this.unit.w) + '%' )
    p.height = options.h ?? ( roundD2(this.unit.h * h) + '%' ) // + '-' + this.margin.t
    p.width = options.w ?? ( roundD2(this.unit.w * w) + '%' )
    // console.log('[coord]', `(${ p.top },${ p.left })`, '[size]', `(${ p.height },${ p.width })`)
    p.border = options.hideBorder ?? this.hideBorder ? null : p.border ?? this.unit.border
    p.inGrid = true
    p.sup = this
    return component(p)
  }
}
