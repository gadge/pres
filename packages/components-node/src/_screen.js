/**
 * screen.js - screen node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

const nextTick = global.setImmediate || process.nextTick.bind(process)

import { ATTACH, REMOVE_LISTENER, EVENT, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEW_LISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHT_EXCEPTION, WARNING, ACTION, ADD_ITEM, ADOPT, BTNDOWN, BTNUP, CD, CHECK, COMPLETE, CONNECT, CREATE_ITEM, DBLCLICK, DRAG, INSERT_ITEM, _LOG, MOVE, PARSED_CONTENT, PASSTHROUGH, REFRESH, REMOVE, REMOVE_ITEM, REPARENT, RESPONSE, SELECT, SELECT_ITEM, SELECT_TAB, SET_ITEMS, UNCHECK, WHEELDOWN, WHEELUP, } from '@pres/enum-events'

export class  _Screen {
  static global = null
  static total = 0
  static instances = []
  static configSingleton(screen) {
    if (!_Screen.global) _Screen.global = screen
    if (!~_Screen.instances.indexOf(screen)) {
      _Screen.instances.push(screen)
      screen.index = _Screen.total
      _Screen.total++
    }
    if (_Screen._bound) return
    _Screen._bound = true
    process.on(UNCAUGHT_EXCEPTION, _Screen._exceptionHandler = err => {
      if (process.listeners(UNCAUGHT_EXCEPTION).length > 1) { return }
      _Screen.instances.slice().forEach(screen => screen.destroy())
      err = err || new Error('Uncaught Exception.')
      console.error(err.stack ? err.stack + '' : err + '')
      nextTick(() => process.exit(1))
    });
    [ SIGTERM, SIGINT, SIGQUIT ].forEach(signal => {
      const name = '_' + signal.toLowerCase() + 'Handler'
      process.on(signal, _Screen[name] = () => {
        if (process.listeners(signal).length > 1) { return }
        nextTick(() => process.exit(0))
      })
    })
    process.on(EXIT, _Screen._exitHandler = () => {
      _Screen.instances.slice().forEach(screen => screen.destroy())
    })
  }
}
