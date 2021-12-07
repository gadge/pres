import { blessed }  from '@pres/terminal-interface'
import * as contrib from '../index'

const screen = Screen.build(),
      grid   = Grid.build({ rows: 12, cols: 12, screen: screen }),
      map    = grid.set(0, 0, 4, 4, Map.build, { label: 'World Map' }),
      box    = grid.set(4, 4, 4, 4, Box.build, { content: 'My Box' })
screen.render()
