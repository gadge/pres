import { Box, Screen, ScrollableText } from '@pres/components'

const screen = Screen.build({
  dump: process.cwd() + '/logs/csr.log',
  smartCSR: true,
  warnings: true
})

const lorem = require('fs').readFileSync(__dirname + '/git.diff', 'utf8')

const cleanSides = screen.cleanSides
function expectClean(value) {
  screen.cleanSides = function (el) {
    const ret = cleanSides.apply(this, arguments)
    if (ret !== value) {
      throw new Error('Failed. Expected '
        + value + ' from cleanSides. Got '
        + ret + '.')
    }
    return ret
  }
}

/*
Box.build({
  parent: screen,
  left: 0,
  top: 'center',
  width: '50%',
  height: 2,
  style: {
    bg: 'green'
  },
  content: 'This will disallow CSR.'
});
expectClean(false);
*/

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
btext._oscroll = btext.scroll
btext.scroll = function (offset, always) {
  expectClean(true)
  return btext._oscroll(offset, always)
}

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

text._oscroll = text.scroll
text.scroll = function (offset, always) {
  const el = this
  let value = true
  if (el.left < 0) value = true
  if (el.top < 0) value = false
  if (el.left + el.width > screen.width) value = true
  if (el.top + el.height > screen.height) value = false
  expectClean(value)
  return text._oscroll(offset, always)
}

text.focus()

screen.key('q', function () {
  return screen.destroy()
})

screen.render()
