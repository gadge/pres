/**
 * screen.js - screen node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

const nextTick = global.setImmediate || process.nextTick.bind(process)

import { ATTACH, BLUR, CANCEL, CLICK, CLOSE, DATA, DESTROY, DETACH, ELEMENT_KEYPRESS, ELEMENT_CLICK, ELEMENT_FOCUS, ELEMENT_WHEELDOWN, ELEMENT_WHEELUP, ELEMENT_MOUSEOVER, ELEMENT_MOUSEOUT, ELEMENT_MOUSEUP, ERROR, EXIT, FILE, FOCUS, HIDE, KEY, KEYPRESS, MOUSE, MOUSEDOWN, MOUSEOVER, MOUSEMOVE, MOUSEOUT, MOUSEWHEEL, NEWLISTENER, ON, PRERENDER, PRESS, RENDER, RESET, RESIZE, SCROLL, SET_CONTENT, SHOW, SIGINT, SIGQUIT, SIGTERM, SIZE, SUBMIT, TITLE, UNCAUGHTEXCEPTION, WARNING, } from '@pres/enum-events'

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
    process.on('uncaughtException', _Screen._exceptionHandler = err => {
      if (process.listeners('uncaughtException').length > 1) { return }
      _Screen.instances.slice().forEach(screen => screen.destroy())
      err = err || new Error('Uncaught Exception.')
      console.error(err.stack ? err.stack + '' : err + '')
      nextTick(() => process.exit(1))
    });
    [ 'SIGTERM', 'SIGINT', 'SIGQUIT' ].forEach(signal => {
      const name = '_' + signal.toLowerCase() + 'Handler'
      process.on(signal, _Screen[name] = () => {
        if (process.listeners(signal).length > 1) { return }
        nextTick(() => process.exit(0))
      })
    })
    process.on('exit', _Screen._exitHandler = () => {
      _Screen.instances.slice().forEach(screen => screen.destroy())
    })
  }
}
