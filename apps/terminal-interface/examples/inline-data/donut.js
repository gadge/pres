var blessed = require('blessed'),
    contrib = require('../../dist/index.esm'),
    screen  = Screen.build(),
    donut   = contrib.donut(
      {
        data: [ { color: 'red', percent: '50', label: 'a' }, {
          color: 'blue',
          percent: '20',
          label: 'b'
        }, { color: 'yellow', percent: '80', label: 'c' } ]
      })
screen.append(donut)
screen.render()