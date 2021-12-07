import { Screen } from '@pres/components'

const screen = Screen.build({
  dump: __dirname + '/logs/play.log',
  smartCSR: true,
  warnings: true
})

const frames = require(__dirname + '/frames.json')

const timer = setInterval(function () {
  if (!frames.length) {
    clearInterval(timer)
    return screen.destroy()
  }
  process.stdout.write(frames.shift())
}, 100)
