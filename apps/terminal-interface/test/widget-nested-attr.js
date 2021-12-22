import { Box, Screen } from '@pres/components'

const screen = Screen.build({
  dump: process.cwd() + '/logs/nested-attr.log',
  warnings: true
})

Box.build({
  parent: screen,
  left: 'center',
  top: 'center',
  width: '80%',
  height: '80%',
  style: {
    bg: 'black',
    fg: 'yellow'
  },
  tags: true,
  border: 'line',
  content: '{red-fg}hello {blue-fg}how{/blue-fg}'
    + ' {yellow-bg}are{/yellow-bg} you?{/red-fg}'
})

screen.key('q', function () {
  return screen.destroy()
})

screen.render()
