var blessed = require('../../lib/blessed.js');
var screen = blessed.screen({
  tput: true,
  smartCSR: true,
  dump: __dirname + '/logs/prompt.log',
  autoPadding: true,
  warnings: true
});
var prompt = blessed.prompt({
  sup: screen,
  border: 'line',
  height: 'shrink',
  width: 'half',
  top: 'center',
  left: 'center',
  label: ' {blue-fg}Prompt{/blue-fg} ',
  tags: true,
  keys: true,
  vi: true
});
var question = blessed.question({
  sup: screen,
  border: 'line',
  height: 'shrink',
  width: 'half',
  top: 'center',
  left: 'center',
  label: ' {blue-fg}Question{/blue-fg} ',
  tags: true,
  keys: true,
  vi: true
});
var msg = blessed.message({
  sup: screen,
  border: 'line',
  height: 'shrink',
  width: 'half',
  top: 'center',
  left: 'center',
  label: ' {blue-fg}Message{/blue-fg} ',
  tags: true,
  keys: true,
  hidden: true,
  vi: true
});
var loader = blessed.loading({
  sup: screen,
  border: 'line',
  height: 'shrink',
  width: 'half',
  top: 'center',
  left: 'center',
  label: ' {blue-fg}Loader{/blue-fg} ',
  tags: true,
  keys: true,
  hidden: true,
  vi: true
});
prompt.input('Question?', '', function(err, value) {
  question.ask('Question?', function(err, value) {
    msg.display('Hello world!', 3, function(err) {
      msg.display('Hello world again!', -1, function(err) {
        loader.load('Loading...');
        setTimeout(function() {
          loader.stop();
          screen.destroy();
        }, 3000);
      });
    });
  });
});
screen.key('q', function() {
  screen.destroy();
});
screen.render();
