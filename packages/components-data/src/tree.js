import { Box }  from '@pres/components-core'
import { List } from './list'

export class Tree extends Box {
  constructor(options) {
    // if (!(this instanceof Node)) { return new Tree(options) }
    // options = options || {}
    options.bold = true
    // this.options = options
    super(options) // Mixin.assign(this, new Box(options)) // Box.call(this, options)
    const self = this
    this.data = {}
    this.nodeLines = []
    this.lineNbr = 0
    options.extended = options.extended || false
    options.keys = options.keys || [ '+', 'space', 'enter' ]
    options.template = options.template || {}
    options.template.extend = options.template.extend || ' [+]'
    options.template.retract = options.template.retract || ' [-]'
    options.template.lines = options.template.lines || false
    // Do not set height, since this create a bug where the first line is not always displayed
    this.rows = new List({
      top: 1,
      width: 0,
      left: 1,
      style: options.style,
      padding: options.padding,
      keys: true,
      tags: options.tags,
      input: options.input,
      vi: options.vi,
      ignoreKeys: options.ignoreKeys,
      scrollable: options.scrollable,
      mouse: options.mouse,
      selectedBg: 'blue',
    })
    this.append(this.rows)
    this.rows.key(options.keys, function () {
      const selectedNode = self.nodeLines[this.getItemIndex(this.selected)]
      if (selectedNode.sub) {
        selectedNode.extended = !selectedNode.extended
        self.setData(self.data)
        self.screen.render()
      }
      self.emit('select', selectedNode, this.getItemIndex(this.selected))
    })
    this.type = 'tree'
  }
  static build(options) { return new Tree(options) }
  walk(node, treeDepth) {
    let lines = []
    if (!node.sup) {
      // root level
      this.lineNbr = 0
      this.nodeLines.length = 0
      node.sup = null
    }
    if (treeDepth === '' && node.name) {
      this.lineNbr = 0
      this.nodeLines[this.lineNbr++] = node
      lines.push(node.name)
      treeDepth = ' '
    }
    node.depth = treeDepth.length - 1
    if (node.sub && node.extended) {
      let i = 0
      if (typeof node.sub === 'function') node.subContent = node.sub(node)
      if (!node.subContent) node.subContent = node.sub
      for (let unit in node.subContent) {
        if (!node.subContent[unit].name)
          node.subContent[unit].name = unit
        unit = node.subContent[unit]
        unit.sup = node
        unit.position = i++
        if (typeof unit.extended === 'undefined') unit.extended = this.options.extended
        if (typeof unit.sub === 'function') unit.subContent = unit.sub(unit)
        else
          unit.subContent = unit.sub
        const isLastChild = unit.position === Object.keys(unit.sup.subContent).length - 1
        let treePrefix
        let suffix = ''
        treePrefix = isLastChild ? '└' : '├'
        if (!unit.subContent || Object.keys(unit.subContent).length === 0) {
          treePrefix += '─'
        }
        else if (unit.extended) {
          treePrefix += '┬'
          suffix = this.options.template.retract
        }
        else {
          treePrefix += '─'
          suffix = this.options.template.extend
        }
        if (!this.options.template.lines) treePrefix = '|-'
        if (this.options.template.spaces) treePrefix = ' '
        lines.push(treeDepth + treePrefix + unit.name + suffix)
        this.nodeLines[this.lineNbr++] = unit
        let parentTree
        parentTree = isLastChild || !this.options.template.lines
          ? treeDepth + ' '
          : treeDepth + '│'
        lines = lines.concat(this.walk(unit, parentTree))
      }
    }
    return lines
  }
  focus() { this.rows.focus() }
  render() {
    if (this.screen.focused === this.rows) this.rows.focus()
    this.rows.width = this.width - 3
    this.rows.height = this.height - 3
    Box.prototype.render.call(this)
  }
  setData(nodes) {
    this.data = nodes
    this.rows.setItems(this.walk(nodes, ''))
  }
}
