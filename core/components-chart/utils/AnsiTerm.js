import x256 from 'x256'

export function AnsiTerm(width, height) {
  this.width = width
  this.height = height
  this.clear()

  this.fontFg = 'normal'
  this.fontBg = 'normal'
  this.color = 'normal'
}

export const colors = { black: 0, red: 1, green: 2, yellow: 3, blue: 4, magenta: 5, cyan: 6, white: 7 }

function getFgCode(color) {
  // String Value
  if (typeof color == 'string' && color !== 'normal') {return '\x1b[3' + colors[color] + 'm'}
  // RGB Value
  else if (Array.isArray(color) && color.length === 3) {return '\x1b[38;5;' + x256(color[0], color[1], color[2]) + 'm'}
  // Number
  else if (typeof color == 'number') {return '\x1b[38;5;' + color + 'm'}
  // Default
  else {return '\x1b[39m'}
}

function getBgCode(color) {
  // String Value
  if (typeof color == 'string' && color !== 'normal') {
    return '\x1b[4' + colors[color] + 'm'
  }
  // RGB Value
  else if (Array.isArray(color) && color.length === 3) {
    return '\x1b[48;5;' + x256(color[0], color[1], color[2]) + 'm'
  }
  // Number
  else if (typeof color == 'number') {
    return '\x1b[48;5;' + color + 'm'
  }
  // Default
  else {
    return '\x1b[49m'
  }
}

const methods = {
  set: function (coord) {
    const color = getBgCode(this.color)
    this.content[coord] = color + ' \x1b[49m'
  },
  unset: function (coord) {
    this.content[coord] = null
  },
  toggle: function (coord) {
    this.content[coord] === this.content[coord] == null ? 'p' : null
  }
}

Object.keys(methods).forEach(function (method) {
  AnsiTerm.prototype[method] = function (x, y) {
    if (!( x >= 0 && x < this.width && y >= 0 && y < this.height )) {
      return
    }
    const coord = this.getCoord(x, y)
    methods[method].call(this, coord)
  }
})

AnsiTerm.prototype.getCoord = function (x, y) {
  x = Math.floor(x)
  y = Math.floor(y)
  return x + this.width * y
}

AnsiTerm.prototype.clear = function () {
  this.content = new Array(this.width * this.height)
}

AnsiTerm.prototype.measureText = function (str) {
  return { width: str.length * 1 }
}

AnsiTerm.prototype.writeText = function (str, x, y) {
  //console.log(str + ": " + x + "," + y)
  const coord = this.getCoord(x, y)
  for (let i = 0; i < str.length; i++) {
    this.content[coord + i] = str[i]
  }

  const bg = getBgCode(this.color)
  const fg = getFgCode(this.fontFg)

  this.content[coord] = fg + bg + this.content[coord]
  this.content[coord + str.length - 1] += '\x1b[39m\x1b[49m'

}

AnsiTerm.prototype.frame = function frame(delimiter) {
  delimiter = delimiter || '\n'
  const result = []
  let i = 0, j = 0
  for (; i < this.content.length; i++, j++) {
    if (j === this.width) {
      result.push(delimiter)
      j = 0
    }

    if (this.content[i] == null) {
      result.push(' ')
    }
    else {
      result.push(this.content[i])
    }
  }
  result.push(delimiter)
  return result.join('')
}



