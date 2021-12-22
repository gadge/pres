'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var enumFontEffects = require('@palett/enum-font-effects')
var utilAnsi = require('@palett/util-ansi')
var enumDataTypes = require('@typen/enum-data-types')

/**
 *
 * @param {number} mode
 * @param {string} scope
 * @param {any} value
 * @returns {number}
 */

function assignMode(mode, scope, value) {
  if (scope === enumFontEffects.BOLD) return value ? mode | 1 : mode & ~1 // bold

  if (scope === enumFontEffects.UNDERLINE) return value ? mode | 2 : mode & ~2 // underline

  if (scope === enumFontEffects.BLINK) return value ? mode | 4 : mode & ~4 // blink

  if (scope === enumFontEffects.INVERSE) return value ? mode | 8 : mode & ~8 // inverse

  if (scope === enumFontEffects.INVISIBLE || scope === enumFontEffects.HIDE) return value ? mode | 16 : mode & ~16 // hide, invisible

  return mode
}
/**
 *
 * @param {number} mode
 * @param {string} scope
 * @param {(number|boolean)?} base
 * @returns {number}
 */

function assignModeFrom(mode, scope, base) {
  if (scope === enumFontEffects.BOLD) return mode & ~1 | base & 1 // bold

  if (scope === enumFontEffects.UNDERLINE) return mode & ~2 | base & 2 // underline

  if (scope === enumFontEffects.BLINK) return mode & ~4 | base & 4 // blink

  if (scope === enumFontEffects.INVERSE) return mode & ~8 | base & 8 // inverse

  if (scope === enumFontEffects.INVISIBLE || scope === enumFontEffects.HIDE) return mode & ~16 | base & 16 // hide, invisible

  return mode
}

/**
 *
 * @param {number} mode
 * @returns {string}
 */

const modeToSgra = mode => {
  let tx = ''
  if (mode & 1) tx = utilAnsi.concatSgr(tx, '1') // bold

  if (mode & 2) tx = utilAnsi.concatSgr(tx, '4') // underline

  if (mode & 4) tx = utilAnsi.concatSgr(tx, '5') // blink

  if (mode & 8) tx = utilAnsi.concatSgr(tx, '7') // inverse

  if (mode & 16) tx = utilAnsi.concatSgr(tx, '8') // invisible

  return tx
}

/**
 *
 * @param {number} mode
 * @returns {string}
 */
const modeToSign = mode => {
  let tx = ''
  tx += mode & 1 ? 'B' : '-' // bold

  tx += mode & 2 ? 'U' : '-' // underline

  tx += mode & 4 ? 'B' : '-' // blink

  tx += mode & 8 ? 'I' : '-' // inverse

  tx += mode & 16 ? 'H' : '-' // hide

  return tx
}

function styleToMode(style) {
  let {
        bold,
        underline,
        blink,
        inverse,
        invisible
      } = style
  if (typeof bold === enumDataTypes.FUN) bold = bold(this)
  if (typeof underline === enumDataTypes.FUN) underline = underline(this)
  if (typeof blink === enumDataTypes.FUN) blink = blink(this)
  if (typeof inverse === enumDataTypes.FUN) inverse = inverse(this)
  if (typeof invisible === enumDataTypes.FUN) invisible = invisible(this)
  let v = 0
  if (bold) v |= 1
  if (underline) v |= 2
  if (blink) v |= 4
  if (inverse) v |= 8
  if (invisible) v |= 16
  return v
}

const WORD = /\w/
function signToMode(sign) {
  let v = 0
  if (WORD.test(sign[0])) v |= 1
  if (WORD.test(sign[1])) v |= 2
  if (WORD.test(sign[2])) v |= 4
  if (WORD.test(sign[3])) v |= 8
  if (WORD.test(sign[4])) v |= 16
  return v
}

exports.assignMode = assignMode
exports.assignModeFrom = assignModeFrom
exports.modeToSgra = modeToSgra
exports.modeToSign = modeToSign
exports.signToMode = signToMode
exports.styleToMode = styleToMode
