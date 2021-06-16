import { LogList }  from './src/log-list'
import { Markdown } from './src/markdown'
import { Text }     from './src/text'


const logList = options => new LogList(options)
const markdown = options => new Markdown(options)
const text = (options) => new Text(options)

export {
  LogList, logList,
  Markdown, markdown,
  Text, text,
}