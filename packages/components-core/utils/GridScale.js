import { Cadre }  from './Cadre'
import { scaler } from './scaler'

export class GridScale {
  constructor(cadre) { this.pad = cadre }
  static build(o) { return new GridScale(Cadre.build(o))}
  scaleT(val, base) { return this.pad.t + scaler(val, base - this.pad.vert) }
  scaleL(val, base) { return this.pad.l + scaler(val, base - this.pad.hori) }
  scaleH(val, base) { return scaler(val, base - this.pad.vert) }
  scaleW(val, base) { return scaler(val, base - this.pad.hori) }
}
