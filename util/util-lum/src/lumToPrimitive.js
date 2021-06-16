import { Grey }             from '@palett/cards'
import { Fluo }             from '@palett/fluo'
import { ATLAS }            from '@palett/presets'
import { ProjectorFactory } from '@palett/projector-factory'
import { CSI }              from '@pres/enum-control-chars'
import { SGR }              from '@pres/enum-csi-codes'
import { DEF, NUM, STR }    from '@typen/enum-data-types'
import { lumToSgr }         from './convert'

const proj = ProjectorFactory.fromHEX({ min: 0, max: 32 }, ATLAS)
const DASH2 = Fluo.hex('--', Grey.darken_3)
const DASH6 = Fluo.hex('------', Grey.darken_3)

function n(n) { return ( n ?? 0 ).toString(16).toUpperCase().padStart(6, '0') }
n.sty = function (n) { return ( n ?? 0 ).toString(16).padStart(2, '0') }

function t(n) { return n?.toString(16).toUpperCase().padStart(6, '0') ?? DASH6 }
t.sty = function (n) { return n?.toString(16).padStart(2, '0') ?? DASH2 }

export const lumToPrimitive = function (hint) {
  let { m, f, b } = this
  const mode = this.modeSign
  if (hint === NUM) { return parseInt(n.sty(m) + n(f) + n(b), 16) }
  if (hint === STR) { return proj.render(m, mode) + Fluo.int(t(f), t) + Fluo.int(t(b), b) }
  if (hint === DEF) { return `[${ proj.render(m, mode) },${ Fluo.int(t(f), t) },${ Fluo.int(t(b), b) }]` }
  return lumToSgr(this) + ( this.ch ?? '+' ) + CSI + SGR // throw new Error()
}