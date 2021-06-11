import { Cadre }        from './Cadre'
import { parsePercent } from './parsePercent'

export class GridScale {
  constructor(cadre) { this.pad = cadre }
  static build(o) { return new GridScale(Cadre.build(o))}
  scaleT(val, base) { return this.pad.t + parsePercent(val, base - this.pad.vert) }
  scaleL(val, base) { return this.pad.l + parsePercent(val, base - this.pad.hori) }
  scaleH(val, base) { return parsePercent(val, base - this.pad.vert) }
  scaleW(val, base) { return parsePercent(val, base - this.pad.hori) }
}
