import * as components from '@pres/components'
import { Program }     from '@pres/program'
import { Tput }        from '@pres/terminfo-parser'
import * as colors     from '@pres/util-colors'
import * as helpers    from '@pres/util-helpers'
import * as unicode    from '@pres/util-unicode'

/**
 * @class TerminalInterface
 * @static {function(object):Screen} TerminalInterface.screen
 */
export class TerminalInterface {
  static program = Program.build
  static build = Program.build
  static helpers = helpers
  static unicode = unicode
  static colors = colors
  static Tput = Tput
}
Object.assign(TerminalInterface, components)

// export const blessed = TerminalInterface
export { TerminalInterface as blessed }
