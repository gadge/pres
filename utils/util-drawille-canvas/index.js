import { Canvas }  from './src/Canvas'
import { Context } from './src/Context'

export { Context }
export { Canvas }

export class Canvas2 {
  constructor(width, height, canvasClass) {
    this._width = width
    this._height = height
    this._canvasClass = canvasClass
  }
  getContext() { return this.ctx ?? ( this.ctx = new Context(this._width, this._height, this._canvasClass) ) }
}