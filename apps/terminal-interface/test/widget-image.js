import { Image, Screen } from '@pres/components'

const screen = Screen.build({
  dump: __dirname + '/logs/image.log',
  smartCSR: true,
  warnings: true
})

// To ensure our w3mimgdisplay search works:
if (process.argv[2] === 'find') {
  Image.build.w3mdisplay = '/does/not/exist'
  process.argv.length = 2
}

const file = process.argv[2] || __dirname + '/test-image.png'

const image = Image.build({
  parent: screen,
  type: 'overlay',
  left: 'center',
  top: 'center',
  width: 'shrink',
  height: 'shrink',
  style: {
    bg: 'green'
  },
  draggable: true
})

setTimeout(function () {
  image.setImage(file, function () {
    // XXX For some reason the image sometimes envelopes
    // the entire screen at the end if this is uncommented:
    // NOTE: Might have to do with an uncached ratio and
    // a bad termSize being reported.
    screen.render()
    setTimeout(function () {
      image.rtop = 4
      image.rleft = 10
      screen.render()
      setTimeout(function () {
        image.rtop = 2
        image.rleft = 7
        screen.render()
        setTimeout(function () {
          image.detach()
          screen.render()
          setTimeout(function () {
            screen.append(image)
            image.enableMouse()
            screen.render()
          }, 1000)
        }, 1000)
      }, 1000)
    }, 5000)
  })
}, 1000)

image.focus()

screen.key('i', function () {
  screen.displayImage(file)
})

screen.key('q', function () {
  return screen.destroy()
})

screen.render()
