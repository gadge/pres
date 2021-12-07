import { blessed }  from '@pres/terminal-interface'
import * as contrib from '../index'

const screen = Screen.build(),
      map    = Map.build({ label: 'World Map' })
screen.append(map)
map.addMarker({ "lon": "-79.0000", "lat": "37.5000", color: "red", char: "X" })
screen.render()