import { Box, Screen, Terminal } from '@pres/components'

const screen = Screen.build({
  dump: __dirname + '/logs/termblessed.log',
  smartCSR: true,
  warnings: true
})

const terminal = Terminal.build({
  parent: screen,
  // cursor: 'line',
  cursorBlink: true,
  screenKeys: false,
  top: 'center',
  left: 'center',
  width: '90%',
  height: '90%',
  border: 'line',
  handler: function () {},
  style: {
    fg: 'default',
    bg: 'default',
    focus: {
      border: {
        fg: 'green'
      }
    }
  }
})

terminal.focus()

const term = terminal.term

const screen2 = Screen.build({
  dump: __dirname + '/logs/termblessed2.log',
  smartCSR: true,
  warnings: true,
  input: term,
  output: term
})

const box1 = Box.build({
  parent: screen2,
  top: 'center',
  left: 'center',
  width: 20,
  height: 10,
  border: 'line',
  content: 'Hello world'
})

screen.key('C-q', () => {
  // NOTE:
  // not necessary since screen.destroy causes terminal.term to be destroyed
  // (screen2's input and output are no longer readable/writable)
  // screen2.destroy();
  return screen.destroy()
})

screen2.render()
screen.render()
