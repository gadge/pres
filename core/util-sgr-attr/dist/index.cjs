'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var utilAnsi = require('@palett/util-ansi')
var enumAnsiCodes = require('@palett/enum-ansi-codes')
var utilByteColors = require('@pres/util-byte-colors')
var utilSgrMode = require('@pres/util-sgr-mode')
var enumFontEffects = require('@palett/enum-font-effects')
var enumDataTypes = require('@typen/enum-data-types')
var nullish = require('@typen/nullish')

function attrToSgra(attr, total) {
  const mode = attr >> 18 & 0x1ff,
        fore = attr >> 9 & 0x1ff,
        back = attr & 0x1ff
  let out = utilSgrMode.modeToSgra(mode)
  if (fore !== 0x1ff) out = utilAnsi.concatSgr(out, utilByteColors.byteToForeSgra(utilByteColors.degrade(fore, total)))
  if (back !== 0x1ff) out = utilAnsi.concatSgr(out, utilByteColors.byteToBackSgra(utilByteColors.degrade(back, total)))
  return enumAnsiCodes.CSI + out + enumAnsiCodes.SGR
}

function attrToVec(code) {
  const m = code >> 18 & 0x1ff,
        f = code >> 9 & 0x1ff,
        b = code & 0x1ff
  return [ m, f, b ]
}

// ch === 100 ? ( fore = normAttr >> 9 & 0x1ff, back = normAttr & 0x1ff )

function sgraToAttr(sgra, baseAttr, normAttr) {
  const ve = sgra.slice(2, -1).split(';')
  let mode = baseAttr >> 18 & 0x1ff,
      fore = baseAttr >> 9 & 0x1ff,
      back = baseAttr & 0x1ff
  if (!ve[0]) ve[0] = '0'

  for (let i = 0, hi = ve.length, ch, nx; i < hi; i++) {
    ch = +ve[i] || 0
    if (ch === 0) mode = normAttr >> 18 & 0x1ff, fore = normAttr >> 9 & 0x1ff, back = normAttr & 0x1ff
    mode = ch === 1 ? utilSgrMode.assignMode(mode, enumFontEffects.BOLD, true) // ( m |= 1 ) // bold
      : ch === 4 ? utilSgrMode.assignMode(mode, enumFontEffects.UNDERLINE, true) // ( m |= 2 ) // underline
        : ch === 5 ? utilSgrMode.assignMode(mode, enumFontEffects.BLINK, true) // ( m |= 4 ) // blink
          : ch === 7 ? utilSgrMode.assignMode(mode, enumFontEffects.INVERSE, true) // ( m |= 8 ) // inverse
            : ch === 8 ? utilSgrMode.assignMode(mode, enumFontEffects.HIDE, true) // ( m |= 16 ) // invisible
              : ch === 22 ? utilSgrMode.assignModeFrom(mode, enumFontEffects.BOLD, normAttr >> 18 & 0x1ff) // ( m = normAttr >> 18 & 0x1ff )
                : ch === 24 ? utilSgrMode.assignModeFrom(mode, enumFontEffects.UNDERLINE, normAttr >> 18 & 0x1ff) // ( m = normAttr >> 18 & 0x1ff )
                  : ch === 25 ? utilSgrMode.assignModeFrom(mode, enumFontEffects.BLINK, normAttr >> 18 & 0x1ff) // ( m = normAttr >> 18 & 0x1ff )
                    : ch === 27 ? utilSgrMode.assignModeFrom(mode, enumFontEffects.INVERSE, normAttr >> 18 & 0x1ff) // ( m = normAttr >> 18 & 0x1ff )
                      : ch === 28 ? utilSgrMode.assignModeFrom(mode, enumFontEffects.HIDE, normAttr >> 18 & 0x1ff) // ( m = normAttr >> 18 & 0x1ff )
                        : mode
    fore = 30 <= ch && ch <= 37 ? ch - 30 : ch === 38 && ( nx = +ve[++i] ) ? nx === 5 ? +ve[++i] : nx === 2 ? utilByteColors.rgbToByte(+ve[++i], +ve[++i], +ve[++i]) ?? normAttr >> 9 & 0x1ff : fore : ch === 39 ? normAttr >> 9 & 0x1ff : 90 <= ch && ch <= 97 ? ( fore = ch - 90, fore += 8 ) : fore
    back = 40 <= ch && ch <= 47 ? ch - 40 : ch === 48 && ( nx = +ve[++i] ) ? nx === 5 ? +ve[++i] : nx === 2 ? utilByteColors.rgbToByte(+ve[++i], +ve[++i], +ve[++i]) ?? normAttr & 0x1ff : back : ch === 49 ? normAttr & 0x1ff : ch >= 100 && ch <= 107 ? ( back = ch - 100, back += 8 ) : back
  }

  return mode << 18 | fore << 9 | back
}

function styleToAttr(style = {}, fg, bg) {
  if (nullish.nullish(fg) && nullish.nullish(bg)) {
    fg = style.fore || style.fg, bg = style.back || style.bg
  }

  if (typeof fg === enumDataTypes.FUN) fg = fg(this)
  if (typeof bg === enumDataTypes.FUN) bg = bg(this) // console.log(`>> [styleToAttr]`, fg, bg, styleToMode.call(this, style), toByte(fg), toByte(bg))

  return utilSgrMode.styleToMode.call(this, style) << 18 | ( utilByteColors.toByte(fg) ?? 0x1ff ) << 9 | ( utilByteColors.toByte(bg) ?? 0x1ff )
}

exports.attrToSgra = attrToSgra
exports.attrToVec = attrToVec
exports.sgraToAttr = sgraToAttr
exports.styleToAttr = styleToAttr
