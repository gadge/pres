import { EXIT, SIGINT, SIGQUIT, SIGTERM, UNCAUGHT_EXCEPTION, } from '@pres/enum-events'

/**
 * screen.js - screen node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

const nextTick = global.setImmediate || process.nextTick.bind(process)

const SIGNAL_COLLECTION = [ SIGTERM, SIGINT, SIGQUIT ]

export class ScreenCollection {
  static global = null
  static total = 0
  static instances = []
  static _bound = false

  static initialize(screen) {
    if (!ScreenCollection.global) ScreenCollection.global = screen
    if (!~ScreenCollection.instances.indexOf(screen)) {
      ScreenCollection.instances.push(screen)
      screen.index = ScreenCollection.total
      ScreenCollection.total++
    }
    console.log('>> [ScreenCollection.initialize]', screen.index, ScreenCollection.total)
    if (ScreenCollection._bound) return
    ScreenCollection._bound = true

    process.on(UNCAUGHT_EXCEPTION, ScreenCollection._exceptionHandler)
    process.on(EXIT, ScreenCollection._exitHandler)
    SIGNAL_COLLECTION.forEach(signal => {
      const name = '_' + signal.toLowerCase() + 'Handler'
      process.on(signal, ScreenCollection[name] = () => {
        if (process.listeners(signal).length > 1) return
        nextTick(() => process.exit(0))
      })
    })
  }

  static _exceptionHandler(err) {
    if (process.listeners(UNCAUGHT_EXCEPTION).length > 1) return
    ScreenCollection.instances.slice().forEach(screen => screen.destroy())
    err = err || new Error('Uncaught Exception.')
    console.error(err.stack ? err.stack + '' : err + '')
    nextTick(() => process.exit(1))
  }
  static _exitHandler() {
    ScreenCollection.instances.slice().forEach(screen => screen.destroy())
  }
}
