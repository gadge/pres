'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var enumEvents = require('@pres/enum-events');

/**
 * screen.js - screen node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

const nextTick = global.setImmediate || process.nextTick.bind(process);
const SIGNAL_COLLECTION = [enumEvents.SIGTERM, enumEvents.SIGINT, enumEvents.SIGQUIT, enumEvents.EXIT, enumEvents.UNCAUGHT_EXCEPTION];
class GlobalScreen {
  static global = null;
  static total = 0;
  static instances = [];
  static #bound = false;
  static journal = true;
  static handlers = {};

  static initialize(screen) {
    if (!GlobalScreen.global) GlobalScreen.global = screen;

    if (!~GlobalScreen.instances.indexOf(screen)) {
      GlobalScreen.instances.push(screen);
      screen.index = GlobalScreen.total;
      GlobalScreen.total++;
    }

    if (GlobalScreen.#bound) return;
    GlobalScreen.#bound = true;

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

    if (process.listeners(enumEvents.UNCAUGHT_EXCEPTION).length > 1) return;
    (_GlobalScreen$instanc = GlobalScreen.instances.slice()) === null || _GlobalScreen$instanc === void 0 ? void 0 : _GlobalScreen$instanc.forEach(screen => screen === null || screen === void 0 ? void 0 : screen.destroy());
    console.error(err); // console.error(err.stack ? err.stack + '' : err + '')

    nextTick(() => process.exit(1));
  }

  static exitHandler(err) {
    var _GlobalScreen$instanc2;

    console.error(err);
    (_GlobalScreen$instanc2 = GlobalScreen.instances.slice()) === null || _GlobalScreen$instanc2 === void 0 ? void 0 : _GlobalScreen$instanc2.forEach(screen => screen === null || screen === void 0 ? void 0 : screen.destroy());
  }

  static removeInstanceAt(index) {
    GlobalScreen.instances.splice(index, 1);
    GlobalScreen.total--;
    GlobalScreen.global = GlobalScreen.instances[0];

    if (GlobalScreen.total === 0) {
      GlobalScreen.global = null;

      for (const [signal, handler] of Object.entries(GlobalScreen.handlers)) {
        process.off(signal, GlobalScreen[handler]);
        delete GlobalScreen[handler];
      }

      GlobalScreen.#bound = false;
    }

    return GlobalScreen;
  }

}

function signalHandler(err) {
  console.error(err); // .stack ? err.stack + '' : err + ''

  const signal = this === null || this === void 0 ? void 0 : this.signal;
  if (process.listeners(signal).length > 1) return;
  nextTick(() => process.exit(0));
}

exports.GlobalScreen = GlobalScreen;
