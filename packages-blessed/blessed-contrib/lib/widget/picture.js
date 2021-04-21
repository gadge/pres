import blessed      from 'blessed'
import fs           from 'fs'
import streams      from 'memory-streams'
import MemoryStream from 'memorystream'
import pictureTube  from 'picture-tuber'

const Node = blessed.Node,
      Box  = blessed.Box
function Picture(options) {
  if (!(this instanceof Node)) { return new Picture(options) }
  options = options || {}
  options.cols = options.cols || 50
  this.options = options
  if (options.file || options.base64) { this.setImage(options) }
  Box.call(this, options)
}
Picture.prototype = Object.create(Box.prototype)
Picture.prototype.setImage = function (options) {
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
  tube.on('end', function () {
    if (options.onReady) { options.onReady() }
  })
}
Picture.prototype.render = function () {
  this.setContent(this.writer.toString())
  return this._render()
}
Picture.prototype.getOptionsPrototype = function () {
  return {
    base64: 'AAAA',
    cols: 1
  }
}
Picture.prototype.type = 'picture'
export default Picture
