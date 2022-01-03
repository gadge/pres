import { Program } from '@pres/program'
import util        from 'util'


const program = Program.build({
  dump: process.cwd() + '/logs/mouse.log'
})

// program.setMouse({
//   allMotion: true,
//   //utfMouse: true
//   urxvtMouse: true
// }, true);

program.alternateBuffer()
program.enableMouse()
program.hideCursor()

program.setMouse({ sendFocus: true }, true)
//program._currentMouse.sendFocus = true;
//program.enableMouse(program._currentMouse);
//program.writeOutput('\x1b[?1004h');

program.on('mouse', data => {
  program.cup(data.y, data.x)
  program.writeOutput(' ', 'blue bg')
  program.cup(0, 0)
  program.writeOutput(util.inspect(data))
})

program.on('resize', data => {
  setTimeout(() => {
    program.clear()
    program.cup(0, 0)
    program.writeOutput(util.inspect({ cols: program.cols, rows: program.rows }))
  }, 200)
})

process.on('SIGWINCH', data => {
  setTimeout(() => {
    program.cup(1, 0)
    program.writeOutput(util.inspect({ winch: true, cols: program.cols, rows: program.rows }))
  }, 200)
})

program.on('focus', data => {
  program.clear()
  program.cup(0, 0)
  program.writeOutput('FOCUSIN')
})

program.on('blur', data => {
  program.clear()
  program.cup(0, 0)
  program.writeOutput('FOCUSOUT')
})

program.key([ 'q', 'escape', 'C-c' ], () => {
  program.showCursor()
  program.disableMouse()
  program.normalBuffer()
  process.exit(0)
})

program.on('keypress', (ch, data) => {
  if (data.name === 'mouse') return
  program.clear()
  program.cup(0, 0)
  program.writeOutput(util.inspect(data))
})

// program.getCursor(function(err, data) {
//   program.writeOutput(util.inspect(data));
// });

// program.manipulateWindow(18, function(err, data) {
//   program.writeOutput(util.inspect(data));
// });
