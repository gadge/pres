import blessed from 'blessed'
import contrib from '../'

const screen  = blessed.screen()

const pic = contrib.picture(
  {
    file: './media/flower.png',
    cols: 95,
    onReady: ready
  })
function ready() { screen.render() }

screen.append(pic)

