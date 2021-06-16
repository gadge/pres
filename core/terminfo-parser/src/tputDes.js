import { BooleanCapabilities, NumberCapabilities, StringCapabilities }       from '@pres/enum-terminfo-alias'
import { ACSC, CAPS_BOO, CAPS_NUM, CAPS_STR, CPATHS, IPATHS, TERMCAP, UTOA } from '../assets'
import { termPrint }                                                         from './termPrint'

export class TputDes {
  static ipaths = IPATHS
  /**
   * Extended Parsing
   */
  /**
   * Termcap
   */
  static cpaths = CPATHS
  static _prefix = CPATHS
  static _tprefix = CPATHS
  /**
   * Aliases
   * static _alias = { BooleanCapabilities,NumberCapabilities,StringCapabilities, }
   */
  static alias = {}
  /**
   * Feature Checking
   */
  static keyMap = {}
  /**
   * Fallback Termcap Entry
   */
  static termcap = TERMCAP
  /**
   * Terminfo Data
   */
  static boo = CAPS_BOO
  static num = CAPS_NUM
  static str = CAPS_STR
  static acsc = ACSC
  static utoa = UTOA

  static get bools() { return TputDes.boo }
  static get numbers() { return TputDes.num }
  static get strings() { return TputDes.str }

  static initialize() {
    const { alias, keyMap } = TputDes
    for (const { rows } of [ BooleanCapabilities, NumberCapabilities, StringCapabilities ]) {
      for (const [ key, terminfo, termcap ] of rows) {
        alias[key] = [ terminfo ]
        alias[key].terminfo = terminfo
        alias[key].termcap = termcap
      }
    }
    alias.no_esc_ctlc.push('beehive_glitch') // boo
    alias.dest_tabs_magic_smso.push('teleray_glitch') // boo
    alias.micro_col_size.push('micro_char_size') // num
    for (const key in alias) {
      keyMap[key] = key
      alias[key].forEach(k => keyMap[k] = key)
    }
    console.log('>> [TputDes.initialize]', 'alias', Object.keys(TputDes.alias).length, 'keyMap', Object.keys(TputDes.keyMap).length)
  }

  // to easily output text with setTimeouts.
  static print(...args) {
    const fake = {
      padding: true,
      boo: { needs_xon_xoff: true, xon_xoff: false }
    }
    return termPrint.apply(fake, args)
    // See:
    // ~/ncurses/ncurses/tinfo/lib_tparm.c
  }
}

TputDes.initialize()
