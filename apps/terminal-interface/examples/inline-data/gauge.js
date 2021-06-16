var blessed = require('blessed'),
    contrib = require('../../dist/index.esm'),
    screen  = blessed.screen(),
    gauge   = contrib.gauge({ label: 'Progress', percent: 25 })
screen.append(gauge)
screen.render()