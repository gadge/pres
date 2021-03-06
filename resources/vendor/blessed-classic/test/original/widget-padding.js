var blessed = require('../../lib/blessed.js')
  , screen;

screen = blessed.screen({
  dump: __dirname + '/logs/padding.log',
  warnings: true
});

blessed.box({
  sup: screen,
  border: 'line',
  style: {
    bg: 'red',
  },
  content: 'hello world\nhi',
  align: 'center',
  left: 'center',
  top: 'center',
  width: 22,
  height: 10,
  padding: 2
});

screen.key('q', function() {
  return screen.destroy();
});

screen.render();
