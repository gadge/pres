var blessed = require('blessed'),
    contrib = require('../../index.js'),
    screen  = blessed.screen(),
    gauge   = contrib.gauge({ label: 'Progress', percent: 25 })
screen.append(gauge)
screen.render()