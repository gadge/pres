import { decoCrostab, says } from '@spare/logger'
import { strategies }        from '@valjoux/strategies'

const BOLD = 'bold'
const UNDERLINE = 'underline'
const BLINK = 'blink'
const INVERSE = 'inverse'
const INVISIBLE = 'invisible'
const HIDE = 'hide'
export function setModeCla(mode, scope, value) {
  if (scope === BOLD) return value ? ( mode | 1 ) : ( mode & ~1 ) // bold
  if (scope === UNDERLINE) return value ? ( mode | 2 ) : ( mode & ~2 ) // underline
  if (scope === BLINK) return value ? ( mode | 4 ) : ( mode & ~4 ) // blink
  if (scope === INVERSE) return value ? ( mode | 8 ) : ( mode & ~8 ) // inverse
  if (scope === INVISIBLE || scope === HIDE) return value ? ( mode | 16 ) : ( mode & ~16 ) // hide, invisible
  return mode
}

export function setModeArc(mode, scope, value) {
  if (scope === 'bold') return value ? ( mode | 1 ) : ( mode & ~1 ) // bold
  if (scope === 'underline') return value ? ( mode | 2 ) : ( mode & ~2 ) // underline
  if (scope === 'blink') return value ? ( mode | 4 ) : ( mode & ~4 ) // blink
  if (scope === 'inverse') return value ? ( mode | 8 ) : ( mode & ~8 ) // inverse
  if (scope === 'invisible' || scope === 'hide') return value ? ( mode | 16 ) : ( mode & ~16 ) // hide, invisible
  return mode
}

export function setModeEdg(mode, scope, value) {
  if (scope.startsWith('bo')) return value ? ( mode | 1 ) : ( mode & ~1 ) // bold
  if (scope.startsWith('un')) return value ? ( mode | 2 ) : ( mode & ~2 ) // underline
  if (scope.startsWith('bl')) return value ? ( mode | 4 ) : ( mode & ~4 ) // blink
  if (scope.startsWith('inve')) return value ? ( mode | 8 ) : ( mode & ~8 ) // inverse
  if (scope.startsWith('invi') || scope.startsWith('hi')) return value ? ( mode | 16 ) : ( mode & ~16 ) // hide, invisible
  return mode
}

export function setModeDev(mode, scope, value) {
  if (/^bo/.test(scope)) return value ? ( mode | 1 ) : ( mode & ~1 ) // bold
  if (/^un/.test(scope)) return value ? ( mode | 2 ) : ( mode & ~2 ) // underline
  if (/^bl/.test(scope)) return value ? ( mode | 4 ) : ( mode & ~4 ) // blink
  if (/^inve/.test(scope)) return value ? ( mode | 8 ) : ( mode & ~8 ) // inverse
  if (/^invi/.test(scope) || scope.startsWith('hi')) return value ? ( mode | 16 ) : ( mode & ~16 ) // hide, invisible
  return mode
}

export function setModeFut(mode, scope, value) {
  const ini = scope.charAt(0), len = scope.length
  if (ini === 'b' && len === 4) return value ? ( mode | 1 ) : ( mode & ~1 ) // bold
  if (ini === 'u') return value ? ( mode | 2 ) : ( mode & ~2 ) // underline
  if (ini === 'b') return value ? ( mode | 4 ) : ( mode & ~4 ) // blink
  if (ini === 'i' && len === 7) return value ? ( mode | 8 ) : ( mode & ~8 ) // inverse
  if (ini === 'h' || ini === 'i') return value ? ( mode | 16 ) : ( mode & ~16 ) // hide, invisible
  return mode
}

const { lapse, result } = strategies({
  repeat: 2E+6,
  candidates: {
    bold_true: [ 'bold', true ],
    underline_true: [ 'underline', true ],
    blink_true: [ 'blink', true ],
    inverse_true: [ 'inverse', true ],
    invisible_true: [ '', true ],
    nothing_true: [ 'invisible', true ],
    bold_false: [ 'bold', false ],
    underline_false: [ 'underline', false ],
    blink_false: [ 'blink', false ],
    inverse_false: [ 'inverse', false ],
    invisible_false: [ 'invisible', false ],
    nothing_false: [ '', true ],
  },
  methods: {
    bench: v => v,
    cla: (scope, value) => setModeCla(21, scope, value),
    arc: (scope, value) => setModeArc(21, scope, value),
    edg: (scope, value) => setModeEdg(21, scope, value),
    dev: (scope, value) => setModeDev(21, scope, value),
    fut: (scope, value) => setModeEdg(21, scope, value),
  }
  // cla, dev, edg, rea, arc, epi
})
lapse |> decoCrostab |> says['lapse']
result |> decoCrostab |> says['result']
