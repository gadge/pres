'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var unicode = require('@pres/util-unicode')
var fs = require('fs')
var utilByteColors = require('@pres/util-byte-colors')
var enumDataTypes = require('@typen/enum-data-types')

function _interopDefaultLegacy(e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e } }

function _interopNamespace(e) {
  if (e && e.__esModule) return e
  var n = Object.create(null)
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k)
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k] }
        })
      }
    })
  }
  n["default"] = e
  return Object.freeze(n)
}

var unicode__namespace = /*#__PURE__*/_interopNamespace(unicode)
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs)

/**
 * helpers.js - helpers for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
    //  * Helpers
    //  */
    // export const helpers = {
    //   get Screen() {
    //     if (!helpers._screen) helpers._screen = Screen
    //     return helpers._screen
    //   },
    //   get Element() {
    //     if (!helpers._element) helpers._element = Element
    //     return helpers._element
    //   }
    // }

const merge = (a, b) => ( Object.keys(b).forEach(key => a[key] = b[key]), a )
const slice = Function.prototype.call.bind(Array.prototype.slice)
const asort = obj => obj.sort((a, b) => {
  a = a.name.toLowerCase()
  b = b.name.toLowerCase()

  if (a[0] === '.' && b[0] === '.') {
    a = a[1], b = b[1]
  }
  else {
    a = a[0], b = b[0]
  }

  return a > b ? 1 : a < b ? -1 : 0
})
const hsort = obj => obj.sort((a, b) => b.index - a.index)
const findFile = (start, target) => function read(dir) {
  let files, file, stat, out
  if (dir === '/dev' || dir === '/sys' || dir === '/proc' || dir === '/net') return null

  try {
    files = fs__default["default"].readdirSync(dir)
  } catch (e) {
    files = []
  }

  for (let i = 0; i < files.length; i++) {
    file = files[i]
    if (file === target) return ( dir === '/' ? '' : dir ) + '/' + file

    try {
      stat = fs__default["default"].lstatSync(( dir === '/' ? '' : dir ) + '/' + file)
    } catch (e) {
      stat = null
    }

    if (stat && stat.isDirectory() && !stat.isSymbolicLink()) {
      if (out = read(( dir === '/' ? '' : dir ) + '/' + file)) return out
    }
  }

  return null
}(start)
const escape = text => text.replace(/[{}]/g, ch => ch === '{' ? '{open}' : '{close}') // Escape text for tag-enabled elements.

const generateTags = (style = {}, text) => {
  let open  = '',
      close = ''
  Object.keys(style).forEach(key => {
    let val = style[key]

    if (typeof val === 'string') {
      val = val.replace(/^light(?!-)/, 'light-').replace(/^bright(?!-)/, 'bright-')
      open = '{' + val + '-' + key + '}' + open
      close += '{/' + val + '-' + key + '}'
    }
    else if (val === true) {
      open = '{' + key + '}' + open
      close += '{/' + key + '}'
    }
  })
  return text != null ? open + text + close : {
    open: open,
    close: close
  }
}
const stripTags = text => !text ? '' : text.replace(/{(\/?)([\w\-,;!#]*)}/g, '').replace(/\x1b\[[\d;]*m/g, '')
const cleanTags = text => stripTags(text).trim()
const dropUnicode = text => !text ? '' : text.replace(unicode__namespace.chars.all, '??').replace(unicode__namespace.chars.combining, '').replace(unicode__namespace.chars.surrogate, '?')
const nextTick = global.setImmediate || process.nextTick.bind(process) // const parseTags = function (text, screen) {
//   return helpers.Element.prototype._parseTags.call(
//     { parseTags: true, screen: screen || helpers.Screen.global }, text)
// }

function MergeRecursive(target, source) {
  if (target == null) return source
  if (source == null) return target

  for (let p in source) try {
    target[p] = source[p].constructor === Object ? MergeRecursive(target[p], source[p]) : source[p] // property in destination object set; update its value
  } catch (e) {
    target[p] = source[p] // property in destination object not set; create it and set its value
  }

  return target
}
function getTypeName(thing) {
  return thing === null ? '[object Null]' : Object.prototype.toString.call(thing)
}
function abbrNumber(value) {
  let v = value

  if (value >= 1000) {
    const SCALES = [ '', 'k', 'm', 'b', 't' ]
    const index = ~~( ( '' + value ).length / 3 )
    let abbr = ''

    for (let precision = 2; precision >= 1; precision--) {
      abbr = parseFloat(( index !== 0 ? value / 1000 ** index : value ).toPrecision(precision))
      const dotLessShortValue = ( abbr + '' ).replace(/[^a-zA-Z 0-9]+/g, '')
      if (dotLessShortValue.length <= 2) break
    }

    v = abbr + SCALES[index]
  }

  return v
}
const getColorCode = color => utilByteColors.toByte(color) // export const getColorCode = color =>
//   Array.isArray(color) && color.length === 3
//     ? x256.apply(null, color)
//     : color

class LogService {
  static localInfo = (theme, content) => {
    if (typeof content === enumDataTypes.OBJ) content = JSON.stringify(content, null, 4)
    fs__default["default"].writeFileSync(process.cwd() + '/local/' + theme + '.json', content)
  }
}

exports.LogService = LogService
exports.MergeRecursive = MergeRecursive
exports.abbrNumber = abbrNumber
exports.asort = asort
exports.assignDeep = MergeRecursive
exports.cleanTags = cleanTags
exports.dropUnicode = dropUnicode
exports.escape = escape
exports.findFile = findFile
exports.generateTags = generateTags
exports.getColorCode = getColorCode
exports.getTypeName = getTypeName
exports.hsort = hsort
exports.merge = merge
exports.nextTick = nextTick
exports.slice = slice
exports.stripTags = stripTags
