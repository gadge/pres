/**
 * blessed - a high-level terminal interface library for node.js
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Blessed
 */

function blessed() { return blessed.program(...arguments) }

blessed.program = blessed.Program = require('./program').build
blessed.tput = blessed.Tput = require('./tput').Tput
blessed.widget = require('./widget')
blessed.colors = require('./tools/colors')
blessed.unicode = require('./tools/unicode')
blessed.helpers = require('./tools/helpers')

blessed.helpers.sprintf = blessed.tput.sprintf
blessed.helpers.tryRead = blessed.tput.tryRead
blessed.helpers.merge(blessed, blessed.helpers)

blessed.helpers.merge(blessed, blessed.widget)

/**
 * Expose
 */

module.exports = blessed
