#!/usr/bin/env node

import util from 'util'

import { Program } from '@pres/program'


const program = Program.build({
  dump: __dirname + '/logs/mouse.log'
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
//program.write('\x1b[?1004h');

program.on('mouse', data => {
  program.cup(data.y, data.x)
  program.write(' ', 'blue bg')
  program.cup(0, 0)
  program.write(util.inspect(data))
})

program.on('resize', data => {
  setTimeout(() => {
    program.clear()
    program.cup(0, 0)
    program.write(util.inspect({ cols: program.cols, rows: program.rows }))
  }, 200)
})

process.on('SIGWINCH', data => {
  setTimeout(() => {
    program.cup(1, 0)
    program.write(util.inspect({ winch: true, cols: program.cols, rows: program.rows }))
  }, 200)
})

program.on('focus', data => {
  program.clear()
  program.cup(0, 0)
  program.write('FOCUSIN')
})

program.on('blur', data => {
  program.clear()
  program.cup(0, 0)
  program.write('FOCUSOUT')
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
  program.write(util.inspect(data))
})

// program.getCursor(function(err, data) {
//   program.write(util.inspect(data));
// });

// program.manipulateWindow(18, function(err, data) {
//   program.write(util.inspect(data));
// });
