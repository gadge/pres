import { Box, Screen } from '@pres/components'

const screen = Screen.build({
  dump: process.cwd() + '/logs/valign.log',
  smartCSR: true,
  autoPadding: false,
  warnings: true
})

const box = Box.build({
  parent: screen,
  top: 'center',
  left: 'center',
  width: '50%',
  height: 5,
  align: 'center',
  valign: 'middle',
  // valign: 'bottom',
  content: 'Foobar.',
  border: 'line'
})

screen.key('q', function () {
  return screen.destroy()
})

screen.render()
