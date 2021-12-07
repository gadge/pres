var blessed = require('blessed'),
    contrib = require('../../dist/index.esm'),
    screen  = Screen.build()
var table = contrib.table(
  {
    keys: true,
    fg: 'white',
    interactive: false,
    label: 'Active Processes',
    width: '30%',
    height: '30%',
    border: { type: "line", fg: "cyan" },
    columnSpacing: 10,
    columnWidth: [ 16, 12 ],
    data: {
      headers: [ 'col1', 'col2' ],
      data: [ [ 1, 2 ],
        [ 3, 4 ],
        [ 5, 6 ] ]
    }
  })
screen.append(table)
screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))
screen.render()