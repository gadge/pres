var blessed = require('../../lib/blessed.js')
  , screen;
screen = blessed.screen({
  dump: __dirname + '/logs/valign.log',
  smartCSR: true,
  autoPadding: false,
  warnings: true
});
var box = blessed.box({
  sup: screen,
  top: 'center',
  left: 'center',
  width: '50%',
  height: 5,
  align: 'center',
  valign: 'middle',
  // valign: 'bottom',
  content: 'Foobar.',
  border: 'line'
});
screen.key('q', function() {
  return screen.destroy();
});
screen.render();
