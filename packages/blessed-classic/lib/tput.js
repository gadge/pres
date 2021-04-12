/**
 * tput.js - parse and compile terminfo caps to javascript.
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

// Resources:
//   $ man term
//   $ man terminfo
//   http://invisible-island.net/ncurses/man/term.5.html
//   https://en.wikipedia.org/wiki/Terminfo

// Todo:
// - xterm's XT (set-title capability?) value should
//   be true (at least tmux thinks it should).
//   It's not parsed as true. Investigate.
// - Possibly switch to other method of finding the
//   extended data string table: i += h.symOffsetCount * 2;

/**
 * Modules
 */
const
  assert = require('assert'),
  path = require('path'),
  fs = require('fs'),
  cp = require('child_process')
const { Tput, sprintf, tryRead } = require('@pres/terminfo-parser')

/**
 * Tput
 */


exports.Tput = Tput
exports.sprintf = sprintf
exports.tryRead = tryRead

// module.exports = exports
