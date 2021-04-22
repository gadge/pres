import { blessed }  from '@pres/terminal-interface'
import * as contrib from '../index'

const screen = blessed.screen(),
      grid   = contrib.grid({ rows: 12, cols: 12, screen: screen }),
      map    = grid.set(0, 0, 4, 4, contrib.map, { label: 'World Map' }),
      box    = grid.set(4, 4, 4, 4, blessed.box, { content: 'My Box' })

screen.render()
