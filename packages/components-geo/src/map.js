import { Canvas } from '@pres/components-layout'
import { ATTACH } from '@pres/enum-events'
import InnerMap   from 'map-canvas'

export class Map extends Canvas {
  constructor(options = {}) {
    super(options)
    const self = this
    this.on(ATTACH, function () {
      options.style = options.style || {}
      const opts = {
        excludeAntartica: options.excludeAntarctica ?? true,
        disableBackground: options.disableBackground ?? true,
        disableMapBackground: options.disableMapBackground ?? true,
        disableGraticule: options.disableGraticule ?? true,
        disableFill: options.disableFill ?? true,
        width: self.context._canvas.width,
        height: self.context._canvas.height,
        shapeColor: options.style.shapeColor || 'green',
        startLon: options.startLon || undefined,
        endLon: options.endLon || undefined,
        startLat: options.startLat || undefined,
        endLat: options.endLat || undefined,
        region: options.region || undefined,
        labelSpace: options.labelSpace || 5,
      }
      this.context.strokeStyle = options.style.stroke || 'green'
      this.context.fillStyle = options.style.fill || 'green'
      self.innerMap = new InnerMap(opts, this._canvas)
      self.innerMap.draw()
      if (self.options.markers)
        for (let m in self.options.markers)
          self.addMarker(self.options.markers[m])
    })
    this.type = 'map'
  }
  static build(options) { return new Map(options) }
  calcSize() { this._w = this.width * 2 - 12, this._h = this.height * 4 }
  addMarker(options) {
    if (!this.innerMap) throw 'error: canvas context does not exist. addMarker() for maps must be called after the map has been added to the screen via screen.append()'
    this.innerMap.addMarker(options)
  }
  clearMarkers() { this.innerMap.draw() }
  getOptionsPrototype() {
    return {
      startLon: 10,
      endLon: 10,
      startLat: 10,
      endLat: 10,
      region: 'us',
      markers: [
        { 'lon': '-79.0000', 'lat': '37.5000', color: 'red', char: 'X' },
        { 'lon': '79.0000', 'lat': '37.5000', color: 'blue', char: 'O' },
      ]
    }
  }
}

