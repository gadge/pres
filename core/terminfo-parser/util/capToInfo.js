/**
 * _nc_captoinfo - ported to javascript directly from ncurses.
 * Copyright (c) 1998-2009,2010 Free Software Foundation, Inc.
 * See: ~/ncurses/ncurses/tinfo/captoinfo.c
 *
 * Convert a termcap string to terminfo format.
 * 'cap' is the relevant terminfo capability index.
 * 's' is the string value of the capability.
 * 'parameterized' tells what type of translations to do:
 *    % translations if 1
 *    pad translations if >=0
 */
export function capToInfo(cap, s, parameterized) {
  const self = this
  let capStart
  if (parameterized == null) parameterized = 0
  const MAX_PUSHED = 16,
        stack      = []
  let stackPtr = 0,
      onStack  = 0,
      seenM    = 0,
      seenN    = 0,
      seenR    = 0,
      param    = 1,
      i        = 0,
      out      = ''
  function warn(...args) {
    if (!self.debug) return void 0
    args[0] = 'capToInfo: ' + ( args[0] || '' )
    return console.log(args)
  }
  function isDigit(ch) { return ch >= '0' && ch <= '9' }
  function isGraph(ch) { return ch > ' ' && ch <= '~' }
  // convert a character to a terminfo push
  function cvtChar(sp) {
    let c = '\0',
        len
    let j = i
    switch (sp[j]) {
      case '\\':
        switch (sp[++j]) {
          case '\'':
          case '$':
          case '\\':
          case '%':
            c = sp[j]
            len = 2
            break
          case '\0':
            c = '\\'
            len = 1
            break
          case '0':
          case '1':
          case '2':
          case '3':
            len = 1
            while (isDigit(sp[j])) {
              c = String.fromCharCode(8 * c.charCodeAt(0) + ( sp[j++].charCodeAt(0) - '0'.charCodeAt(0) ))
              len++
            }
            break
          default:
            c = sp[j]
            len = 2
            break
        }
        break
      case '^':
        c = String.fromCharCode(sp[++j].charCodeAt(0) & 0x1f)
        len = 2
        break
      default:
        c = sp[j]
        len = 1
    }
    if (isGraph(c) && c !== ',' && c !== '\'' && c !== '\\' && c !== ':') {
      out += '%\''
      out += c
      out += '\''
    }
    else {
      out += '%{'
      if (c.charCodeAt(0) > 99) { out += String.fromCharCode(( c.charCodeAt(0) / 100 | 0 ) + '0'.charCodeAt(0)) }
      if (c.charCodeAt(0) > 9) { out += String.fromCharCode(( c.charCodeAt(0) / 10 | 0 ) % 10 + '0'.charCodeAt(0)) }
      out += String.fromCharCode(c.charCodeAt(0) % 10 + '0'.charCodeAt(0))
      out += '}'
    }
    return len
  }
  // push n copies of param on the terminfo stack if not already there
  function getParam(parm, n) {
    if (seenR) parm = parm === 1 ? 2 : parm === 2 ? 1 : parm
    if (onStack === parm) {
      if (n > 1) {
        warn('string may not be optimal')
        out += '%Pa'
        while (n--) { out += '%ga' }
      }
      return
    }
    if (onStack !== 0) { push() }
    onStack = parm
    while (n--) {
      out += '%p'
      out += String.fromCharCode('0'.charCodeAt(0) + parm)
    }
    if (seenN && parm < 3) { out += '%{96}%^' }
    if (seenM && parm < 3) { out += '%{127}%^' }
  }
  // push onstack on to the stack
  function push() {
    if (stackPtr >= MAX_PUSHED) { warn('string too complex to convert') }
    else { stack[stackPtr++] = onStack }
  }
  // pop the top of the stack into onstack
  function pop() {
    if (stackPtr === 0) {
      if (onStack === 0) { warn('I\'m confused') }
      else { onStack = 0 }
    }
    else { onStack = stack[--stackPtr] }
    param++
  }
  function see03() {
    getParam(param, 1)
    out += '%3d'
    pop()
  }
  function invalid() {
    out += '%'
    i--
    warn('unknown %% code %s (%#x) in %s', JSON.stringify(s[i]), s[i].charCodeAt(0), cap)
  }
  // skip the initial padding (if we haven't been told not to)
  capStart = null
  if (s == null) s = ''
  if (parameterized >= 0 && isDigit(s[i])) {
    for (capStart = i; ; i++) {
      if (!( isDigit(s[i]) || s[i] === '*' || s[i] === '.' )) {
        break
      }
    }
  }
  while (s[i]) {
    switch (s[i]) {
      case '%':
        i++
        if (parameterized < 1) {
          out += '%'
          break
        }
        switch (s[i++]) {
          case '%':
            out += '%'
            break
          case 'r':
            if (seenR++ === 1) warn('saw %%r twice in %s', cap)
            break
          case 'm':
            if (seenM++ === 1) warn('saw %%m twice in %s', cap)
            break
          case 'n':
            if (seenN++ === 1) warn('saw %%n twice in %s', cap)
            break
          case 'i':
            out += '%i'
            break
          case '6':
          case 'B':
            getParam(param, 1)
            out += '%{10}%/%{16}%*'
            getParam(param, 1)
            out += '%{10}%m%+'
            break
          case '8':
          case 'D':
            getParam(param, 2)
            out += '%{2}%*%-'
            break
          case '>':
            getParam(param, 2)
            // %?%{x}%>%t%{y}%+%;
            out += '%?'
            i += cvtChar(s)
            out += '%>%t'
            i += cvtChar(s)
            out += '%+%;'
            break
          case 'a':
            if (( s[i] === '=' || s[i] === '+' || s[i] === '-' ||
                s[i] === '*' || s[i] === '/' ) &&
              ( s[i + 1] === 'p' || s[i + 1] === 'c' ) &&
              s[i + 2] !== '\0' && s[i + 2]) {
              let l
              l = 2
              if (s[i] !== '=') { getParam(param, 1) }
              if (s[i + 1] === 'p') {
                getParam(param + s[i + 2].charCodeAt(0) - '@'.charCodeAt(0), 1)
                if (param !== onStack) {
                  pop()
                  param--
                }
                l++
              }
              else { i += 2, l += cvtChar(s), i -= 2 }
              switch (s[i]) {
                case '+':
                  out += '%+'
                  break
                case '-':
                  out += '%-'
                  break
                case '*':
                  out += '%*'
                  break
                case '/':
                  out += '%/'
                  break
                case '=':
                  onStack = seenR ? param === 1 ? 2 : param === 2 ? 1 : param : param
                  break
              }
              i += l
              break
            }
            getParam(param, 1)
            i += cvtChar(s)
            out += '%+'
            break
          case '+':
            getParam(param, 1)
            i += cvtChar(s)
            out += '%+%c'
            pop()
            break
          case 's':
            // #ifdef WATERLOO
            //          i += cvtChar(s);
            //          getparm(param, 1);
            //          out += '%-';
            // #else
            getParam(param, 1)
            out += '%s'
            pop()
            // #endif /* WATERLOO */
            break
          case '-':
            i += cvtChar(s)
            getParam(param, 1)
            out += '%-%c'
            pop()
            break
          case '.':
            getParam(param, 1)
            out += '%c'
            pop()
            break
          case '0': // not clear any of the historical termcaps did this
            if (s[i] === '3') {
              see03() // goto
              break
            }
            else if (s[i] !== '2') {
              invalid() // goto
              break
            }
          // FALLTHRU
          case '2':
            getParam(param, 1)
            out += '%2d'
            pop()
            break
          case '3':
            see03()
            break
          case 'd':
            getParam(param, 1)
            out += '%d'
            pop()
            break
          case 'f':
            param++
            break
          case 'b':
            param--
            break
          case '\\':
            out += '%\\'
            break
          default:
            invalid()
            break
        }
        break
      default:
        out += s[i++]
        break
      // #endif
    }
  }
  // Now, if we stripped off some leading padding, add it at the end
  // of the string as mandatory padding.
  if (capStart != null) {
    out += '$<'
    for (i = capStart; ; i++) {
      if (isDigit(s[i]) || s[i] === '*' || s[i] === '.') { out += s[i] }
      else { break }
    }
    out += '/>'
  }
  if (s !== out) {
    warn('Translating %s from %s to %s.', cap, JSON.stringify(s), JSON.stringify(out))
  }
  return out
}