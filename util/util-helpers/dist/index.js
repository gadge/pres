import { toByte }   from '@pres/util-byte-colors'
import * as unicode from '@pres/util-unicode'
import { OBJ }      from '@typen/enum-data-types'
import fs           from 'fs'

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
    files = fs.readdirSync(dir)
  } catch (e) {
    files = []
  }

  for (let i = 0; i < files.length; i++) {
    file = files[i]
    if (file === target) return ( dir === '/' ? '' : dir ) + '/' + file

    try {
      stat = fs.lstatSync(( dir === '/' ? '' : dir ) + '/' + file)
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
const dropUnicode = text => !text ? '' : text.replace(unicode.chars.all, '??').replace(unicode.chars.combining, '').replace(unicode.chars.surrogate, '?')
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
const getColorCode = color => toByte(color) // export const getColorCode = color =>
//   Array.isArray(color) && color.length === 3
//     ? x256.apply(null, color)
//     : color

class LogService {
  static localInfo = (theme, content) => {
    if (typeof content === OBJ) content = JSON.stringify(content, null, 4)
    fs.writeFileSync(process.cwd() + '/local/' + theme + '.json', content)
  }
}

export {
  LogService, MergeRecursive, abbrNumber, asort, MergeRecursive as assignDeep, cleanTags, dropUnicode, escape, findFile, generateTags,
  getColorCode, getTypeName, hsort, merge, nextTick, slice, stripTags
}
