export function assign(target, source, char) {
  target[0] = source[0]
  target[1] = source[1]
  target[2] = source[2]
  if (char) target.ch = char
}