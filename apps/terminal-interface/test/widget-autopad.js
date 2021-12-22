import { Box, Screen } from '@pres/components'

const screen = Screen.build({
  dump: process.cwd() + '/logs/autopad.log',
  smartCSR: true,
  autoPadding: true,
  warnings: true
})

const box1 = Box.build({
  parent: screen,
  top: 'center',
  left: 'center',
  width: 20,
  height: 10,
  border: 'line'
})

const box2 = Box.build({
  parent: box1,
  top: 0,
  left: 0,
  width: 10,
  height: 5,
  border: 'line'
})

screen.key('q', function () {
  return screen.destroy()
})

screen.render()
