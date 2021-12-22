import { Box, Screen, ScrollableText } from '@pres/components'

const screen = Screen.build({
  dump: process.cwd() + '/logs/termswitch.log',
  smartCSR: true,
  warnings: true
})

const lorem = require('fs').readFileSync(__dirname + '/git.diff', 'utf8')

const btext = Box.build({
  parent: screen,
  left: 'center',
  top: 'center',
  width: '80%',
  height: '80%',
  style: {
    bg: 'green'
  },
  border: 'line',
  content: 'CSR should still work.'
})

const text = ScrollableText.build({
  parent: screen,
  content: lorem,
  border: 'line',
  left: 'center',
  top: 'center',
  draggable: true,
  width: '50%',
  height: '50%',
  mouse: true,
  keys: true,
  vi: true
})

text.focus()

screen.key('q', function () {
  return screen.destroy()
})

screen.render()

setTimeout(function () {
  // screen.setTerminal('vt100');
  screen.terminal = 'vt100'
  screen.render()
  text.setContent(screen.program._terminal)
  screen.render()
}, 1000)
