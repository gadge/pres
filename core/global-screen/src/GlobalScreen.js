import { EXIT, SIGINT, SIGQUIT, SIGTERM, UNCAUGHT_EXCEPTION, } from '@pres/enum-events'

/**
 * screen.js - screen node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

const nextTick = global.setImmediate || process.nextTick.bind(process)

const SIGNAL_COLLECTION = [ SIGTERM, SIGINT, SIGQUIT, EXIT, UNCAUGHT_EXCEPTION ]

export class GlobalScreen {
  static global = null
  static total = 0
  static instances = []
  static _bound = false
  static journal = true
  static handlers = {}

  static initialize(screen) {
    if (!GlobalScreen.global) GlobalScreen.global = screen
    if (!~GlobalScreen.instances.indexOf(screen)) {
      GlobalScreen.instances.push(screen)
      screen.index = GlobalScreen.total
      GlobalScreen.total++
    }
    if (GlobalScreen._bound) return
    GlobalScreen._bound = true
    for (const signal of SIGNAL_COLLECTION) {
      const name = GlobalScreen.handlers[signal] = '_' + signal.toLowerCase() + 'Handler'
      const onSignal = GlobalScreen[name] ?? ( GlobalScreen[name] = signalHandler.bind({ signal }) )
      process.on(signal, onSignal)
    }
    console.log('>> [GlobalScreen.initialize]', GlobalScreen.total, `[ ${ Object.keys(GlobalScreen.handlers) } ]`)
  }
  static _uncaughtExceptionHandler(err = new Error('Uncaught Exception.')) {
    if (process.listeners(UNCAUGHT_EXCEPTION).length > 1) return
    GlobalScreen.instances.slice()?.forEach(screen => screen?.destroy())
    console.error(err) // console.error(err.stack ? err.stack + '' : err + '')
    nextTick(() => process.exit(1))
  }
  static exitHandler(err) {
    console.error(err)
    GlobalScreen.instances.slice()?.forEach(screen => screen?.destroy())
  }
}

function signalHandler(err) {
  console.error(err) // .stack ? err.stack + '' : err + ''
  const signal = this?.signal
  if (process.listeners(signal).length > 1) return
  nextTick(() => process.exit(0))
}
