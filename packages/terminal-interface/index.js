import * as components from '@pres/components'
import { Program }     from '@pres/program'
import { Tput }        from '@pres/terminfo-parser'
import * as colors     from '@pres/util-colors'
import { helpers }     from '@pres/util-helpers'
import * as unicode    from '@pres/util-unicode'
// import { Deco, logger } from '@spare/logger'

export class TerminalInterface {
  static program = Program.build
  static build = Program.build
  static helpers = helpers
  static unicode = unicode
  static colors = colors
  static Tput = Tput
}

Object.assign(TerminalInterface, components)

// Object.assign({}, TerminalInterface) |> Deco({ depth: 2, vert: 2 }) |> logger