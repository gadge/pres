import { hexToShort, hexToHsl } from '@palett/convert';
import { round } from '@aryth/math';
import { mapper } from '@vect/vector';
import { NUM, STR } from '@typen/enum-data-types';

const BLA = 0; // BLACK

const RED = 1; // RED

const GRE = 2; // GREEN

const YEL = 3; // YELLOW

const BLU = 4; // BLUE

const MAG = 5; // MAGENTA

const CYA = 6; // CYAN

const WHI = 7; // WHITE

const BLA_LITE = 8; // BLACK

const RED_LITE = 9; // RED

const GRE_LITE = 10; // GREEN

const YEL_LITE = 11; // YELLOW

const BLU_LITE = 12; // BLUE

const MAG_LITE = 13; // MAGENTA

const CYA_LITE = 14; // CYAN

const WHI_LITE = 15; // WHITE

const COLOR_NAMES_BIT3 = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];

const COLOR_NAMES_BIT4 = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'bright_black', 'bright_red', 'bright_green', 'bright_yellow', 'bright_blue', 'bright_magenta', 'bright_cyan', 'bright_white'];

const WEB_SAFE_MATRIX_HEX = [['#000', '#300', '#600', '#900', '#C00', '#F00'], ['#003', '#303', '#603', '#903', '#C03', '#F03'], ['#006', '#306', '#606', '#906', '#C06', '#F06'], ['#009', '#309', '#609', '#909', '#C09', '#F09'], ['#00C', '#30C', '#60C', '#90C', '#C0C', '#F0C'], ['#00F', '#30F', '#60F', '#90F', '#C0F', '#F0F'], ['#030', '#330', '#630', '#930', '#C30', '#F30'], ['#033', '#333', '#633', '#933', '#C33', '#F33'], ['#036', '#336', '#636', '#936', '#C36', '#F36'], ['#039', '#339', '#639', '#939', '#C39', '#F39'], ['#03C', '#33C', '#63C', '#93C', '#C3C', '#F3C'], ['#03F', '#33F', '#63F', '#93F', '#C3F', '#F3F'], ['#060', '#360', '#660', '#960', '#C60', '#F60'], ['#063', '#363', '#663', '#963', '#C63', '#F63'], ['#066', '#366', '#666', '#966', '#C66', '#F66'], ['#069', '#369', '#669', '#969', '#C69', '#F69'], ['#06C', '#36C', '#66C', '#96C', '#C6C', '#F6C'], ['#06F', '#36F', '#66F', '#96F', '#C6F', '#F6F'], ['#090', '#390', '#690', '#990', '#C90', '#F90'], ['#093', '#393', '#693', '#993', '#C93', '#F93'], ['#096', '#396', '#696', '#996', '#C96', '#F96'], ['#099', '#399', '#699', '#999', '#C99', '#F99'], ['#09C', '#39C', '#69C', '#99C', '#C9C', '#F9C'], ['#09F', '#39F', '#69F', '#99F', '#C9F', '#F9F'], ['#0C0', '#3C0', '#6C0', '#9C0', '#CC0', '#FC0'], ['#0C3', '#3C3', '#6C3', '#9C3', '#CC3', '#FC3'], ['#0C6', '#3C6', '#6C6', '#9C6', '#CC6', '#FC6'], ['#0C9', '#3C9', '#6C9', '#9C9', '#CC9', '#FC9'], ['#0CC', '#3CC', '#6CC', '#9CC', '#CCC', '#FCC'], ['#0CF', '#3CF', '#6CF', '#9CF', '#CCF', '#FCF'], ['#0F0', '#3F0', '#6F0', '#9F0', '#CF0', '#FF0'], ['#0F3', '#3F3', '#6F3', '#9F3', '#CF3', '#FF3'], ['#0F6', '#3F6', '#6F6', '#9F6', '#CF6', '#FF6'], ['#0F9', '#3F9', '#6F9', '#9F9', '#CF9', '#FF9'], ['#0FC', '#3FC', '#6FC', '#9FC', '#CFC', '#FFC'], ['#0FF', '#3FF', '#6FF', '#9FF', '#CFF', '#FFF']];

