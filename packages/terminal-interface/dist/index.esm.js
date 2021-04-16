import * as components from '@pres/components';
import { Program } from '@pres/program';
import { Tput } from '@pres/terminfo-parser';
import * as colors from '@pres/util-colors';
import { helpers } from '@pres/util-helpers';
import * as unicode from '@pres/util-unicode';

class TerminalInterface {}
TerminalInterface.program = Program.build;
TerminalInterface.build = Program.build;
TerminalInterface.helpers = helpers;
TerminalInterface.unicode = unicode;
TerminalInterface.colors = colors;
TerminalInterface.Tput = Tput;
Object.assign(TerminalInterface, components); // Object.assign({}, TerminalInterface) |> Deco({ depth: 2, vert: 2 }) |> logger

export { TerminalInterface };
