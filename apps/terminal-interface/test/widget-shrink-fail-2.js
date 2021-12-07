const blessed = require('blessed')
const screen = Screen.build({
  autoPadding: true,
  warnings: true
})

const tab = Box.build({
  parent: screen,
  top: 2,
  left: 0,
  right: 0,
  bottom: 0,
  scrollable: true,
  keys: true,
  vi: true,
  alwaysScroll: true,
  scrollbar: {
    ch: ' '
  },
  style: {
    scrollbar: {
      inverse: true
    }
  }
})

tab._.data = Text.build({
  parent: tab,
  top: 0,
  left: 3,
  height: 'shrink',
  width: 'shrink',
  content: '',
  tags: true
})

tab._.data.setContent(require('util').inspect(process, null, 6))

screen.key('q', function () {
  screen.destroy()
})

screen.render()
