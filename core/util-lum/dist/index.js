import { Grey }               from '@palett/cards'
import { hexToInt, rgbToInt } from '@palett/convert'
import { Fluo }               from '@palett/fluo'
import { ATLAS }              from '@palett/presets'
import { ProjectorFactory }   from '@palett/projector-factory'
import { CSI }                from '@pres/enum-control-chars'
import { SGR }                from '@pres/enum-csi-codes'
import { styleToMode }        from '@pres/util-sgr-mode'
import { SC }                 from '@texting/enum-chars'
import { DEF, FUN, NUM, STR } from '@typen/enum-data-types'
import { nullish }            from '@typen/nullish'

const COLORS_4BITS = [[0, 0, 0], // noir
[205, 0, 0], // rouge
[0, 205, 0], // vert
[205, 205, 0], // jaune
[0, 0, 238], // bleu
[205, 0, 205], // magenta
[0, 205, 205], // cyan
[229, 229, 229], // blanc
[127, 127, 127], // noir_brillant
[255, 0, 0], // rouge_brillant
[0, 255, 0], // vert_brillant
[255, 255, 0], // jaune_brillant
[92, 92, 255], // bleu_brillant
[255, 0, 255], // magenta_brillant
[0, 255, 255], // cyan_brillant
[255, 255, 255] // blanc_brillant
].map(rgbToInt);

const COLOR_CODES = {
  default: NaN,
  normal: NaN,
  fore: NaN,
  back: NaN,
  bg: NaN,
  fg: NaN,
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  grey: 8,
  gray: 8
};

const NAC$2 = null; // export const NAC = 1 << 24 // 16777216 = 256 * 256 * 256

const LIGHT = /^(?:light(?:en)?|bright(?:en)?)/;
const PUNC = /[\W_]+/g;

// This might work well enough for a terminal's colors: treat RGB as XYZ in a
function mixColors(rgbA, rgbB, alpha = 0.5) {
  let r_ = rgbA >> 16 & 0xFF,
      g_ = rgbA >> 8 & 0xFF,
      b_ = rgbA & 0xFF;

  let _r = rgbA >> 16 & 0xFF,
      _g = rgbA >> 8 & 0xFF,
      _b = rgbA & 0xFF;

  r_ += (_r - r_) * alpha | 0;
  g_ += (_g - g_) * alpha | 0;
  b_ += (_b - b_) * alpha | 0;
  return ((r_ & 0xFF) << 16) + ((g_ & 0xFF) << 8) + (b_ & 0xFF); // return [r_, g_, b_]
}
class Blended {
  static cache = {};
}
const NAC$1 = 1 << 24;
const GREY$1 = rgbToInt([127, 127, 127]);
function blend(x, y, alpha) {
  let [, fore_, back_] = x;

  let _fore, _back;

  if (y) {
    // if right provided: mixColors
    [, _fore, _back] = y; // for back

    if (back_ === NAC$1) back_ = 0; // if left is NAC: left is noir

    if (_back === NAC$1) _back = 0; // if right is NAC: right is noir

    back_ = mixColors(back_, _back, alpha); // mix
    // for fore

    if (fore_ === NAC$1) {
      fore_ = GREY$1;
    } // if left is NAC: left is grey
    else {
      if (_fore === NAC$1) _fore = GREY$1; // if right is NAC: right is grey

      fore_ = mixColors(fore_, _fore, alpha); // mix
    }
  } else {
    // if right not provided: use cache
    // for back
    if (Blended.cache[back_]) {
      back_ = Blended.cache[back_];
    } else {
      back_ = Blended.cache[back_] = back_;
    } // else if (back_ >= 8 && back_ <= 15) { back_ -= 8 }
    // else if ((name = SPARSE_NAMES[back_])) {
    //   for (let i = 0; i < SPARSE_NAMES.length; i++)
    //     if (name === SPARSE_NAMES[i] && i !== back_) {
    //       const [ r_, g_, b_ ] = RGB_COLORS[i], [ _r, _g, _b ] = RGB_COLORS[back_]
    //       if (r_ + g_ + b_ < _r + _g + _b) {
    //         back_ = Blended.cache[back_] = i
    //         break
    //       }
    //     }
    // }
    // for fore


    if (Blended.cache[fore_]) {
      fore_ = Blended.cache[fore_];
    } // if cached: use cached
    else {
      fore_ = Blended.cache[fore_] = fore_;
    } // else if (fore_ >= 8 && fore_ <= 15) { fore_ -= 8 } // if bright: use standard counterpart
    // else if ((name = SPARSE_NAMES[fore_])) {
    //   for (let i = 0; i < SPARSE_NAMES.length; i++)
    //     if (name === SPARSE_NAMES[i] && i !== fore_) {
    //       const [ r_, g_, b_ ] = RGB_COLORS[i], [ _r, _g, _b ] = RGB_COLORS[fore_]
    //       if (r_ + g_ + b_ < _r + _g + _b) {
    //         fore_ = Blended.cache[fore_] = i
    //         break
    //       }
    //     }
    // }

  }

  x[1] = fore_;
  x[2] = back_;
  return x;
}

