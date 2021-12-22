const fs    = require('fs')
  , blessed = require('../index')
  , unicode = blessed.unicode

const screen = Screen.build({
  dump: process.cwd() + '/logs/unicode.log',
  smartCSR: true,
  dockBorders: true,
  useBCE: true,
  fullUnicode: ~process.argv.indexOf('-') ? false : true,
  warnings: true
})

/**
 * Unicode Characters
 */
const DU = unicode.fromCodePoint(0x675C)

// var JUAN = '鹃';
const JUAN = unicode.fromCodePoint(0x9E43)

// one flew over the 杜鹃's nest.
// var DOUBLE = '杜鹃';
const DOUBLE = DU + JUAN

// var SURROGATE_DOUBLE = '𰀀';
// var SURROGATE_DOUBLE = String.fromCharCode(0xD880, 0xDC00);
// var SURROGATE_DOUBLE = unicode.fromCodePoint(0x30000);

// var SURROGATE_DOUBLE = '𠀀';
// var SURROGATE_DOUBLE = String.fromCharCode(0xd840, 0xdc00);
const SURROGATE_DOUBLE = unicode.fromCodePoint(0x20000)

// var SURROGATE_DOUBLE = '🉐';
// var SURROGATE_DOUBLE = String.fromCharCode(0xD83C, 0xDE50);
// var SURROGATE_DOUBLE = unicode.fromCodePoint(0x1F250);

// var SURROGATE_SINGLE = '𝌆';
// var SURROGATE_SINGLE = String.fromCharCode(0xD834, 0xDF06);
const SURROGATE_SINGLE = unicode.fromCodePoint(0x1D306)

// var COMBINE_NONSURROGATE = 's̀'.substring(1); // s + combining
const COMBINE_NONSURROGATE = unicode.fromCodePoint(0x0300)

// var COMBINE = 's𐨁'.substring(1); // s + combining
// var COMBINE = String.fromCharCode(0xD802, 0xDE01);
const COMBINE = unicode.fromCodePoint(0x10A01)

/**
 * Content
 */
let lorem = fs.readFileSync(__dirname + '/lorem.txt', 'utf8')

lorem = lorem.replace(/e/gi, DOUBLE)
//lorem = lorem.replace(/e/gi, DU);
//lorem = lorem.replace(/r/gi, JUAN);
lorem = lorem.replace(/a/gi, SURROGATE_DOUBLE)
lorem = lorem.replace(/o/gi, SURROGATE_SINGLE)
if (~process.argv.indexOf('s')) {
  lorem = lorem.replace(/s/gi, 's' + COMBINE)
}
else {
  lorem = lorem.replace('s', 's' + COMBINE)
}

// Surrogate pair emoticons from the SMP:
lorem += '\n'
lorem += 'emoticons: '
for (let point = 0x1f600; point <= 0x1f64f; point++) {
  // These are technically single-width,
  // but they _look_ like they should be
  // double-width in gnome-terminal (they overlap).
  const emoticon = unicode.fromCodePoint(point)
  lorem += emoticon + ' '
}

/**
 * UI
 */
const main = Box.build({
  parent: screen,
  left: 'center',
  top: 'center',
  width: '50%',
  height: '50%',
  style: {
    bg: 'grey'
  },
  border: 'line',
  draggable: true,
  tags: true,
  // content: '{black-bg}{blue-fg}{bold}' + lorem + '{/}',
  // XXX {bold} breaks JUAN!
  content: '{black-bg}{light-blue-fg}' + lorem + '{/}',
  scrollable: true,
  alwaysScroll: true,
  keys: true,
  vi: true,
  mouse: true
})

main.focus()

screen.key('q', function () {
  return screen.destroy()
})

screen.render()
