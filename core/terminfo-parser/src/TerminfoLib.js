import { BooleanCapabilities, NumberCapabilities, StringCapabilities }       from '@pres/enum-terminfo-alias'
import { ACSC, CAPS_BOO, CAPS_NUM, CAPS_STR, CPATHS, IPATHS, TERMCAP, UTOA } from '../assets'
import { termPrint }                                                         from '../util/termPrint'

export class TerminfoLib {
  static ipaths = IPATHS
  /** Extended Parsing */
  /** Termcap */
  static cpaths = CPATHS
  static _prefix = CPATHS
  static _tprefix = CPATHS
  static alias = {}
  /** Feature Checking */
  static keyMap = {}
  /** Fallback Termcap Entry */
  static termcap = TERMCAP
  /** Terminfo Data */
  static #boo = CAPS_BOO
  static #num = CAPS_NUM
  static #str = CAPS_STR
  static acsc = ACSC
  static utoa = UTOA

  static get booleans() { return TerminfoLib.#boo }
  static get numerics() { return TerminfoLib.#num }
  static get literals() { return TerminfoLib.#str }

  static initialize() {
    const { alias, keyMap } = TerminfoLib
    for (const { rows } of [ BooleanCapabilities, NumberCapabilities, StringCapabilities ]) {
      for (const [ key, terminfo, termcap ] of rows) {
        alias[key] = [ terminfo ]
        alias[key].terminfo = terminfo
        alias[key].termcap = termcap
      }
    }
    alias.no_esc_ctlc.push('beehive_glitch') // boo
    alias.dest_tabs_magic_smso.push('teleray_glitch') // boo
    alias.micro_col_size.push('micro_char_size') // #num
    for (const key in alias) {
      keyMap[key] = key
      alias[key].forEach(k => keyMap[k] = key)
    }
    console.log('>> [TerminfoLib.initialize]', 'alias', Object.keys(TerminfoLib.alias).length, 'keyMap', Object.keys(TerminfoLib.keyMap).length)
    // Logger.localInfo('terminfo-lib-booleans', TerminfoLib.booleans)
    // Logger.localInfo('terminfo-lib-numerics', TerminfoLib.numerics)
    // Logger.localInfo('terminfo-lib-literals', TerminfoLib.literals)
    // Logger.localInfo('terminfo-lib-termcap', TerminfoLib.termcap)
    // Logger.localInfo('terminfo-lib-alias', TerminfoLib.alias)
    // Logger.localInfo('terminfo-lib-keyMap', TerminfoLib.keyMap)
    // Logger.localInfo('terminfo-lib-acsc', TerminfoLib.acsc)
    // Logger.localInfo('terminfo-lib-utoa', TerminfoLib.utoa)
  }

  // to easily output text with setTimeouts.
  static print(...args) {
    const fake = {
      padding: true,
      booleans: { needs_xon_xoff: true, xon_xoff: false }
    }
    return termPrint.apply(fake, args)
    // See:
    // ~/ncurses/ncurses/tinfo/lib_tparm.c
  }
}

TerminfoLib.initialize()
