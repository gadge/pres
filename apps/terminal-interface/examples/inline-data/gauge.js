var blessed = require('blessed'),
    contrib = require('../../dist/index.esm'),
    screen  = Screen.build(),
    gauge   = contrib.gauge({ label: 'Progress', percent: 25 })
screen.append(gauge)
screen.render()