const WORD = /\w/

export function signToMode(sign) {
  let v = 0
  if (WORD.test(sign[0])) v |= 1
  if (WORD.test(sign[1])) v |= 2
  if (WORD.test(sign[2])) v |= 4
  if (WORD.test(sign[3])) v |= 8
  if (WORD.test(sign[4])) v |= 16
  return v
}