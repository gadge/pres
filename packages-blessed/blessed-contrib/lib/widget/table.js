import * as Mixin from '@ject/mixin'
import { ATTACH } from '@pres/enum-events'
import stripAnsi  from 'strip-ansi'
import blessed    from '../vendor/blessed'

const Node = blessed.Node,
      Box  = blessed.Box
export function Table(options) {
  const self = this
  if (!(this instanceof Node)) { return new Table(options) }
  if (Array.isArray(options.columnSpacing)) {
    throw 'Error: columnSpacing cannot be an array.\r\n' +
    'Note: From release 2.0.0 use property columnWidth instead of columnSpacing.\r\n' +
    'Please refere to the README or to https://github.com/yaronn/blessed-contrib/issues/39'
  }
  if (!options.columnWidth) {
    throw 'Error: A table must get columnWidth as a property. Please refer to the README.'
  }
  options = options || {}
  options.columnSpacing = options.columnSpacing == null ? 10 : options.columnSpacing
  options.bold = true
  options.selectedFg = options.selectedFg || 'white'
  options.selectedBg = options.selectedBg || 'blue'
  options.fg = options.fg || 'green'
  options.bg = options.bg || ''
  options.interactive = (typeof options.interactive === 'undefined') ? true : options.interactive
  this.options = options
  Mixin.assign(this, new Box(options)) // Box.call(this, options)
  this.rows = blessed.list({ //height: 0,
    top: 2,
    width: 0,
    left: 1,
    style: {
      selected: {
        fg: options.selectedFg,
        bg: options.selectedBg
      },
      item: {
        fg: options.fg,
        bg: options.bg
      }
    },
    keys: options.keys,
    vi: options.vi,
    mouse: options.mouse,
    tags: true,
    interactive: options.interactive,
    screen: this.screen
  })
  this.append(this.rows)
  this.on(ATTACH, function () {
    if (self.options.data) { self.setData(self.options.data) }
  })
}
Table.prototype = Object.create(Box.prototype)
Table.prototype.focus = function () {
  this.rows.focus()
}
Table.prototype.render = function () {
  if (this.screen.focused == this.rows)
    this.rows.focus()
  this.rows.width = this.width - 3
  this.rows.height = this.height - 4
  Box.prototype.render.call(this)
}
Table.prototype.setData = function (table) {
  const self = this
  const dataToString = function (d) {
    let str = ''
    d.forEach(function (r, i) {
      const colsize = self.options.columnWidth[i],
            strip   = stripAnsi(r.toString()),
            ansiLen = r.toString().length - strip.length
      let spaceLength = colsize - strip.length + self.options.columnSpacing
      r = r.toString().substring(0, colsize + ansiLen) //compensate for ansi len
      if (spaceLength < 0) {
        spaceLength = 0
      }
      const spaces = new Array(spaceLength).join(' ')
      str += r + spaces
    })
    return str
  }
  const formatted = []
  table.data.forEach(function (d) {
    const str = dataToString(d)
    formatted.push(str)
  })
  this.setContent(dataToString(table.headers))
  this.rows.setItems(formatted)
}
Table.prototype.getOptionsPrototype = function () {
  return {
    keys: true,
    fg: 'white',
    interactive: false,
    label: 'Active Processes',
    width: '30%',
    height: '30%',
    border: { type: 'line', fg: 'cyan' },
    columnSpacing: 10,
    columnWidth: [ 16, 12 ],
    data: {
      headers: [ 'col1', 'col2' ],
      data: [ [ 'a', 'b' ],
        [ '5', 'u' ],
        [ 'x', '16.1' ] ]
    }
  }
}
Table.prototype.type = 'table'

