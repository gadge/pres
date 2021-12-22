import { Box, Screen, ScrollableText } from '@pres/components'
import fs                              from 'fs'

const screen = Screen.build({
  dump: process.cwd() + '/logs/record.log',
  smartCSR: true,
  warnings: true
})

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
  content: fs.readFileSync(__dirname + '/git.diff', 'utf8'),
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

const frames = []

const timer = setInterval(function () {
  frames.push(screen.screenshot())
}, 100)

screen.key('C-q', function () {
  fs.writeFileSync(__dirname + '/frames.json', JSON.stringify(frames))
  clearInterval(timer)
  return screen.destroy()
})

screen.render()