const proj = ProjectorFactory.fromHEX({
  min: 0,
  max: 32
}, ATLAS);
const DASH2 = Fluo.hex('--', Grey.darken_3);
const DASH6 = Fluo.hex('------', Grey.darken_3);

function n(n) {
  return (n ?? 0).toString(16).toUpperCase().padStart(6, '0');
}

n.sty = function (n) {
  return (n ?? 0).toString(16).padStart(2, '0');
};

function t(n) {
  return (n === null || n === void 0 ? void 0 : n.toString(16).toUpperCase().padStart(6, '0')) ?? DASH6;
}

t.sty = function (n) {
  return (n === null || n === void 0 ? void 0 : n.toString(16).padStart(2, '0')) ?? DASH2;
};

const lumToPrimitive = function (hint) {
  let {
    m,
    f,
    b
  } = this;
  const mode = this.modeSign;

  if (hint === NUM) {
    return parseInt(n.sty(m) + n(f) + n(b), 16);
  }

  if (hint === STR) {
    return proj.render(m, mode) + Fluo.int(t(f), t) + Fluo.int(t(b), b);
  }

  if (hint === DEF) {
    return `[${proj.render(m, mode)},${Fluo.int(t(f), t)},${Fluo.int(t(b), b)}]`;
  }

  return lumToSgr(this) + (this.ch ?? '+') + CSI + SGR; // throw new Error()
};

const NAC = null;
const GREY = rgbToInt([127, 127, 127]);
class Lum {
  constructor(m = null, f = null, b = null, c) {
    this.m = m;
    this.f = f;
    this.b = b;
    if (c) this.ch = c;
  }

  get mode() {
    return this.m;
  }

  set mode(value) {
    return this.m = value;
  }

  get fore() {
    return this.f;
  }

  set fore(value) {
    return this.f = value;
  }

  get back() {
    return this.b;
  }

  set back(value) {
    return this.b = value;
  }

  get modeSign() {
    const {
      m
    } = this;
    let tx = '';
    tx += m & 1 ? 'B' : '-'; // bold

    tx += m & 2 ? 'U' : '-'; // underline

    tx += m & 4 ? 'B' : '-'; // blink

    tx += m & 8 ? 'I' : '-'; // inverse

    tx += m & 16 ? 'H' : '-'; // hide

    return tx;
  }

  get bold() {
    return this.m & 1;
  }

  get underline() {
    return this.m & 2;
  }

  get blink() {
    return this.m & 4;
  }

  get inverse() {
    return this.m & 8;
  }

  get hide() {
    return this.m & 16;
  }

  static build(m, f, b, c) {
    return new Lum(m, f, b, c);
  }

  static from(lum, c) {
    return new Lum(lum.m, lum.f, lum.b, c ?? lum.ch);
  }

  [Symbol.toPrimitive](h) {
    return lumToPrimitive.call(this, h);
  }

  toString() {
    return lumToPrimitive.call(this);
  }

  inject(m, f, b, c) {
    this.m = m;
    this.f = f;
    this.b = b;
    if (c) this.ch = c;
    return this;
  }

  assign(lum, ch) {
    this.m = lum.m;
    this.f = lum.f;
    this.b = lum.b;
    if (ch) this.ch = ch;
    return this;
  }

  copy(ch) {
    return new Lum(this.m, this.f, this.b, ch ?? this.ch);
  }

  eq(some) {
    return this === some ? true : (this === null || this === void 0 ? void 0 : this.m) === (some === null || some === void 0 ? void 0 : some.m) && this.f === some.f && this.b === some.b;
  }

  blend(some, alpha) {
    if (some) {
      // if right provided: mixColors
      let [, f_, b_] = this,
          [, _f, _b] = some;
      if (b_ === NAC) b_ = 0; // if left is NAC: left is noir

      if (_b === NAC) _b = 0; // if right is NAC: right is noir

      b_ = mixColors(b_, _b, alpha); // mix

      if (f_ === NAC) {
        f_ = GREY;
      } // if left is NAC: left is grey
      else {
        if (_f === NAC) _f = GREY; // if right is NAC: right is grey

        f_ = mixColors(f_, _f, alpha); // mix
      }

      this[1] = f_, this[2] = b_;
    }

    return this;
  }

  reblend(main, alpha) {
    if (main) {
      // if right provided: mixColors
      let [, f_, b_] = this,
          [, _f, _b] = main;
      if (b_ === NAC) b_ = 0; // if left is NAC: left is noir

      if (_b === NAC) _b = 0; // if right is NAC: right is noir

      _b = mixColors(_b, b_, alpha); // mix

      if (_f === NAC) {
        _f = GREY;
      } // if left is NAC: left is grey
      else {
        if (f_ === NAC) f_ = GREY; // if right is NAC: right is grey

        _f = mixColors(_f, f_, alpha); // mix
      }

      this[1] = _f, this[2] = _b;
    }

    return this;
  }

