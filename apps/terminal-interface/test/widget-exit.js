import { Prompt, Screen } from '@pres/components'

const screen = Screen.build({
  dump: process.cwd() + '/logs/exit.log',
  smartCSR: true,
  autoPadding: true,
  warnings: true,
  ignoreLocked: [ 'C-q' ]
})

const box = Prompt.build({
  parent: screen,
  left: 'center',
  top: 'center',
  width: '70%',
  height: 'shrink',
  border: 'line'
})

screen.render()

box.input('Input: ', '', function (err, data) {
  screen.destroy()
  if (process.argv[2] === 'resume') {
    process.stdin.resume()
  }
  else if (process.argv[2] === 'end') {
    process.stdin.setRawMode(false)
    process.stdin.end()
  }
  if (err) throw err
  console.log('Input: ' + data)
})

screen.key('C-q', function (ch, key) {
  return screen.destroy()
})
