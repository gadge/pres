import { UNCAUGHT_EXCEPTION, SIGTERM, SIGINT, SIGQUIT, EXIT } from '@pres/enum-events';

/**
 * screen.js - screen node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

const nextTick = global.setImmediate || process.nextTick.bind(process);
const SIGNAL_COLLECTION = [SIGTERM, SIGINT, SIGQUIT, EXIT, UNCAUGHT_EXCEPTION];
class GlobalScreen {
  static initialize(screen) {
    if (!GlobalScreen.global) GlobalScreen.global = screen;

    if (!~GlobalScreen.instances.indexOf(screen)) {
      GlobalScreen.instances.push(screen);
      screen.index = GlobalScreen.total;
      GlobalScreen.total++;
    }

    if (GlobalScreen._bound) return;
    GlobalScreen._bound = true;

    for (const signal of SIGNAL_COLLECTION) {
      const name = GlobalScreen.handlers[signal] = '_' + signal.toLowerCase() + 'Handler';
      const onSignal = GlobalScreen[name] ?? (GlobalScreen[name] = signalHandler.bind({
        signal
      }));
      process.on(signal, onSignal);
    }

    console.log('>> [GlobalScreen.initialize]', GlobalScreen.total, `[ ${Object.keys(GlobalScreen.handlers)} ]`);
  }

  static _uncaughtExceptionHandler(err = new Error('Uncaught Exception.')) {
    var _GlobalScreen$instanc;

    if (process.listeners(UNCAUGHT_EXCEPTION).length > 1) return;
    (_GlobalScreen$instanc = GlobalScreen.instances.slice()) == null ? void 0 : _GlobalScreen$instanc.forEach(screen => screen == null ? void 0 : screen.destroy());
    console.error(err); // console.error(err.stack ? err.stack + '' : err + '')

    nextTick(() => process.exit(1));
  }

  static _exitHandler(err) {
    var _GlobalScreen$instanc2;

    console.error(err);
    (_GlobalScreen$instanc2 = GlobalScreen.instances.slice()) == null ? void 0 : _GlobalScreen$instanc2.forEach(screen => screen == null ? void 0 : screen.destroy());
  }

}
GlobalScreen.global = null;
GlobalScreen.total = 0;
GlobalScreen.instances = [];
GlobalScreen._bound = false;
GlobalScreen.journal = true;
GlobalScreen.handlers = {};

function signalHandler(err) {
  console.error(err); // .stack ? err.stack + '' : err + ''

  const signal = this == null ? void 0 : this.signal;
  if (process.listeners(signal).length > 1) return;
  nextTick(() => process.exit(0));
}

export { GlobalScreen };
