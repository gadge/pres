import x256 from 'x256'
/*
* Recursively merge properties of two objects
*/
function MergeRecursive(obj1, obj2) {
  if (obj1 == null) return obj2
  if (obj2 == null) return obj1
  for (let p in obj2)
    try {
      // property in destination object set; update its value
      obj1[p] = obj2[p].constructor === Object ? MergeRecursive(obj1[p], obj2[p]) : obj2[p]
    } catch (e) {
      // property in destination object not set; create it and set its value
      obj1[p] = obj2[p]
    }
  return obj1
}
function getTypeName(thing) { return thing === null ? '[object Null]' : Object.prototype.toString.call(thing) }
function abbreviateNumber(value) {
  let newValue = value
  if (value >= 1000) {
    const suffixes = [ '', 'k', 'm', 'b', 't' ]
    const suffixNum = Math.floor(('' + value).length / 3)
    let shortValue = ''
    for (let precision = 2; precision >= 1; precision--) {
      shortValue = parseFloat((suffixNum !== 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision))
      const dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '')
      if (dotLessShortValue.length <= 2) break
    }
    newValue = shortValue + suffixes[suffixNum]
  }
  return newValue
}
function getColorCode(color) { return Array.isArray(color) && color.length === 3 ? x256(color[0], color[1], color[2]) : color }
export {
  MergeRecursive,
  getTypeName,
  abbreviateNumber,
  getColorCode,
}
