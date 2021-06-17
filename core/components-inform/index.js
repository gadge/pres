import { LCD }         from './src/lcd'
import { Loading }     from './src/loading'
import { Message }     from './src/message'
import { ProgressBar } from './src/progressBar'

const lcd = options => new LCD(options)
const loading = (options) => new Loading(options)
const message = (options) => new Message(options)
const progressBar = (options) => new ProgressBar(options)

export {
  LCD, lcd,
  Loading, loading,
  Message, message,
  ProgressBar, progressBar,
}