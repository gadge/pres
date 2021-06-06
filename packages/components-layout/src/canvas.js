import { Box }                   from '@pres/components-core'
import { ATTACH }                from '@pres/enum-events'
import { Canvas as InnerCanvas } from '@pres/util-drawille-canvas'

export class Canvas extends Box {
  _h
  _w
  constructor(options = {}, canvasType) {
    if (!options.sku) options.sku = 'canvas'
    // if (!(this instanceof Node)) return new Canvas(options)
    // this.options = options
    super(options) // Mixin.assign(this, new Box(options)) // Box.call(this, options)
    const self = this
    this.on(ATTACH, () => {
      self.calcSize()
      self._canvas = new InnerCanvas(self._w, self._h, canvasType)
      self.context = self._canvas.getContext()
      if (self.options.data) self.setData(self.options.data)
    })
    this.type = 'canvas'
  }
  static build(options) { return new Canvas(options) }
  get size() { return [ this._w, this._w ] }
  calcSize() {
    this._w = this.width * 2 - 12
    this._h = this.height * 4
  }
  clear() { this.context.clearRect(0, 0, this._w, this._h) }
  render() {
    this.clearPos(true)
    const inner = this.context._canvas.frame()
    this.setContent(inner)
    return this._render()
  }
}

