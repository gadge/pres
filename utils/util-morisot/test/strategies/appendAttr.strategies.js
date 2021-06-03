import { makeEmbedded }      from '@foba/util'
import { decoCrostab, says } from '@spare/logger'
import { strategies }        from '@valjoux/strategies'
import { last }              from '@vect/vector'
import { concatSgr }         from '../../util'


const { lapse, result } = strategies({
  repeat: 1E+6,
  candidates: {
    empty: 0,
    bold: 1,
    bold_underline: 3,
    bold_blink_hide: 21,
    except_blink: 27,
    all: 31,
  } |> makeEmbedded,
  methods: {
    bench: v => v,
    cla: (mode) => {
      let out = ''
      if (mode & 1) { out += '1;' } // bold
      if (mode & 2) { out += '4;' } // underline
      if (mode & 4) { out += '5;' } // blink
      if (mode & 8) { out += '7;' } // inverse
      if (mode & 16) { out += '8;' } // invisible
      return last(out) === ';' ? out.slice(0, -1) : out
    },
    dev: (mode) => {
      let out = ''
      if (mode & 1) { out = concatSgr(out, '1') } // bold
      if (mode & 2) { out = concatSgr(out, '4') } // underline
      if (mode & 4) { out = concatSgr(out, '5') } // blink
      if (mode & 8) { out = concatSgr(out, '7') } // inverse
      if (mode & 16) { out = concatSgr(out, '8') } // invisible
      return out
    },
    edg: (mode) => {
      const vec = []
      if (mode & 1) { vec.push('1') } // bold
      if (mode & 2) { vec.push('4') } // underline
      if (mode & 4) { vec.push('5') } // blink
      if (mode & 8) { vec.push('7') } // inverse
      if (mode & 16) { vec.push('8') } // invisible
      return vec.join(';')
    },
  }
  // cla, dev, edg, rea, arc, epi
})
lapse |> decoCrostab |> says['lapse']
result |> decoCrostab |> says['result']
