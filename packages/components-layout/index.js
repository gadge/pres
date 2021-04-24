import { Canvas }   from './src/canvas'
import { Carousel } from './src/carousel'
import { Grid }     from './src/grid'

const canvas = (options, canvasType) => new Canvas(options, canvasType)
const carousel = (pages, options) => new Carousel(pages, options)
const grid = options => new Grid(options)

export {
  Canvas, canvas,
  Carousel, carousel,
  Grid, grid,
}
