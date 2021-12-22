/**
 * blessed - a high-level terminal interface library for node.js
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

// const { deco } = require('@spare/logger')
/**
 * Blessed
 */
function blessed() { return blessed.program(...arguments) }

blessed.program = blessed.Program = require('./program.js').build
blessed.tput = blessed.Tput = require('@pres/terminfo-parser').Tput

blessed.widget = require('@pres/components')
// blessed.widget = require('./widget')
// console.log(deco(blessed.widget, { depth: 2 }))

blessed.colors = require('./tools/colors.js')
blessed.unicode = require('./tools/unicode.js')
blessed.helpers = require('./tools/helpers.js')

blessed.helpers.sprintf = require('@pres/terminfo-parser').sprintf
blessed.helpers.tryRead = require('@pres/terminfo-parser').tryRead
blessed.helpers.merge(blessed, blessed.helpers)

blessed.helpers.merge(blessed, blessed.widget)

/**
 * Expose
 */

module.exports = blessed
