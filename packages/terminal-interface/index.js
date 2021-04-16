import * as components from '@pres/components'
import { Program }     from '@pres/program'
import { Tput }        from '@pres/terminfo-parser'
import * as colors     from '@pres/util-colors'
import { helpers }     from '@pres/util-helpers'
import * as unicode    from '@pres/util-unicode'
// import { Deco, logger } from '@spare/logger'

import { ATTACH, REMOVE_LISTENER, EVENT, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEW_LISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHT_EXCEPTION, WARNING, ACTION, ADD_ITEM, ADOPT, BTNDOWN, BTNUP, CD, CHECK, COMPLETE, CONNECT, CREATE_ITEM, DBLCLICK, DRAG, INSERT_ITEM, _LOG, MOVE, PARSED_CONTENT, PASSTHROUGH, REFRESH, REMOVE, REMOVE_ITEM, REPARENT, RESPONSE, SELECT, SELECT_ITEM, SELECT_TAB, SET_ITEMS, UNCHECK, WHEELDOWN, WHEELUP, } from '@pres/enum-events'

export class  TerminalInterface {
  static program = Program.build
  static build = Program.build
  static helpers = helpers
  static unicode = unicode
  static colors = colors
  static Tput = Tput
}

Object.assign(TerminalInterface, components)

// Object.assign({}, TerminalInterface) |> Deco({ depth: 2, vert: 2 }) |> logger