import { Box, Screen } from '@pres/components'

const screen = Screen.build({
  dump: process.cwd() + '/logs/shrink-padding.log',
  warnings: true
})

const outer = Box.build({
  parent: screen,
  //left: 0,
  //top: 0,
  //left: '50%',
  //top: '50%',
  left: 'center',
  top: 'center',
  padding: 1,
  shrink: true,
  style: {
    bg: 'green'
  }
})

const inner = Box.build({
  parent: outer,
  left: 0,
  top: 0,
  //width: 5,
  //height: 5,
  shrink: true,
  content: 'foobar',
  //padding: 1,
  //content: 'f',
  style: {
    bg: 'magenta'
  }
})

screen.key('q', function () {
  return screen.destroy()
})

screen.render()
