import { blessed }  from '@pres/terminal-interface'
import * as contrib from '../index'

const screen = blessed.screen(),
      bar    = contrib.barChart({
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
screen.render()