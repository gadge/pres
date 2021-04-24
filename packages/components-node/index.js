import { _Screen } from './src/_screen'
import { Node }    from './src/node'

const node = options => new Node(options)
const _screen = options => new Node(options)
export {
  Node, node,
  _Screen, _screen,
}