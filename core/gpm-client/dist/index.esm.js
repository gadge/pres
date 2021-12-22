import { BTNDOWN, BTNUP, CLICK, CONNECT, DATA, DBLCLICK, DRAG, ERROR, MOUSE, MOUSEWHEEL, MOVE } from '@pres/enum-events'
import { LEFT, MIDDLE, RIGHT }                                                                  from '@pres/enum-key-names'
import { EventEmitter }                                                                         from 'events'
import fs                                                                                       from 'fs'
import net                                                                                      from 'net'

/**
 * gpmClient.js - support the gpm mouse protocol
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */
const GPM_MOVE = 1,
      GPM_DRAG = 2,
      GPM_DOWN = 4,
      GPM_UP = 8;
const GPM_DOUBLE = 32,
      GPM_MFLAG = 128;
const GPM_REQ_NOPASTE = 3,
      GPM_HARD = 256;
const GPM_SOCKET = '/dev/gpmctl'; // typedef struct Gpm_Connect {
//   unsigned short eventMask, defaultMask;
//   unsigned short minMod, maxMod;
//   int pid;
//   int vc;
// } Gpm_Connect;

function send_config(socket, Gpm_Connect, callback) {
  let buffer;

  {
    buffer = new Buffer(16);
    buffer.writeUInt16LE(Gpm_Connect.eventMask, 0);
    buffer.writeUInt16LE(Gpm_Connect.defaultMask, 2);
    buffer.writeUInt16LE(Gpm_Connect.minMod, 4);
    buffer.writeUInt16LE(Gpm_Connect.maxMod, 6);
    buffer.writeInt16LE(Gpm_Connect.pid, 8);
    buffer.writeInt16LE(Gpm_Connect.vc, 12);
  }

  socket.write(buffer, () => {
    if (callback) callback();
  });
} // typedef struct Gpm_Event {
//   unsigned char buttons, modifiers;  // try to be a multiple of 4
//   unsigned short vc;
//   short dx, dy, x, y; // displacement x,y for this event, and absolute x,y
//   enum Gpm_Etype type;
//   // clicks e.g. double click are determined by time-based processing
//   int clicks;
//   enum Gpm_Margin margin;
//   // wdx/y: displacement of wheels in this event. Absolute values are not
//   // required, because wheel movement is typically used for scrolling
//   // or selecting fields, not for cursor positioning. The application
//   // can determine when the end of file or form is reached, and not
//   // go any further.
//   // A single mouse will use wdy, "vertical scroll" wheel.
//   short wdx, wdy;
// } Gpm_Event;


function parseEvent(raw) {
  const event = {};
  event.buttons = raw[0];
  event.modifiers = raw[1];
  event.vc = raw.readUInt16LE(2);
  event.dx = raw.readInt16LE(4);
  event.dy = raw.readInt16LE(6);
  event.x = raw.readInt16LE(8);
  event.y = raw.readInt16LE(10);
  event.type = raw.readInt16LE(12);
  event.clicks = raw.readInt32LE(16);
  event.margin = raw.readInt32LE(20);
  event.wdx = raw.readInt16LE(24);
  event.wdy = raw.readInt16LE(26);
  return event;
}

const gpmClient = options => new GpmClient(options);
class GpmClient extends EventEmitter {
  constructor(options = {}) {
    super(); // if (!(this instanceof GpmClient)) return new GpmClient(options)

    const pid = process.pid; // check tty for /dev/tty[n]

    let path;

    try {
      path = fs.readlinkSync('/proc/' + pid + '/fd/0');
    } catch (e) {}

    let tty = /tty[0-9]+$/.exec(path);


    let vc;

    if (tty) {
      tty = tty[0];
      vc = +/[0-9]+$/.exec(tty)[0];
    }

    const self = this;

    if (tty) {
      fs.stat(GPM_SOCKET, function (err, stat) {
        if (err || !stat.isSocket()) {
          return;
        }

        const conf = {
          eventMask: 0xffff,
          defaultMask: GPM_MOVE | GPM_HARD,
          minMod: 0,
          maxMod: 0xffff,
          pid: pid,
          vc: vc
        };
        const gpm = net.createConnection(GPM_SOCKET);
        this.gpm = gpm;
        gpm.on(CONNECT, () => {
          send_config(gpm, conf, () => {
            conf.pid = 0;
            conf.vc = GPM_REQ_NOPASTE; //send_config(gpm, conf);
          });
        });
        gpm.on(DATA, packet => {
          const event = parseEvent(packet);

          switch (event.type & 15) {
            case GPM_MOVE:
              if (event.dx || event.dy) {
                self.emit(MOVE, event.buttons, event.modifiers, event.x, event.y);
              }

              if (event.wdx || event.wdy) {
                self.emit(MOUSEWHEEL, event.buttons, event.modifiers, event.x, event.y, event.wdx, event.wdy);
              }

              break;

            case GPM_DRAG:
              if (event.dx || event.dy) {
                self.emit(DRAG, event.buttons, event.modifiers, event.x, event.y);
              }

              if (event.wdx || event.wdy) {
                self.emit(MOUSEWHEEL, event.buttons, event.modifiers, event.x, event.y, event.wdx, event.wdy);
              }

              break;

            case GPM_DOWN:
              self.emit(BTNDOWN, event.buttons, event.modifiers, event.x, event.y);

              if (event.type & GPM_DOUBLE) {
                self.emit(DBLCLICK, event.buttons, event.modifiers, event.x, event.y);
              }

              break;

            case GPM_UP:
              self.emit(BTNUP, event.buttons, event.modifiers, event.x, event.y);

              if (!(event.type & GPM_MFLAG)) {
                self.emit(CLICK, event.buttons, event.modifiers, event.x, event.y);
              }

              break;
          }
        });
        gpm.on(ERROR, () => self.stop());
      });
    }
  }

  stop() {
    if (this.gpm) this.gpm.end();
    delete this.gpm;
  }

  buttonName(btn) {
    return btn & 4 ? LEFT : btn & 2 ? MIDDLE : btn & 1 ? RIGHT : '';
  }

  hasShiftKey(mod) {
    return !!(mod & 1);
  }

  hasCtrlKey(mod) {
    return !!(mod & 4);
  }

  hasMetaKey(mod) {
    return !!(mod & 8);
  }
  /**
   * appended
   */


  createKey(action, button, modifier, x, y, dx, dy) {
    return {
      name: MOUSE,
      type: 'GPM',
      action: action,
      button: this.buttonName(button),
      raw: [button, modifier, x, y, dx, dy],
      x: x,
      y: y,
      shift: this.hasShiftKey(modifier),
      meta: this.hasMetaKey(modifier),
      ctrl: this.hasCtrlKey(modifier)
    };
  }

}

export { GpmClient, gpmClient };
