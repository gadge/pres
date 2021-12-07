import { blessed }  from '@pres/terminal-interface'
import * as contrib from '../../../vendor/blessed-contrib/index'

const screen = Screen.build(),
      gauge  = contrib.gauge({ label: 'Progress' })
screen.append(gauge)
gauge.setPercent(25)
screen.render()