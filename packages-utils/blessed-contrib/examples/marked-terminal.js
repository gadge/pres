import { blessed }  from '@pres/terminal-interface'
import * as contrib from '../index'

const screen = blessed.screen()
const markdown = contrib.markdown()
screen.append(markdown)
markdown.setMarkdown("- [x] Checkbox")
screen.render()
