import { Cards }                      from '@palett/cards'
import { Box, Screen, ScrollableBox } from '@pres/components'

const screen = Screen.build({
  debug: true,
  dump: process.cwd() + '/logs/scrollable-boxes.log',
  smartCSR: true,
  warnings: true
})

const box = ScrollableBox.build({
  parent: screen,
  //padding: 2,
  mouse: true,
  scrollable: true,
  left: 'center',
  top: 'center',
  width: '80%',
  height: '80%',
  style: { bg: Cards.teal.accent_1 },
  border: 'line',
  content: 'foobar',
  keys: true,
  vi: true,
  alwaysScroll: true,
  scrollbar: { ch: ' ', inverse: true }
})

const text = Box.build({
  parent: box,
  content: 'hello1\nhello2\nhello3\nhello4',
  padding: 2,
  style: { bg: Cards.red.darken_2 },
  left: 2,
  top: 30,
  width: '50%',
  height: 6
})

const text2 = Box.build({
  parent: box,
  content: 'world',
  padding: 1,
  style: { bg: 'red' },
  left: 2,
  top: 50,
  width: '50%',
  height: 3
})

const box2 = Box.build({
  parent: box,
  scrollable: true,
  content: 'foo-one\nfoo-two\nfoo-three',
  padding: 2,
  left: 'center',
  top: 20,
  width: '80%',
  height: 9,
  border: 'line',
  style: { bg: 'magenta', focus: { bg: 'blue' }, hover: { bg: 'red' }, }, //  scrollbar: { inverse: true },
  keys: true,
  vi: true,
  alwaysScroll: true,
  // scrollbar: { ch: ' ' }
})

const box3 = Box.build({
  parent: box2,
  scrollable: true,
  //content: 'foo1\nfoo2\nfoo3\nfoo4\nfoo5\nfoo6\nfoo7\nf008',
  //left: 'center',
  left: 3,
  top: 3,
  content: 'foo',
  //shrink: true,
  height: 4,
  width: 5,
  //width: '80%',
  //height: 5,
  border: 'line',
  style: { bg: 'yellow', focus: { bg: 'blue' }, hover: { bg: 'red' }, }, //  scrollbar: { inverse: true }
  keys: true,
  vi: true,
  alwaysScroll: true,
  // scrollbar: { ch: ' ' }
})

screen.key('q', () => screen.destroy())

box.focus()

screen.render()
