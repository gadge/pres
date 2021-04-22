import { blessed }  from '@pres/terminal-interface'
import chalk        from 'chalk'
import * as contrib from '../index'

const screen   = blessed.screen(),
      markdown = contrib.markdown()
screen.append(markdown)
markdown.setOptions({ firstHeading: chalk.red.italic })
markdown.setMarkdown('# Hello \n This is **markdown** printed in the `terminal` 11')
screen.render()