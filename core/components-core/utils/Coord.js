import { Cadre } from './Cadre'

export class Coord extends Cadre {
  constructor(t, b, l, r, nT, nB, nL, nR, base, renders) {
    super(t, b, l, r)
    this.negT = nT
    this.negB = nB
    this.negL = nL
    this.negR = nR
    this.base = base
    this.renders = renders
  }
  static build(t, b, l, r, nT, nB, nL, nR, base, renders) { return new Coord(t, b, l, r, nT, nB, nL, nR, base, renders) }

  get yLo() { return this.t }
  get yHi() { return this.b }
  get xLo() { return this.l }
  get xHi() { return this.r }
  set yLo(val) { return this.t = val }
  set yHi(val) { return this.b = val }
  set xLo(val) { return this.l = val }
  set xHi(val) { return this.r = val }
}