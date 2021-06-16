import * as components from '@pres/components'

const randomColor = () => [ Math.random() * 255, Math.random() * 255, Math.random() * 255 ]
const screen = components.screen(),
      line   = components.lineChart(
        {
          width: 80,
          height: 30,
          left: 15,
          top: 12,
          xPadding: 5,
          minY: 0,
          // maxY: 90,
          label: 'Title',
          style: { line: randomColor(), text: randomColor(), baseline: randomColor() }
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
