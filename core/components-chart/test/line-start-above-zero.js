import * as components from '@pres/components'
const screen = components.screen(),
      line   = components.lineChart(
        {
          width: 80,
          height: 30,
          left: 15,
          top: 12,
          xPadding: 5,
          minY: 30,
          label: 'Line-start-above-zero',
          style: { baseline: 'white' }
        }),
      data   = [ {
        title: 'us-east',
        x: [ 't1', 't2', 't3', 't4' ],
        y: [ 50, 88, 72, 91 ],
        style: {
          line: 'red'
        }
      } ]
screen.append(line) //must append before setting data
line.setData(data)
screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))
screen.render()
