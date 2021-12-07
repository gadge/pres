import { List, Screen } from '@pres/components'

const screen = Screen.build({
  dump: __dirname + '/logs/noalt.log',
  title: 'widget-noalt test',
  noAlt: true,
  warnings: true
})

const list = List.build({
  parent: screen,
  align: 'center',
  mouse: true,
  keys: true,
  vi: true,
  width: '50%',
  height: 'shrink',
  //border: 'line',
  top: 5,
  //bottom: 2,
  left: 0,
  style: {
    fg: 'blue',
    bg: 'default',
    selected: {
      bg: 'green'
    }
  },
  items: [
    'one',
    'two',
    'three'
  ]
})

list.select(0)

list.on('select', function (item) {
  console.log(item.getText())
  screen.destroy()
})

screen.key('C-c', function () {
  screen.destroy()
})

list.focus()

screen.render()
