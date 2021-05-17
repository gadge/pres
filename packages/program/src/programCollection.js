import { EXIT } from '@pres/enum-events'

export class ProgramCollection {
  static global = null
  static total = 0
  static instances = []
  static _bound = false
  static initialize(program) {
    if (!ProgramCollection.global) ProgramCollection.global = program
    if (!~ProgramCollection.instances.indexOf(program)) {
      ProgramCollection.instances.push(program)
      program.index = ProgramCollection.total
      ProgramCollection.total++
    }
    if (ProgramCollection._bound) return
    ProgramCollection._bound = true
    ProgramCollection.unshiftEvent(process, EXIT, ProgramCollection._exitHandler)
    console.log('>> [ProgramCollection.initialize]', ProgramCollection.total, `[ ${process.eventNames()} ]`)
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
  static _exitHandler() {
    ProgramCollection.instances.forEach(program => {
      // Potentially reset window title on exit:
      // if (program._originalTitle) program.setTitle(program._originalTitle)
      program.flush()         // Ensure the buffer is flushed (it should always be at this point, but who knows).
      program._exiting = true // Ensure _exiting is set (could technically use process._exiting).
    })
  }
}