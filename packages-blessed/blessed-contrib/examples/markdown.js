const blessed  = require('blessed'),
      contrib  = require('../'),
      screen   = blessed.screen(),
      chalk    = require('chalk'),
      markdown = contrib.markdown()

screen.append(markdown)
markdown.setOptions({ firstHeading: chalk.red.italic })
markdown.setMarkdown('# Hello \n This is **markdown** printed in the `terminal` 11')
screen.render()