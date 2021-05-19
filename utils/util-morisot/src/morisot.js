import { CSI }     from '@pres/enum-control-chars'
import { SGR }     from '@pres/enum-csi-codes'
import * as colors from '@pres/util-colors'
import { FUN }     from '@typen/enum-data-types'
import { nullish } from '@typen/nullish'

export function styleToInt(style = {}) {
  let { bold, underline, blink, inverse, invisible } = style
  if (typeof bold === FUN) bold = bold(this)
  if (typeof underline === FUN) underline = underline(this)
  if (typeof blink === FUN) blink = blink(this)
  if (typeof inverse === FUN) inverse = inverse(this)
  if (typeof invisible === FUN) invisible = invisible(this)
  return (
    (invisible ? 16 : 0) |
    (inverse ? 8 : 0) |
    (blink ? 4 : 0) |
    (underline ? 2 : 0) |
    (bold ? 1 : 0)
  )
}

// sattr
export function styleToMorisot(style = {}, fg, bg) {
  if (nullish(fg) && nullish(bg)) { (fg = style.fore || style.fg), (bg = style.back || style.bg) }
  if (typeof fg === FUN) fg = fg(this)
  if (typeof bg === FUN) bg = bg(this)
  return (styleToInt.call(this, style) << 18) | (colors.convert(fg) << 9) | (colors.convert(bg))
}

// attrCode
// Convert an SGR string to our own attribute format.
export function sgraToMorisot(target, source, normal) {
  let effect = (source >> 18) & 0x1ff,
      fore   = (source >> 9) & 0x1ff,
      back   = (source) & 0x1ff
  let code = target.slice(2, -1).split(';')
  if (!code[0]) code[0] = '0'
  for (let i = 0, c; i < code.length; i++) {
    c = +code[i] || 0
    switch (c) {
      case 0: // normal
        back = normal & 0x1ff
        fore = (normal >> 9) & 0x1ff
        effect = (normal >> 18) & 0x1ff
        break
      case 1: // bold
        effect |= 1
        break
      case 22:
        effect = (normal >> 18) & 0x1ff
        break
      case 4: // underline
        effect |= 2
        break
      case 24:
        effect = (normal >> 18) & 0x1ff
        break
      case 5: // blink
        effect |= 4
        break
      case 25:
        effect = (normal >> 18) & 0x1ff
        break
      case 7: // inverse
        effect |= 8
        break
      case 27:
        effect = (normal >> 18) & 0x1ff
        break
      case 8: // invisible
        effect |= 16
        break
      case 28:
        effect = (normal >> 18) & 0x1ff
        break
      case 39: // default fg
        fore = (normal >> 9) & 0x1ff
        break
      case 49: // default bg
        back = normal & 0x1ff
        break
      case 100: // default fg/bg
        fore = (normal >> 9) & 0x1ff
        back = normal & 0x1ff
        break
      default: // color
        if (c === 48 && +code[i + 1] === 5) {
          i += 2
          back = +code[i]
          break
        }
        else if (c === 48 && +code[i + 1] === 2) {
          i += 2
          back = colors.match(+code[i], +code[i + 1], +code[i + 2])
          if (back === -1) back = normal & 0x1ff
          i += 2
          break
        }
        else if (c === 38 && +code[i + 1] === 5) {
          i += 2
          fore = +code[i]
          break
        }
        else if (c === 38 && +code[i + 1] === 2) {
          i += 2
          fore = colors.match(+code[i], +code[i + 1], +code[i + 2])
          if (fore === -1) fore = (normal >> 9) & 0x1ff
          i += 2
          break
        }
        if (c >= 40 && c <= 47) {
          back = c - 40
        }
        else if (c >= 100 && c <= 107) {
          back = c - 100
          back += 8
        }
        else if (c === 49) {
          back = normal & 0x1ff
        }
        else if (c >= 30 && c <= 37) {
          fore = c - 30
        }
        else if (c >= 90 && c <= 97) {
          fore = c - 90
          fore += 8
        }
        else if (c === 39) {
          fore = (normal >> 9) & 0x1ff
        }
        else if (c === 100) {
          fore = (normal >> 9) & 0x1ff
          back = normal & 0x1ff
        }
        break
    }
  }
  return (effect << 18) | (fore << 9) | back
}

// codeAttr
// Convert our own attribute format to an SGR string.
export function morisotToSgra(code, tputColors) {
  let effect = (code >> 18) & 0x1ff,
      fore   = (code >> 9) & 0x1ff,
      back   = code & 0x1ff,
      out    = ''
  if (effect & 1) { out += '1;' } // bold
  if (effect & 2) { out += '4;' } // underline
  if (effect & 4) { out += '5;' } // blink
  if (effect & 8) { out += '7;' } // inverse
  if (effect & 16) { out += '8;' } // invisible
  if (back !== 0x1ff) {
    back = colors.reduce(back, tputColors)
    if (back < 16) {
      if (back < 8) { back += 40 }
      else if (back < 16) { back -= 8, back += 100 }
      out += back + ';'
    }
    else { out += '48;5;' + back + ';' }
  }
  if (fore !== 0x1ff) {
    fore = colors.reduce(fore, tputColors)
    if (fore < 16) {
      if (fore < 8) { fore += 30 }
      else if (fore < 16) { fore -= 8, fore += 90 }
      out += fore + ';'
    }
    else { out += '38;5;' + fore + ';' }
  }
  if (out[out.length - 1] === ';') out = out.slice(0, -1)
  return CSI + out + SGR
}

