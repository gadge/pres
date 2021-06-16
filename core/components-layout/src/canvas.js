import { Box }                    from '@pres/components-core'
import { ATTACH }                 from '@pres/enum-events'
import { Context as InnerCanvas } from '@pres/util-drawille-canvas'

export class Canvas extends Box {
  constructor(options = {}, canvasType) {
    if (!options.sku) options.sku = 'canvas'
    // if (!(this instanceof Node)) return new Canvas(options)
    // this.options = options
    super(options) // Mixin.assign(this, new Box(options)) // Box.call(this, options)
    this.on(ATTACH, () => {
      this.context = new InnerCanvas(this.canvW, this.canvH, canvasType)
      if (this.options.data) this.setData(this.options.data)
    })
    this.type = 'canvas'
  }
  static build(options) { return new Canvas(options) }
  get drawille() { return this.context.drawille }
  get canvH() { return this.height << 2 }
  get canvW() { return ( this.width << 1 ) - 12 }
  clear() { this.context.clearRect(0, 0, this.canvW, this.canvH) }
  render() {
    this.clearPos(true)
    const inner = this.drawille.frame()
    this.setContent(inner)
    return this._render()
  }
}

