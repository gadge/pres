var blessed  = require('blessed'),
    contrib  = require('../../dist/index.esm'),
    screen   = Screen.build(),
    chalk    = require('chalk'),
    markdown = contrib.markdown({
      markdown: '# Hello \n blessed-contrib renders markdown using `marked-terminal` ',
      style: { firstHeading: 'chalk.green.italic' }
    })
screen.append(markdown)
screen.render()
