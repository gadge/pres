import { EXIT } from '@pres/enum-events'

export class GlobalProgram {
  static global = null
  static total = 0
  static instances = []
  static #bound = false

  static initialize(program) {
    if (!GlobalProgram.global) GlobalProgram.global = program
    if (!~GlobalProgram.instances.indexOf(program)) {
      GlobalProgram.instances.push(program)
      program.index = GlobalProgram.total
      GlobalProgram.total++
    }
    if (GlobalProgram.#bound) { return GlobalProgram }
    GlobalProgram.#bound = true
    GlobalProgram.unshiftEvent(process, EXIT, GlobalProgram.exitHandler)
    console.log('>> [GlobalProgram.initialize]', GlobalProgram.total, `[ ${process.eventNames()} ]`)
  }
  // We could do this easier by just manipulating the _events object, or for
  // older versions of node, manipulating the array returned by listeners(), but
  // neither of these methods are guaranteed to work in future versions of node.
  static unshiftEvent(target, event, listener) {
    const listeners = target.listeners(event)
    target.removeAllListeners(event)
    target.on(event, listener)
    listeners.forEach(listener => target.on(event, listener))
  }

  static exitHandler(err) {
    // console.error(err)
    GlobalProgram.instances.forEach(program => {
      // Potentially reset window title on exit:
      // if (program._originalTitle) program.setTitle(program._originalTitle)
      program.flush()         // Ensure the buffer is flushed (it should always be at this point, but who knows).
      program._exiting = true // Ensure _exiting is set (could technically use process._exiting).
    })
  }

  static removeInstanceAt(index) {
    GlobalProgram.instances.splice(index, 1)
    GlobalProgram.total--
    GlobalProgram.global = GlobalProgram.instances[0]
    if (GlobalProgram.total === 0) {
      GlobalProgram.global = null
      process.removeListener(EXIT, GlobalProgram.exitHandler.bind(GlobalProgram))
      delete GlobalProgram.exitHandler.bind(GlobalProgram)
      GlobalProgram.#bound = false
    }
    return GlobalProgram
  }
}