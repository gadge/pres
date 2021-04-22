import blessed from 'blessed'
import contrib from '../'

const screen  = blessed.screen(),
      gauge   = contrib.gauge({ label: 'Progress' })

screen.append(gauge)

gauge.setPercent(25)

screen.render()