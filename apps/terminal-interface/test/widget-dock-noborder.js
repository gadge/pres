import { Box, ListTable, Screen } from '@pres/components'

const screen = Screen.build({
  dump: __dirname + '/logs/dock.log',
  smartCSR: true,
  dockBorders: true,
  warnings: true
})

Box.build({
  parent: screen,
  left: -1,
  top: -1,
  width: '50%+1',
  height: '50%+1',
  border: 'line',
  content: 'Foo'
})

Box.build({
  parent: screen,
  left: '50%-1',
  top: -1,
  width: '50%+3',
  height: '50%+1',
  content: 'Bar',
  border: 'line'
})

Box.build({
  parent: screen,
  left: -1,
  top: '50%-1',
  width: '50%+1',
  height: '50%+3',
  border: 'line',
  content: 'Foo'
})

ListTable.build({
  parent: screen,
  left: '50%-1',
  top: '50%-1',
  width: '50%+3',
  height: '50%+3',
  border: 'line',
  align: 'center',
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
  style: {
    header: {
      fg: 'blue',
      bold: true
    },
    cell: {
      fg: 'magenta',
      selected: {
        bg: 'blue'
      }
    }
  },
  data: [
    [ 'Animals', 'Foods', 'Times', 'Numbers' ],
    [ 'Elephant', 'Apple', '1:00am', 'One' ],
    [ 'Bird', 'Orange', '2:15pm', 'Two' ],
    [ 'T-Rex', 'Taco', '8:45am', 'Three' ],
    [ 'Mouse', 'Cheese', '9:05am', 'Four' ]
  ]
}).focus()

// Box.build({
//   parent: screen,
//   left: '50%-1',
//   top: '50%-1',
//   width: '50%+1',
//   height: '50%+1',
//   border: 'line',
//   content: 'Bar'
// });

screen.key('q', function () {
  return screen.destroy()
})

screen.render()
