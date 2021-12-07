import { Box, Layout, Screen } from '@pres/components'

const screen = Screen.build({
  dump: __dirname + '/logs/layout.log',
  smartCSR: true,
  autoPadding: true,
  warnings: true
})

const layout = Layout.build({
  parent: screen,
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  border: 'line',
  layout: process.argv[2] === 'grid' ? 'grid' : 'inline',
  style: {
    bg: 'red',
    border: {
      fg: 'blue'
    }
  }
})

const box1 = Box.build({
  parent: layout,
  top: 'center',
  left: 'center',
  width: 20,
  height: 10,
  border: 'line',
  content: '1'
})

const box2 = Box.build({
  parent: layout,
  top: 0,
  left: 0,
  width: 10,
  height: 5,
  border: 'line',
  content: '2'
})

const box3 = Box.build({
  parent: layout,
  top: 0,
  left: 0,
  width: 10,
  height: 5,
  border: 'line',
  content: '3'
})

const box4 = Box.build({
  parent: layout,
  top: 0,
  left: 0,
  width: 10,
  height: 5,
  border: 'line',
  content: '4'
})

const box5 = Box.build({
  parent: layout,
  top: 0,
  left: 0,
  width: 10,
  height: 5,
  border: 'line',
  content: '5'
})

const box6 = Box.build({
  parent: layout,
  top: 0,
  left: 0,
  width: 10,
  height: 5,
  border: 'line',
  content: '6'
})

const box7 = Box.build({
  parent: layout,
  top: 0,
  left: 0,
  width: 10,
  height: 5,
  border: 'line',
  content: '7'
})

const box8 = Box.build({
  parent: layout,
  top: 'center',
  left: 'center',
  width: 20,
  height: 10,
  border: 'line',
  content: '8'
})

const box9 = Box.build({
  parent: layout,
  top: 0,
  left: 0,
  width: 10,
  height: 5,
  border: 'line',
  content: '9'
})

const box10 = Box.build({
  parent: layout,
  top: 'center',
  left: 'center',
  width: 20,
  height: 10,
  border: 'line',
  content: '10'
})

const box11 = Box.build({
  parent: layout,
  top: 0,
  left: 0,
  width: 10,
  height: 5,
  border: 'line',
  content: '11'
})

const box12 = Box.build({
  parent: layout,
  top: 'center',
  left: 'center',
  width: 20,
  height: 10,
  border: 'line',
  content: '12'
})

if (process.argv[2] !== 'grid') {
  for (let i = 0; i < 10; i++) {
    Box.build({
      parent: layout,
      // width: i % 2 === 0 ? 10 : 20,
      // height: i % 2 === 0 ? 5 : 10,
      width: Math.random() > 0.5 ? 10 : 20,
      height: Math.random() > 0.5 ? 5 : 10,
      border: 'line',
      content: ( i + 1 + 12 ) + ''
    })
  }
}

screen.key('q', function () {
  return screen.destroy()
})

screen.render()
