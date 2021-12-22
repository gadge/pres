import { LF }   from '@pres/enum-control-chars'
import { SP }   from '@texting/enum-chars'
import { OBJ }  from '@typen/enum-data-types'
import { time } from '@valjoux/timestamp'
import fs       from 'fs'


export class Logger {
  static #h = {}
  static localInfo = (topic, content) => {
    const DEST = process.cwd() + '/resources/log/' + topic + '.log'
    if (typeof content === OBJ) content = JSON.stringify(content, null, 4)
    fs.writeFileSync(DEST, content)
  }
  static log = (topic, headline, ...contents) => {
    const DEST = process.cwd() + '/resources/log/' + topic + '.log'
    /** @type {number} */
    const fd = Logger.#h[topic] || ( Logger.#h[topic] = fs.openSync(DEST, 'w') )
    fs.writeSync(fd, '>> ' + time() + SP + headline + LF)
    for (let t of contents) {
      if (typeof t === OBJ) t = JSON.stringify(t, null, 4)
      fs.writeSync(fd, t + LF)
    }
    fs.writeSync(fd, LF)
  }
}
