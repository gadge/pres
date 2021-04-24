import { ANSIImage, ANSIImage as PNG } from './src/ansiimage'
import { BigText }                     from './src/bigtext'
import { Image }                       from './src/image'
import { OverlayImage }                from './src/overlayimage'
import { Video }                       from './src/video'

const ansiImage = (options) => new ANSIImage(options)
const bigText = (options) => new BigText(options)
const image = (options) => new Image(options)
const overlayImage = (options) => new OverlayImage(options)
const png = (options) => new PNG(options)
const video = (options) => new Video(options)

export {
  ANSIImage, ansiImage,
  BigText, bigText,
  Image, image,
  OverlayImage, overlayImage,
  PNG, png,
  Video, video,
}