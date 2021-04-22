const blessed = require('blessed'),
      contrib = require('../'),
      screen  = blessed.screen()

const pic = contrib.picture(
  {
    file: './media/flower.png',
    cols: 95,
    onReady: ready
  })
function ready() { screen.render() }

screen.append(pic)

