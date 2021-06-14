export const percentToNum = percent => +percent.slice(0, -1) / 100
export const scaler = (tx, base) => {
  let [ percent, residual ] = tx.split(/(?=[+-])/)
  const n = base * percentToNum(percent) | 0
  return n + +( residual || 0 )
}