const WEB_SAFE_MATRIX_INDEX = [[16, 52, 88, 124, 160, 196], [17, 53, 89, 125, 161, 197], [18, 54, 90, 126, 162, 198], [19, 55, 91, 127, 163, 199], [20, 56, 92, 128, 164, 200], [21, 57, 93, 129, 165, 201], [22, 58, 94, 130, 166, 202], [23, 59, 95, 131, 167, 203], [24, 60, 96, 132, 168, 204], [25, 61, 97, 133, 169, 205], [26, 62, 98, 134, 170, 206], [27, 63, 99, 135, 171, 207], [28, 64, 100, 136, 172, 208], [29, 65, 101, 137, 173, 209], [30, 66, 102, 138, 174, 210], [31, 67, 103, 139, 175, 211], [32, 68, 104, 140, 176, 212], [33, 69, 105, 141, 177, 213], [34, 70, 106, 142, 178, 214], [35, 71, 107, 143, 179, 215], [36, 72, 108, 144, 180, 216], [37, 73, 109, 145, 181, 217], [38, 74, 110, 146, 182, 218], [39, 75, 111, 147, 183, 219], [40, 76, 112, 148, 184, 220], [41, 77, 113, 149, 185, 221], [42, 78, 114, 150, 186, 222], [43, 79, 115, 151, 187, 223], [44, 80, 116, 152, 188, 224], [45, 81, 117, 153, 189, 225], [46, 82, 118, 154, 190, 226], [47, 83, 119, 155, 191, 227], [48, 84, 120, 156, 192, 228], [49, 85, 121, 157, 193, 229], [50, 86, 122, 158, 194, 230], [51, 87, 123, 159, 195, 231]];

// XTERM_COLORS
const COLOR_HEXES_BIT4 = ['#000000', // black
'#cd0000', // red3
'#00cd00', // green3
'#cdcd00', // yellow3
'#0000ee', // blue2
'#cd00cd', // magenta3
'#00cdcd', // cyan3
'#e5e5e5', // gray90
'#7f7f7f', // gray50
'#ff0000', // red
'#00ff00', // green
'#ffff00', // yellow
'#5c5cff', // rgb:5c/5c/ff
'#ff00ff', // magenta
'#00ffff', // cyan
'#ffffff' // white
];

// import { init } from '@vect/vector'
// export const GREYS2 = Object.fromEntries(init(24, i => [ i + 232, '#' + d2(8 + i * 10).repeat(3) ]))
const d2 = n => (n = n.toString(16)).length === 1 ? '0' + n : n;

const byteToGrey = i => '#' + d2(8 + (i - 232) * 10).repeat(3);

const byteToCoord = i => {
  i -= 16;
  const x = i % 36,
        y = ~~(i / 36);
  return [x, y];
};
const coordToWeb = (x, y) => {
  const r = y * 3,
        g = ~~(x / 6) * 3,
        b = x % 6 * 3;
  return '#' + r.toString(16) + g.toString(16) + b.toString(16);
};
const byteToWeb = i => {
  i -= 16;
  const x = i % 36,
        y = ~~(i / 36);
  const r = y * 3,
        g = ~~(x / 6) * 3,
        b = x % 6 * 3;
  return '#' + r.toString(16) + g.toString(16) + b.toString(16);
};

function srgbToWeb(r, g, b) {
  r = round(r / 3); // get R from RrGgBb

  g = round(g / 3); // get G from RrGgBb

  b = round(b / 3); // get B from RrGgBb

  return r * 36 + (g * 6 + b) + 16; //  x = g * 6 + b, y = r
}
function srgbToCoord(r, g, b) {
  r = round(r / 3); // get R from RrGgBb

  g = round(g / 3); // get G from RrGgBb

  b = round(b / 3); // get B from RrGgBb

  return [g * 6 + b, r]; //  x = g * 6 + b, y = r
}
function coordToByte(x, y) {
  return y * 36 + x + 16;
}

