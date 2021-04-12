/**
 * screen.js - screen node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

const nextTick = global.setImmediate || process.nextTick.bind(process)

export class _Screen {
  static global = null
  static total = 0
  static instances = []
  static configSingleton(screen) {
    if (!Screen.global) Screen.global = screen
    if (!~Screen.instances.indexOf(screen)) {
      Screen.instances.push(screen)
      screen.index = Screen.total
      Screen.total++
    }
    if (Screen._bound) return
    Screen._bound = true
    process.on('uncaughtException', Screen._exceptionHandler = err => {
      if (process.listeners('uncaughtException').length > 1) { return }
      Screen.instances.slice().forEach(screen => screen.destroy())
      err = err || new Error('Uncaught Exception.')
      console.error(err.stack ? err.stack + '' : err + '')
      nextTick(() => process.exit(1))
    });
    [ 'SIGTERM', 'SIGINT', 'SIGQUIT' ].forEach(signal => {
      const name = '_' + signal.toLowerCase() + 'Handler'
      process.on(signal, Screen[name] = () => {
        if (process.listeners(signal).length > 1) { return }
        nextTick(() => process.exit(0))
      })
    })
    process.on('exit', Screen._exitHandler = () => {
      Screen.instances.slice().forEach(screen => screen.destroy())
    })
  }
}
