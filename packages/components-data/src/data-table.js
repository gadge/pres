import { MUTATE_PIGMENT }         from '@palett/enum-colorant-modes'
import { COLUMNWISE }             from '@palett/fluo'
import { fluoMatrix }             from '@palett/fluo-matrix'
import { fluoVector }             from '@palett/fluo-vector'
import { FRESH, METRO, SUBTLE }   from '@palett/presets'
import { Box }                    from '@pres/components-core'
import { ATTACH }                 from '@pres/enum-events'
import { tablePadder }            from '@spare/table-padder'
import { clearAnsi }              from '@texting/charset-ansi'
import { SP }                     from '@texting/enum-chars'
import { UND }                    from '@typen/enum-data-types'
import { mapper as mapperMatrix } from '@vect/matrix-mapper'
import { mapper as mapperVector } from '@vect/vector-mapper'
import { List }                   from './list'

export class DataTable extends Box {
  constructor(options) {
    // if (!(this instanceof Node)) { return new Table(options) }
    if (Array.isArray(options.columnSpacing))
      throw 'Error: columnSpacing cannot be an array.\r\n' +
      'Note: From release 2.0.0 use property columnWidth instead of columnSpacing.\r\n' +
      'Please refere to the README or to https://github.com/yaronn/blessed-contrib/issues/39'
    if (!options.columnWidth) throw 'Error: A table must get columnWidth as a property. Please refer to the README.'
    // options = options || {}
    options.columnSpacing = options.columnSpacing ?? 10
    options.bold = true
    options.selectedFg = options.selectedFg || 'white'
    options.selectedBg = options.selectedBg || 'blue'
    options.fg = options.fg || 'green'
    options.bg = options.bg || ''
    options.interactive = ( typeof options.interactive === UND ) ? true : options.interactive
    if (!options.sku) options.sku = 'data-table'
    // this.options = options
    super(options) // Mixin.assign(this, new Box(options)) // Box.call(this, options)
    const self = this
    this.rows = new List({ //height: 0,
      top: 2,
      width: 0,
      left: 1,
      style: {
        selected: { fg: options.selectedFg, bg: options.selectedBg },
        item: { fg: options.fg, bg: options.bg }
      },
      keys: options.keys,
      vi: options.vi,
      mouse: options.mouse,
      tags: true,
      interactive: options.interactive,
      screen: this.screen,
      sup: self
    })
    this.append(this.rows)
    this.on(ATTACH, () => { if (self.options.data) { self.setData(self.options.data) } })
    this.type = 'data-table'
  }
  static build(options) { return new DataTable(options) }
  focus() { this.rows.focus() }
  render() {
    if (this.screen.focused === this.rows) this.rows.focus()
    this.rows.width = this.width - 3
    this.rows.height = this.height - 4
    Box.prototype.render.call(this)
  }
  setData(table) {
    const self = this
    let head = mapperVector(table.head ?? table.headers, String),
        rows = mapperMatrix(table.rows ?? table.data, String)
    const presets = [ FRESH, METRO, SUBTLE ]
    const padTable = tablePadder({ head, rows }, { ansi: true, full: true })  // use: ansi, fullAngle
    if (presets) {
      const [ alpha, beta, gamma ] = presets
      head = fluoVector.call(MUTATE_PIGMENT, padTable.head, [ alpha, gamma ?? beta ])
      rows = fluoMatrix.call(MUTATE_PIGMENT, padTable.rows, COLUMNWISE, [ alpha, beta ])
    }
    const space = self.options.columnSpacing ? SP.repeat(self.options.columnSpacing) : SP
    this.setContent(head.join(space))
    this.rows.setItems(rows.map(row => row.join(space)))
  }
  setDataAutoFlat(table) {
    const self = this
    let head = mapperVector(table.head ?? table.headers, String),
        rows = mapperMatrix(table.rows ?? table.data, String)
    const padTable = tablePadder({ head, rows }, { ansi: true, full: true })
    const space = self.options.columnSpacing ? SP.repeat(self.options.columnSpacing) : SP
    this.setContent(padTable.head.join(space))
    this.rows.setItems(padTable.rows.map(row => row.join(space)))
  }
  setDataManual(table) {
    const self = this
    const dataToString = row => {
      let str = ''
      row.forEach((cell, i) => {
        const text    = String(cell),
              colSize = self.options.columnWidth[i],
              strip   = clearAnsi(text),
              ansiLen = text.length - strip.length
        let spaceLength = colSize - strip.length + self.options.columnSpacing
        cell = text.substring(0, colSize + ansiLen) //compensate for ansi len
        if (spaceLength < 0) spaceLength = 0
        const spaces = new Array(spaceLength).join(' ')
        str += cell + spaces
      })
      return str
    }
    const formatted = [];
    ( table.rows ?? table.data ).forEach(row => formatted.push(dataToString(row)))
    this.setContent(dataToString(table.head ?? table.headers))
    this.rows.setItems(formatted)
  }
  getOptionsPrototype() {
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
}