function hexToWeb(hex) {
  const s = hexToShort(hex);
  return srgbToWeb(s >> 8 & 0xf, s >> 4 & 0xf, s & 0xf);
}
function hexToCoord(hex) {
  const s = hexToShort(hex);
  return srgbToCoord(s >> 8 & 0xf, s >> 4 & 0xf, s & 0xf);
}

const byteToHex = i => (i &= 0xff, i < 16 ? COLOR_HEXES_BIT4[i] : i >= 232 ? byteToGrey(i) : byteToWeb(i));

const byteToForeSgra = n => {
  if (n === 0x1ff) {
    return '';
  }

  if (n < 8) return String(n + 30);
  if (n < 16) return String(n - 8 + 90);
  return '38;5;' + n;
};
const byteToBackSgra = n => {
  if (n === 0x1ff) {
    return '';
  }

  if (n < 8) return String(n + 40);
  if (n < 16) return String(n - 8 + 100);
  return '48;5;' + n;
};

const SLOPE$1 = 5 / 3;
const hslToBit3 = ([h, s, l]) => {
  if (l >= 95) return WHI;
  if (l <= 5) return BLA;
  if (s <= 3) return l <= 50 ? BLA : WHI;
  const y = h * SLOPE$1;
  if (h <= 60) return l + y <= 100 ? RED : YEL;
  if (h <= 120) return l + 100 <= y ? GRE : YEL;
  if (h <= 180) return l + y <= 300 ? GRE : CYA;
  if (h <= 240) return l + 300 <= y ? BLU : CYA;
  if (h <= 300) return l + y <= 500 ? BLU : MAG;
  if (h <= 360) return l + 500 <= y ? RED : MAG; // return WHI
}; // const fDA = x => -x * SLOPE + 100
// const fUA = x => x * SLOPE - 100
// const fDB = x => -x * SLOPE + 300
// const fUB = x => x * SLOPE - 300
// const fDC = x => -x * SLOPE + 500
// const fUC = x => x * SLOPE - 500

const SLOPE = 5 / 3;
const hslToBit4 = ([h, s, l]) => {
  if (l >= 95) return WHI_LITE;
  if (l <= 5) return BLA;
  if (s <= 3) return l <= 50 ? BLA_LITE : WHI;
  const y = h * SLOPE;
  if (h <= 60) return l + y <= 100 ? l < 50 ? RED : RED_LITE : l < 50 ? YEL : YEL_LITE;
  if (h <= 120) return l + 100 <= y ? l < 50 ? GRE : GRE_LITE : l < 50 ? YEL : YEL_LITE;
  if (h <= 180) return l + y <= 300 ? l < 50 ? GRE : GRE_LITE : l < 50 ? CYA : CYA_LITE;
  if (h <= 240) return l + 300 <= y ? l < 50 ? BLU : BLU_LITE : l < 50 ? CYA : CYA_LITE;
  if (h <= 300) return l + y <= 500 ? l < 50 ? BLU : BLU_LITE : l < 50 ? MAG : MAG_LITE;
  if (h <= 360) return l + 500 <= y ? l < 50 ? RED : RED_LITE : l < 50 ? MAG : MAG_LITE; // return WHI
}; // const fDA = x => -x * SLOPE + 100
// const fUA = x => x * SLOPE - 100
// const fDB = x => -x * SLOPE + 300
// const fUB = x => x * SLOPE - 300
// const fDC = x => -x * SLOPE + 500
// const fUC = x => x * SLOPE - 500

