import { Loading }     from './src/loading'
import { Message }     from './src/message'
import { ProgressBar } from './src/progressbar'

const loading = (options) => new Loading(options)
const message = (options) => new Message(options)
const progressBar = (options) => new ProgressBar(options)

export {
  Loading, loading,
  Message, message,
  ProgressBar, progressBar,
}