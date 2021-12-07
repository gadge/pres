import { Box, Screen } from '@pres/components'

const screen = Screen.build({
  dump: __dirname + '/logs/padding.log',
  warnings: true
})

Box.build({
  parent: screen,
  border: 'line',
  style: {
    bg: 'red',
  },
  content: 'hello world\nhi',
  align: 'center',
  left: 'center',
  top: 'center',
  width: 22,
  height: 10,
  padding: 2
})

screen.key('q', function () {
  return screen.destroy()
})

screen.render()
