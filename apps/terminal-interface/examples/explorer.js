import { blessed }  from '@pres/terminal-interface'
import fs           from 'fs'
import * as contrib from '../index'

const screen = Screen.build()
//create layout and widgets
const grid = Grid.build({ rows: 1, cols: 2, screen: screen })
const tree = grid.set(0, 0, 1, 1, contrib.tree, {
  style: { text: "red" },
  template: { lines: true },
  label: 'Filesystem Tree'
})
const table = grid.set(0, 1, 1, 1, contrib.table, {
  keys: true,
  fg: 'green',
  label: 'Informations',
  columnWidth: [ 24, 10, 10 ]
})
//file explorer
const explorer = {
  name: '/',
  extended: true,
  // Custom function used to recursively determine the node path,
  getPath: function (self) {
    // If we don't have any sup, we are at tree root, so return the base case
    if (!self.sup)
      return ''
    // Get the sup node path and add this node name
    return self.sup.getPath(self.sup) + '/' + self.name
  },
  // Child generation function,
  sub: function (self) {
    let result = {}
    const selfPath = self.getPath(self)
    try {
      // List files in this directory
      const sub = fs.readdirSync(selfPath + '/')
      // subContent is a property filled with self.sub() result
      // on tree generation (tree.setData() call)
      if (!self.subContent) {
        for (let child in sub) {
          child = sub[child]
          const completePath = selfPath + '/' + child
          if (fs.lstatSync(completePath).isDirectory()) {
            // If it's a directory we generate the child with the sub generation function
            result[child] = { name: child, getPath: self.getPath, extended: false, sub: self.sub }
          }
          else {
            // Otherwise sub is not set (you can also set it to "{}" or "null" if you want)
            result[child] = { name: child, getPath: self.getPath, extended: false }
          }
        }
      }
      else {
        result = self.subContent
      }
    } catch (e) {}
    return result
  }
}
//set tree
tree.setData(explorer)
// Handling select event. Every custom property that was added to node is 
// available like the "node.getPath" defined above
tree.on('select', function (node) {
  let path = node.getPath(node)
  let data = []
  // The filesystem root return an empty string as a base case
  if (path == '')
    path = '/'
  // Add data to right array
  data.push([ path ])
  data.push([ '' ])
  try {
    // Add results
    data = data.concat(JSON.stringify(fs.lstatSync(path), null, 2).split("\n").map(function (e) {return [ e ]}))
    table.setData({ headers: [ 'Info' ], data: data })
  } catch (e) {
    table.setData({ headers: [ 'Info' ], data: [ [ e.toString() ] ] })
  }
  screen.render()
})
//set default table
table.setData({ headers: [ 'Info' ], data: [ [] ] })
screen.key([ 'escape', 'q', 'C-c' ], (ch, key) => process.exit(0))
screen.key([ 'tab' ], function (ch, key) {
  if (screen.focused == tree.rows)
    table.focus()
  else
    tree.focus()
})
tree.focus()
screen.render()
