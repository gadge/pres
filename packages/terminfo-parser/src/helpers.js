import fs   from 'fs'
import path from 'path'
import {slice} from '@pres/util-helpers'
/**
 * Helpers
 */
export function noop() { return '' }
noop.unsupported = true
// export function merge(a, b) { return Object.keys(b).forEach(key => a[key] = b[key]), a }
export function write(data) { return process.stdout.write(data) }
export function tryRead(file) {
  if (Array.isArray(file)) {
    for (let i = 0; i < file.length; i++) {
      const data = tryRead(file[i])
      if (data) return data
    }
    return ''
  }
  if (!file) return ''
  file = path.resolve.apply(path, arguments)
  try {
    return fs.readFileSync(file, 'utf8')
  } catch (e) {
    return ''
  }
}
/**
 * sprintf
 *  http://www.cplusplus.com/reference/cstdio/printf/
 */
export function sprintf(src) {
  const params = Array.prototype.slice.call(arguments, 1),
        rule   = /%([\-+# ]{1,4})?(\d+(?:\.\d+)?)?([doxXsc])/g
  let i = 0
  return src.replace(rule, (_, flag, width, type) => {
    const flags = (flag || '').split('')
    let param = params[i] != null ? params[i] : ''
    const initial = param
    // , width = +width,
    const opt = {}
    let pre = ''
    i++
    switch (type) {
      case 'd': // signed int
        param = (+param).toString(10)
        break
      case 'o': // unsigned octal
        param = (+param).toString(8)
        break
      case 'x': // unsigned hex int
        param = (+param).toString(16)
        break
      case 'X': // unsigned hex int uppercase
        param = (+param).toString(16).toUppercase()
        break
      case 's': // string
        break
      case 'c': // char
        param = isFinite(param)
          ? String.fromCharCode(param || 0x80)
          : ''
        break
    }
    flags.forEach(flag => {
      switch (flag) {
        // left-justify by width
        case '-':
          opt.left = true
          break
        // always precede numbers with their signs
        case '+':
          opt.signs = true
          break
        // used with o, x, X - value is preceded with 0, 0x, or 0X respectively.
        // used with a, A, e, E, f, F, g, G - forces written output to contain
        // a decimal point even if no more digits follow
        case '#':
          opt.hexpoint = true
          break
        // if no sign is going to be written, black space in front of the value
        case ' ':
          opt.space = true
          break
      }
    })
    width = +width.split('.')[0]
    // Should this be for opt.left too?
    // Example: %2.2X - turns 0 into 00
    if (width && !opt.left) {
      param = param + ''
      while (param.length < width) { param = '0' + param }
    }
    if (opt.signs) { if (+initial >= 0) { pre += '+' } }
    if (opt.space) { if (!opt.signs && +initial >= 0) { pre += ' ' } }
    if (opt.hexpoint) {
      switch (type) {
        case 'o': // unsigned octal
          pre += '0'
          break
        case 'x': // unsigned hex int
          pre += '0x'
          break
        case 'X': // unsigned hex int uppercase
          pre += '0X'
          break
      }
    }
    if (opt.left) {
      if (width > (pre.length + param.length)) {
        width -= pre.length + param.length
        pre = Array(width + 1).join(' ') + pre
      }
    }
    return pre + param
  })
}