import { Box }                   from '@pres/components-core'
import { ATTACH }                from '@pres/enum-events'
import { Canvas as InnerCanvas } from 'drawille-canvas-blessed-contrib'

export class Canvas extends Box {
  constructor(options = {}, canvasType) {
    // if (!(this instanceof Node)) return new Canvas(options)
    // this.options = options
    super(options) // Mixin.assign(this, new Box(options)) // Box.call(this, options)
    const self = this
    this.on(ATTACH, () => {
      self.calcSize()
      self._canvas = new InnerCanvas(self.canvasSize.width, self.canvasSize.height, canvasType)
      self.context = self._canvas.getContext()
      if (self.options.data) self.setData(self.options.data)
    })
    this.type = 'canvas'
  }
  calcSize() { this.canvasSize = { width: this.width * 2 - 12, height: this.height * 4 } }
  clear() { this.context.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height) }
  render() {
    this.clearPos(true)
    const inner = this.context._canvas.frame()
    this.setContent(inner)
    return this._render()
  }
}