  mergeSGR(sgrAttr, norm) {
    const vec = sgrAttr.slice(2, -1).split(';');
    if (!vec[0]) vec[0] = '0';
    let {
      m,
      f,
      b
    } = this;

    for (let i = 0, hi = vec.length, c; i < hi; i++) {
      c = +vec[i] || 0;

      if (c === 0) {
        ({
          m,
          f,
          b
        } = norm);
      } // normal / reset
      else if (c === 1) {
        m |= 1;
      } // bold
      else if (c === 4) {
        m |= 2;
      } // underline
      else if (c === 5) {
        m |= 4;
      } // blink
      else if (c === 7) {
        m |= 8;
      } // inverse
      else if (c === 8) {
        m |= 16;
      } // invisible / conceal / hide
      else if (c === 22) {
        m = norm.m;
      } // normal intensity
      else if (c === 24) {
        m = norm.m;
      } // not underlined
      else if (c === 25) {
        m = norm.m;
      } // not blink
      else if (c === 27) {
        m = norm.m;
      } // not inverse / reversed
      else if (c === 28) {
        m = norm.m;
      } // not conceal / reveal
      else if (c >= 30 && c <= 37) {
        f = c - 30;
      } // color
      else if (c === 38) {
        if (+vec[i + 1] === 5) {
          i += 2, f = +vec[i];
        } else if (+vec[i + 1] === 2) {
          ++i, f = vec[++i] + SC + vec[++i] + SC + vec[++i];
        }
      } else if (c === 39) {
        f = norm[1];
      } // default fg
      else if (c >= 40 && c <= 47) {
        b = c - 40;
      } else if (c === 48) {
        if (+vec[i + 1] === 5) {
          i += 2, b = +vec[i];
        } else if (+vec[i + 1] === 2) {
          ++i, b = vec[++i] + SC + vec[++i] + SC + vec[++i];
        }
      } else if (c === 49) {
        b = norm[2];
      } // default bg
      else if (c === 100) {
        f = norm[1], b = norm[2];
      } // default fg/bg
      else if (c >= 90 && c <= 97) {
        f = c - 90, f += 8;
      } else if (c >= 100 && c <= 107) {
        b = c - 100, b += 8;
      }
    }

    return this.inject(m, f, b);
  }

}

/**
 *
 * @param {string} name
 * @return {?number}
 * // color &= 7, color += 8
 */

const nameToColor = name => {
  let i;
  if (name) i = COLOR_CODES[name = name.replace(PUNC, '')];
  if (!nullish(i)) return isNaN(i) ? NAC$2 : COLORS_4BITS[i]; // 按位取反

  if (LIGHT.test(name)) i = COLOR_CODES[name.replace(LIGHT, '')];
  if (!nullish(i)) return isNaN(i) ? NAC$2 : COLORS_4BITS[i === 8 ? i - 1 : i + 8];
  return null;
};
const convHex = hex => hex[0] === '#' ? hexToInt(hex) : null;
const toInt = color => {
  const t = typeof color;
  color = t === NUM ? color : t === STR ? convHex(color) ?? nameToColor(color) ?? NAC$2 : Array.isArray(color) ? rgbToInt(color) : NAC$2;
  return color;
};
function styleToLum(style = {}, fore, back) {
  if (nullish(fore) && nullish(back)) {
    fore = style.fore || style.fg, back = style.back || style.bg;
  }

  if (typeof fore === FUN) fore = fore(this);
  if (typeof back === FUN) back = back(this);
  return new Lum(styleToMode(style), toInt(fore), toInt(back));
}
/**
 *
 * @param {string} sgr
 * @param {Lum} source
 * @param {Lum} norm
 * @returns {Lum}
 */

function sgrToLum(sgr, source, norm) {
  return new Lum().mergeSGR(sgr, norm);
}
/**
 *
 * @param {Lum} lum
 * @param {number} tputColors
 * @returns {string}
 */

function lumToSgr(lum, tputColors) {
  let tx = '';
  const {
    m,
    f,
    b
  } = lum;

  if (m & 1) {
    tx += '1;';
  } // bold


  if (m & 2) {
    tx += '4;';
  } // underline


  if (m & 4) {
    tx += '5;';
  } // blink


  if (m & 8) {
    tx += '7;';
  } // inverse


  if (m & 16) {
    tx += '8;';
  } // invisible


  if (!nullish(b)) {
    tx += '48;2;' + (b >> 16 & 0xFF) + ';' + (b >> 8 & 0xFF) + ';' + (b & 0xFF) + ';';
  }

  if (!nullish(f)) {
    tx += '38;2;' + (f >> 16 & 0xFF) + ';' + (f >> 8 & 0xFF) + ';' + (f & 0xFF) + ';';
  }

  if (tx[tx.length - 1] === ';') tx = tx.slice(0, -1);
  return CSI + tx + SGR;
}

export { COLORS_4BITS, COLOR_CODES, Lum, NAC$2 as NAC, blend, lumToSgr, mixColors, nameToColor, sgrToLum, styleToLum, toInt };
