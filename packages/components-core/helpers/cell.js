export function inject(target, source, char) {
  target[0] = source[0]
  target[1] = source[1]
  target[2] = source[2]
  if (char) target.ch = char
  return target
}

export function shallow(source) {
  const target = source.slice()
  target.ch = source.ch
  return target
}

export function equal(x, y) { return x[0] === y[0] && x[1] === y[1] && x[2] === y[2] }