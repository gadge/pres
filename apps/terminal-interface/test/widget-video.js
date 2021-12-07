import { Screen, Video } from '@pres/components'

const fs = require('fs')

const screen = Screen.build({
  tput: true,
  smartCSR: true,
  dump: __dirname + '/logs/video.log',
  warnings: true
})

const video = Video.build({
  parent: screen,
  left: 1,
  top: 1,
  width: '90%',
  height: '90%',
  border: 'line',
  file: process.argv[2]
})

video.focus()

screen.render()

screen.key([ 'q', 'C-q', 'C-c' ], function () {
  screen.destroy()
})
