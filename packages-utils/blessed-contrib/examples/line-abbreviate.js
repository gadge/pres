import { blessed }  from '@pres/terminal-interface'
import * as contrib from '../archive'

const screen = blessed.screen(),
      line   = contrib.line(
        {
          width: 80,
          height: 30,
          left: 15,
          top: 12,
          xPadding: 5,
          label: 'Title',
          abbr: true,
          style: { baseline: 'white' }
        }),
      data   = [ {
        title: 'us-east',
        x: [ 't1', 't2', 't3', 't4' ],
        y: [ 5, 8800, 99999, 3179000000 ],
        style: { line: 'red' }
      } ]
screen.append(line) //must append before setting data
line.setData(data)
screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))
screen.render()
