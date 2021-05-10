import { TerminalInterface as blessed } from '@pres/terminal-interface'

let screen

const auto = true

screen = blessed.screen({
  dump: __dirname + '/logs/listbar.log',
  autoPadding: auto,
  warnings: true
})

const box = blessed.box({
  sup: screen,
  top: 0,
  right: 0,
  width: 'shrink',
  height: 'shrink',
  content: '...'
})

const bar = blessed.listBar({
  //sup: screen,
  bottom: 0,
  left: 3,
  right: 3,
  height: auto ? 'shrink' : 3,
  mouse: true,
  keys: true,
  autoCommandKeys: true,
  border: 'line',
  vi: true,
  style: {
    bg: 'green',
    item: {
      bg: 'red',
      hover: {
        bg: 'blue'
      },
      //focus: {
      //  bg: 'blue'
      //}
    },
    selected: {
      bg: 'blue'
    }
  },
  commands: {
    'one': {
      keys: [ 'a' ],
      callback: () => {
        box.setContent('Pressed one.')
        screen.render()
      }
    },
    'two': () => {
      box.setContent('Pressed two.')
      screen.render()
    },
    'three': () => {
      box.setContent('Pressed three.')
      screen.render()
    },
    'four': () => {
      box.setContent('Pressed four.')
      screen.render()
    },
    'five': () => {
      box.setContent('Pressed five.')
      screen.render()
    },
    'six': () => {
      box.setContent('Pressed six.')
      screen.render()
    },
    'seven': () => {
      box.setContent('Pressed seven.')
      screen.render()
    },
    'eight': () => {
      box.setContent('Pressed eight.')
      screen.render()
    },
    'nine': () => {
      box.setContent('Pressed nine.')
      screen.render()
    },
    'ten': () => {
      box.setContent('Pressed ten.')
      screen.render()
    },
    'eleven': () => {
      box.setContent('Pressed eleven.')
      screen.render()
    },
    'twelve': () => {
      box.setContent('Pressed twelve.')
      screen.render()
    },
    'thirteen': () => {
      box.setContent('Pressed thirteen.')
      screen.render()
    },
    'fourteen': () => {
      box.setContent('Pressed fourteen.')
      screen.render()
    },
    'fifteen': () => {
      box.setContent('Pressed fifteen.')
      screen.render()
    }
  }
})

screen.append(bar)

bar.focus()

screen.key('q', () => screen.destroy())

screen.render()
