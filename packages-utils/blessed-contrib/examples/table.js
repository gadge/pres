import { blessed }  from '@pres/terminal-interface'
import * as contrib from '../index'

const screen = blessed.screen()
const table = contrib.table(
  {
    keys: true,
    vi: true,
    fg: 'white',
    selectedFg: 'white',
    selectedBg: 'blue',
    interactive: true,
    label: 'Active Processes',
    width: '30%',
    height: '30%',
    border: { type: "line", fg: "cyan" },
    columnSpacing: 10,
    columnWidth: [ 16, 12 ]
  })
table.focus()
screen.append(table)
table.setData({
    headers: [ 'col1', 'col2' ],
    data:
      [ [ 1, 2 ],
        [ 3, 4 ],
        [ 5, 6 ],
        [ 7, 8 ] ]
  })
screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))
screen.render()
