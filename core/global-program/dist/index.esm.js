import { EXIT } from '@pres/enum-events';

class GlobalProgram {
  static initialize(program) {
    if (!GlobalProgram.global) GlobalProgram.global = program;

    if (!~GlobalProgram.instances.indexOf(program)) {
      GlobalProgram.instances.push(program);
      program.index = GlobalProgram.total;
      GlobalProgram.total++;
    }

    if (GlobalProgram._bound) return;
    GlobalProgram._bound = true;
    GlobalProgram.unshiftEvent(process, EXIT, GlobalProgram._exitHandler);
    console.log('>> [GlobalProgram.initialize]', GlobalProgram.total, `[ ${process.eventNames()} ]`);
  } // We could do this easier by just manipulating the _events object, or for
  // older versions of node, manipulating the array returned by listeners(), but
  // neither of these methods are guaranteed to work in future versions of node.


  static unshiftEvent(target, event, listener) {
    const listeners = target.listeners(event);
    target.removeAllListeners(event);
    target.on(event, listener);
    listeners.forEach(listener => target.on(event, listener));
  }

  static _exitHandler(err) {
    // console.error(err)
    GlobalProgram.instances.forEach(program => {
      // Potentially reset window title on exit:
      // if (program._originalTitle) program.setTitle(program._originalTitle)
      program.flush(); // Ensure the buffer is flushed (it should always be at this point, but who knows).

      program._exiting = true; // Ensure _exiting is set (could technically use process._exiting).
    });
  }

}
GlobalProgram.global = null;
GlobalProgram.total = 0;
GlobalProgram.instances = [];
GlobalProgram._bound = false;

export { GlobalProgram };
