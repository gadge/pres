import { Screen } from '@pres/components'

const screen = Screen.build({
  dump: process.cwd() + '/logs/textarea.log',
  fullUnicode: true,
  warnings: true
})

const box = TextArea.build({
  parent: screen,
  // Possibly support:
  // align: 'center',
  style: {
    bg: 'blue'
  },
  height: 'half',
  width: 'half',
  top: 'center',
  left: 'center',
  tags: true
})

screen.render()

screen.key('q', function () {
  screen.destroy()
})

screen.key('i', function () {
  box.readInput(function () {})
})

screen.key('e', function () {
  box.readEditor(function () {})
})
