import { List } from '@pres/components-data'

export class LogList extends List {
  constructor(options) {
    // if (!(this instanceof Node)) { return new Log(options) }
    options.bufferLength = options.bufferLength || 30
    super(options)
    this.logLines = []
    this.interactive = false
    this.type = 'log'
  }
  static build(options) { return new LogList(options) }
  log(str) {
    this.logLines.push(str)
    if (this.logLines.length > this.options.bufferLength) { this.logLines.shift() }
    this.setItems(this.logLines)
    this.scrollTo(this.logLines.length)
  }
}

