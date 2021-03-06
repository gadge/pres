import { blessed }  from '@pres/terminal-interface'
import * as contrib from '../index'

const screen = Screen.build()
const pic = contrib.picture(
  {
    file: __dirname + '/media/flower.png',
    cols: 95,
    onReady: ready
  })
function ready() { screen.render() }
screen.append(pic)
