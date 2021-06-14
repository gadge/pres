import { Indigo, LightBlue, Pink, Red } from '@palett/cards'
import { TI as blessed }                from '../src/terminal-interface'

const auto = false

const screen = blessed.screen({
  dump: __dirname + '/logs/listBar.log',
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
  sup: screen,
  bottom: 0,
  left: 3,
  right: 3,
  height: auto ? 'shrink' : 5,
  mouse: true,
  keys: true,
  autoCommandKeys: true,
  border: 'line',
  vi: true,
  style: {
    bg: Pink.lighten_4,
    item: { bg: Red.lighten_1, hover: { bg: LightBlue.accent_4 } }, // focus: { bg: 'blue' }
    selected: { bg: Indigo.darken_4 }
  },
  commands: {
    one: { keys: [ 'a' ], callback() { box.setContent('Pressed one.'), screen.render() } },
    two: { keys: [ 'b' ], callback() { box.setContent('Pressed two.'), screen.render() } },
    three: { keys: [ 'c' ], callback() { box.setContent('Pressed three.'), screen.render() } },
    four: { keys: [ 'd' ], callback() { box.setContent('Pressed four.'), screen.render() } },
    five: { keys: [ 'e' ], callback() { box.setContent('Pressed five.'), screen.render() } },
    six: { keys: [ 'f' ], callback() { box.setContent('Pressed six.'), screen.render() } },
    seven: { keys: [ 'g' ], callback() { box.setContent('Pressed seven.'), screen.render() } },
    eight: { keys: [ 'h' ], callback() { box.setContent('Pressed eight.'), screen.render() } },
    nine: { keys: [ 'i' ], callback() { box.setContent('Pressed nine.'), screen.render() } },
    ten: { keys: [ 'j' ], callback() { box.setContent('Pressed ten.'), screen.render() } },
    eleven: { keys: [ 'k' ], callback() { box.setContent('Pressed eleven.'), screen.render() } },
    twelve: { keys: [ 'l' ], callback() { box.setContent('Pressed twelve.'), screen.render() } },
    thirteen: { keys: [ 'm' ], callback() { box.setContent('Pressed thirteen.'), screen.render() } },
    fourteen: { keys: [ 'n' ], callback() { box.setContent('Pressed fourteen.'), screen.render() } },
    fifteen: { keys: [ 'o' ], callback() { box.setContent('Pressed fifteen.'), screen.render() } },
  }
})

screen.append(bar)
bar.focus()
screen.key([ 'q', 'esc' ], () => screen.destroy())
screen.render()
