export function MergeRecursive(target, source) {
  if (target == null) return source
  if (source == null) return target
  for (let p in source)
    try {
      target[p] = source[p].constructor === Object ? MergeRecursive(target[p], source[p]) : source[p] // property in destination object set; update its value
    } catch (e) {
      target[p] = source[p] // property in destination object not set; create it and set its value
    }
  return target
}
export function getTypeName(thing) { return thing === null ? '[object Null]' : Object.prototype.toString.call(thing) }
export function abbrNumber(value) {
  let v = value
  if (value >= 1000) {
    const SCALES = [ '', 'k', 'm', 'b', 't' ]
    const index = ~~(('' + value).length / 3)
    let abbr = ''
    for (let precision = 2; precision >= 1; precision--) {
      abbr = parseFloat((index !== 0 ? (value / (1000 ** index)) : value).toPrecision(precision))
      const dotLessShortValue = (abbr + '').replace(/[^a-zA-Z 0-9]+/g, '')
      if (dotLessShortValue.length <= 2) break
    }
    v = abbr + SCALES[index]
  }
  return v
}
export const getColorCode = color =>
  Array.isArray(color) && color.length === 3
    ? x256.apply(null, color)
    : color