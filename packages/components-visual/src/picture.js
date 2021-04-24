import { Box }      from '@pres/components-core'
import fs           from 'fs'
import streams      from 'memory-streams'
import MemoryStream from 'memorystream'
import pictureTube  from 'picture-tuber'

// added from blessed-contrib

export class Picture extends Box {
  constructor(options) {
    // if (!(this instanceof Node)) { return new Picture(options) }
    options.cols = options.cols || 50
    // this.options = options
    super(options)
    if (options.file || options.base64) { this.setImage(options) }
    this.type = 'picture' // Mixin.assign(this, new Box(options)) // Box.call(this, options)
  }
  static build(options) { return new Picture(options) }
  setImage(options) {
    const tube = pictureTube({ cols: options.cols })
    if (options.file) fs.createReadStream(options.file).pipe(tube)
    else if (options.base64) {
      const memStream = new MemoryStream()
      memStream.pipe(tube)
      const buf = new Buffer(options.base64, 'base64')
      memStream.write(buf)
      memStream.end()
    }
    this.writer = new streams.WritableStream()
    tube.pipe(this.writer)
    tube.on('end', () => { if (options.onReady) { options.onReady() } })
  }
  render() {
    this.setContent(this.writer.toString())
    return this._render()
  }
  getOptionsPrototype() {
    return {
      base64: 'AAAA',
      cols: 1
    }
  }
}

