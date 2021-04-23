import { blessed }  from '@pres/terminal-interface'
import * as contrib from '../index'

const screen = blessed.screen()
function page1(screen) {
  const grid = contrib.grid({ rows: 4, cols: 4, screen: screen })
  const line = grid.set(1, 0, 2, 2, contrib.line, {
    style:
      {
        line: "yellow",
        text: "green",
        baseline: "black"
      },
    xLabelPadding: 3,
    xPadding: 5,
    label: 'Stocks'
  })
  const map = grid.set(1, 2, 2, 2, contrib.map, { label: 'Servers Location' })
  const box = blessed.box({
    content: 'click right-left arrows or wait 3 seconds for the next layout in the carousel', top: '80%', left: '10%'
  })
  screen.append(box)
  const lineData = {
    x: [ 't1', 't2', 't3', 't4' ],
    y: [ 5, 1, 7, 5 ]
  }
  line.setData([ lineData ])
}
function page2(screen) {
  const line = contrib.line(
    {
      width: 80,
      height: 30,
      left: 15,
      top: 12,
      xPadding: 5,
      label: 'Title'
    })
  const data = [ {
    title: 'us-east',
    x: [ 't1', 't2', 't3', 't4' ],
    y: [ 0, 0.0695652173913043, 0.11304347826087, 2 ],
    style: {
      line: 'red'
    }
  } ]
  screen.append(line)
  line.setData(data)
  const box = blessed.box({
    content: 'click right-left arrows or wait 3 seconds for the next layout in the carousel',
    top: '80%',
    left: '10%'
  })
  screen.append(box)
}
screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))
const carousel = contrib.carousel([ page1, page2 ], {
  screen: screen,
  interval: 3000,
  controlKeys: true
})
carousel.start()
