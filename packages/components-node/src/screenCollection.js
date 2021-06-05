import { EXIT, SIGINT, SIGQUIT, SIGTERM, UNCAUGHT_EXCEPTION, } from '@pres/enum-events'

/**
 * screen.js - screen node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

const nextTick = global.setImmediate || process.nextTick.bind(process)

const SIGNAL_COLLECTION = [ SIGTERM, SIGINT, SIGQUIT, EXIT, UNCAUGHT_EXCEPTION ]

export class ScreenCollection {
  static global = null
  static total = 0
  static instances = []
  static _bound = false
  static journal = true
  static handlers = {}

  static initialize(screen) {
    if (!ScreenCollection.global) ScreenCollection.global = screen
    if (!~ScreenCollection.instances.indexOf(screen)) {
      ScreenCollection.instances.push(screen)
      screen.index = ScreenCollection.total
      ScreenCollection.total++
    }
    if (ScreenCollection._bound) return
    ScreenCollection._bound = true
    for (const signal of SIGNAL_COLLECTION) {
      const name = ScreenCollection.handlers[signal] = '_' + signal.toLowerCase() + 'Handler'
      const onSignal = ScreenCollection[name] ?? ( ScreenCollection[name] = signalHandler.bind({ signal }) )
      process.on(signal, onSignal)
    }
    console.log('>> [ScreenCollection.initialize]', ScreenCollection.total, `[ ${ Object.keys(ScreenCollection.handlers) } ]`)
  }
  static _uncaughtExceptionHandler(err) {
    if (process.listeners(UNCAUGHT_EXCEPTION).length > 1) return
    ScreenCollection.instances.slice()?.forEach(screen => screen?.destroy())
    err = err || new Error('Uncaught Exception.')
    console.error(err.stack ? err.stack + '' : err + '')
    nextTick(() => process.exit(1))
  }
  static _exitHandler() {
    ScreenCollection.instances.slice()?.forEach(screen => screen?.destroy())
  }
}

function signalHandler(err) {
  console.error(err) // .stack ? err.stack + '' : err + ''
  const signal = this?.signal
  if (process.listeners(signal).length > 1) return
  nextTick(() => process.exit(0))
}
