import { ATTACH } from '@pres/enum-events'
import InnerMap   from 'map-canvas'
import { Canvas } from './canvas'

export class Map extends Canvas {
  constructor(options = {}) {
    // if (!(this instanceof Node)) { return new Map(options) }
    super(options)
    const self = this
    this.on(ATTACH, function () {
      options.style = options.style || {}
      const opts = {
        excludeAntartica: (options.excludeAntarctica === undefined) ? true : options.excludeAntarctica,
        disableBackground: (options.disableBackground === undefined) ? true : options.disableBackground,
        disableMapBackground: (options.disableMapBackground === undefined) ? true : options.disableMapBackground,
        disableGraticule: (options.disableGraticule === undefined) ? true : options.disableGraticule,
        disableFill: (options.disableFill === undefined) ? true : options.disableFill,
        width: self.context._canvas.width,
        height: self.context._canvas.height,
        shapeColor: options.style.shapeColor || 'green'
      }
      opts.startLon = options.startLon || undefined
      opts.endLon = options.endLon || undefined
      opts.startLat = options.startLat || undefined
      opts.endLat = options.endLat || undefined
      opts.region = options.region || undefined
      opts.labelSpace = options.labelSpace || 5
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
  calcSize() { this._w = this.width * 2 - 12, this._h = this.height * 4 }
  addMarker(options) {
    if (!this.innerMap) throw 'error: canvas context does not exist. addMarker() for maps must be called after the map has been added to the screen via screen.append()'
    this.innerMap.addMarker(options)
  }
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
  clearMarkers() { this.innerMap.draw() }
}

