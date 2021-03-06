/**
 * helpers.js - helpers for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
import * as unicode from '@pres/util-unicode'
import fs           from 'fs'

// /**
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

export const merge = (a, b) => ( Object.keys(b).forEach(key => a[key] = b[key]), a )

export const slice = Function.prototype.call.bind(Array.prototype.slice)

export const asort = obj => obj.sort((a, b) => {
  a = a.name.toLowerCase()
  b = b.name.toLowerCase()
  if (a[0] === '.' && b[0] === '.') { a = a[1], b = b[1] }
  else { a = a[0], b = b[0] }
  return a > b ? 1 : ( a < b ? -1 : 0 )
})

export const hsort = obj => obj.sort((a, b) => b.index - a.index)

export const findFile = (start, target) => ( function read(dir) {
  let files, file, stat, out
  if (dir === '/dev' || dir === '/sys' || dir === '/proc' || dir === '/net') return null
  try { files = fs.readdirSync(dir) } catch (e) { files = [] }
  for (let i = 0; i < files.length; i++) {
    file = files[i]
    if (file === target) return ( dir === '/' ? '' : dir ) + '/' + file
    try { stat = fs.lstatSync(( dir === '/' ? '' : dir ) + '/' + file) } catch (e) { stat = null }
    if (stat && stat.isDirectory() && !stat.isSymbolicLink()) {
      if (( out = read(( dir === '/' ? '' : dir ) + '/' + file) )) return out
    }
  }
  return null
} )(start)

export const escape = text => text.replace(/[{}]/g, ch => ch === '{' ? '{open}' : '{close}') // Escape text for tag-enabled elements.

export const generateTags = (style = {}, text) => {
  let open  = '',
      close = ''
  Object.keys(style).forEach(key => {
    let val = style[key]
    if (typeof val === 'string') {
      val = val
        .replace(/^light(?!-)/, 'light-')
        .replace(/^bright(?!-)/, 'bright-')
      open = '{' + val + '-' + key + '}' + open
      close += '{/' + val + '-' + key + '}'
    }
    else if (val === true) {
      open = '{' + key + '}' + open
      close += '{/' + key + '}'
    }
  })
  return text != null
    ? open + text + close
    : { open: open, close: close }
}
export const stripTags = text => !text ? '' : text.replace(/{(\/?)([\w\-,;!#]*)}/g, '').replace(/\x1b\[[\d;]*m/g, '')
export const cleanTags = text => stripTags(text).trim()
export const dropUnicode = text =>
  !text ? '' : text
    .replace(unicode.chars.all, '??')
    .replace(unicode.chars.combining, '')
    .replace(unicode.chars.surrogate, '?')

export const nextTick = global.setImmediate || process.nextTick.bind(process)
// const parseTags = function (text, screen) {
//   return helpers.Element.prototype._parseTags.call(
//     { parseTags: true, screen: screen || helpers.Screen.global }, text)
// }


