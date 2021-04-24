import * as components from '@pres/components'

const screen = components.screen(),
      bar    = components.barChart({
        label: 'Server Utilization (%)',
        barWidth: 4,
        barSpacing: 6,
        xOffset: 0,
        maxHeight: 9,
        height: "40%"
      })
screen.append(bar)
bar.setData({
  titles: [ 'bar1', 'bar2' ],
  data: [ 5, 10 ]
})
screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))
screen.render()
