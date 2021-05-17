import { noop, write } from './helpers'

export function termPrint(code, print, done) {
  const xon = !this.boo.needs_xon_xoff || this.boo.xon_xoff
  print = print || write
  done = done || noop
  if (!this.padding) { return print(code), done() }
  const parts = code.split(/(?=\$<[\d.]+[*\/]{0,2}>)/)
  let i = 0
  function next() {
    if (i === parts.length) return done()
    let part = parts[i++]
    const padding = /^\$<([\d.]+)([*\/]{0,2})>/.exec(part)
    let amount,
        suffix
    if (!padding) { return print(part), next() }
    part = part.substring(padding[0].length)
    amount = +padding[1]
    suffix = padding[2]
    // A `/'  suffix indicates  that  the  padding  is  mandatory and forces a delay of the given number of milliseconds even on devices for which xon is present to indicate flow control.
    if (xon && !~suffix.indexOf('/')) { return print(part), next() }
    // A `*' indicates that the padding required is proportional to the number of lines affected by the operation,
    // and the amount given is the per-affected-unit padding required.
    // (In the case of insert character, the factor is still the number of lines affected.)
    // Normally, padding is advisory if the device has the xon capability;
    // it is used for cost computation but does not trigger delays.
    if (~suffix.indexOf('*')) { } // amount = amount
    return setTimeout(() => (print(part), next()), amount)
  }
  next()
}