const CACHE8 = {};
const CACHE16 = {};
const degrade = (byte, total) => {
  var _ref, _ref2, _byte;

  // console.log('>> [degrade]', byte, total)
  if (!total) return byte;
  if (total <= 16 && 16 <= byte) return CACHE16[byte] ?? (CACHE16[byte] = (_ref = (_ref2 = (_byte = byte, byteToHex(_byte)), hexToHsl(_ref2)), hslToBit4(_ref)));

  if (total <= 8) {
    var _ref3, _ref4, _byte2;

    if (16 <= byte) return CACHE8[byte] ?? (CACHE8[byte] = (_ref3 = (_ref4 = (_byte2 = byte, byteToHex(_byte2)), hexToHsl(_ref4)), hslToBit3(_ref3)));
    if (8 <= byte) return byte - 8;
  }

  if (total <= 2 && 2 <= byte) return byte % 2;
  return byte;
};

const SHORT16 = mapper(COLOR_HEXES_BIT4, hexToShort);
function hexToBit4(hex) {
  for (let i = 0, short = hexToShort(hex); i < SHORT16.length; i++) if (short === SHORT16[i]) return i;

  return null;
}

const BIT4_TO_GREY_SCALE = {
  0: 0,
  1: 2,
  2: 3,
  3: 5,
  4: 7,
  5: 8,
  6: 10,
  7: 11,
  8: 13,
  9: 15,
  10: 16,
  11: 18,
  12: 19,
  13: 21,
  14: 23
};
const srgbToGrey = (r, g, b) => {
  if (r !== g || g !== b) return null;
  const pos = BIT4_TO_GREY_SCALE[r];
  return pos < 24 ? pos : null;
};

const CACHE$1 = {};
const hexToByte = hex => {
  // if (!hex?.length) return null
  if (hex.charAt(0) !== '#') return null;
  const s = hexToShort(hex);
  const r = s >> 8 & 0xf,
        g = s >> 4 & 0xf,
        b = s & 0xf;
  return CACHE$1[hex] ?? (CACHE$1[hex] = hexToBit4(hex) ?? srgbToGrey(r, g, b) ?? srgbToWeb(r, g, b));
};

function shortToBit4(short) {
  for (let i = 0; i < SHORT16.length; i++) if (short === SHORT16[i]) return i;

  return null;
}

const CACHE = {};
const rgbToByte = (r, g, b) => {
  r = r >> 4 & 0xf;
  g = g >> 4 & 0xf;
  b = b >> 4 & 0xf;
  const s = r << 8 | g << 4 | b;
  return CACHE[s] ?? (CACHE[s] = shortToBit4(s) ?? srgbToGrey(r, g, b) ?? srgbToWeb(r, g, b));
};

// export const NAC = 1 << 24 // 16777216 = 256 * 256 * 256
const NORMAL_COLOR_CODES = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  grey: 15,
  gray: 15
};
const BRIGHT_COLOR_CODES = {
  black: 8,
  red: 9,
  green: 10,
  yellow: 11,
  blue: 12,
  magenta: 13,
  cyan: 14,
  white: 15,
  grey: 7,
  gray: 7
};
const LIGHT = /^(light|bright)\W*/;
/**
 *
 * @param {string} name
 * @return {?number}
 * // color &= 7, color += 8
 */

const nameToByte = name => NORMAL_COLOR_CODES[name] ?? BRIGHT_COLOR_CODES[name.replace(LIGHT, '')];

function toByte(color) {
  const t = typeof color;
  if (t === NUM) return color & 0x1ff;
  if (t === STR) return hexToByte(color) ?? nameToByte(color) ?? 0x1ff;
  if (Array.isArray(color)) return rgbToByte.apply(null, color);
  return 0x1ff;
}

export { COLOR_HEXES_BIT4, COLOR_NAMES_BIT3, COLOR_NAMES_BIT4, WEB_SAFE_MATRIX_HEX, WEB_SAFE_MATRIX_INDEX, byteToBackSgra, byteToCoord, byteToForeSgra, byteToGrey, byteToHex, byteToWeb, coordToByte, coordToWeb, degrade, hexToByte, hexToCoord, hexToWeb, rgbToByte, srgbToCoord, srgbToWeb, toByte };
