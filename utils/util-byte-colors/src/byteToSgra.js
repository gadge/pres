export const indexValid = (index) => index !== 0x1ff

export const byteToSgra = (index, isFore, total) => {
  let out = ''
  if (indexValid(index)) {
    f = this.#reduceColor(f)
    if (index < 16) {
      index += index < 8 ? 30 : index < 16 ? ( index -= 8, isFore ? 90 : 100 ) : 0
      out += index
    }
    else { out += isFore ? '38' : '48' + ';5;' + index }
    return out
  }

  if (index < 16) {
    index += index < 8 ? 40 : index < 16 ? ( index -= 8, 100 ) : 0
    out += index + ';'
  }
  else { out += '48;5;' + index + ';' }
}

