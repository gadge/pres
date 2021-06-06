import { Context } from './src/Context'

export { Context }

export function Canvas(width, height, canvasClass) {
  let ctx
  this.getContext = function () {
    return ctx = ctx || new Context(width, height, canvasClass)
  }
}