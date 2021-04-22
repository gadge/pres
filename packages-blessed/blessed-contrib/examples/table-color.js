import { blessed }  from '@pres/terminal-interface'
import colors       from 'colors/safe'
import * as contrib from '../index'

const screen = blessed.screen()

const table = contrib.table(
  {
    keys: true,
    fg: 'white',
    selectedFg: 'white',
    selectedBg: 'blue',
    interactive: false,
    label: 'Active Processes',
    width: '80%',
    height: '30%',
    border: { type: "line", fg: "cyan" },
    // , columnSpacing: 10,
    columnWidth: [ 7, 12, 15 ]
  })

table.focus()
screen.append(table)

table.setData(
  {
    headers: [ 'col1', 'col2', 'col3' ],
    data:
      [ [ colors.blue('1111'), '22222', '55555' ],
        [ '33333', '44444', '66666' ] ]
  })

screen.key([ 'escape', 'q', 'C-c' ], function (ch, key) {
  return process.exit(0)
})

screen.render()
