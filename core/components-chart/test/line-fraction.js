import { Cyan }        from '@palett/cards'
import * as components from '@pres/components'

const screen = components.screen(),
      line   = components.lineChart(
        {
          width: 80,
          height: 30,
          left: 15,
          top: 12,
          xPadding: 5,
          label: 'Title',
          tickCount: 7,
          // intOnly: true
        }),
      data   = [ {
        title: 'us-east',
        x: [ 't1', 't2', 't3', 't4' ],
        y: [ 0, 0.0695652173913043, 0.11304347826087, 2 ],
        style: { line: Cyan.accent_3 }
      } ]
screen.append(line) //must append before setting data
line.setData(data)
screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))
screen.render()
