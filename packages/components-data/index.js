import { DataTable } from './src/data-table'
import { List }      from './src/list'
import { ListBar }   from './src/list-bar'
import { ListTable } from './src/list-table'
import { Table }     from './src/table'
import { Tree }      from './src/tree'

const dataTable = options => new DataTable(options)
const list = (options) => new List(options)
const listBar = (options) => new ListBar(options)
const listTable = (options) => new ListTable(options)
const table = (options) => new Table(options)
const tree = options => new Tree(options)

export {
  DataTable, dataTable,
  List, list,
  ListBar, listBar,
  ListTable, listTable,
  Table, table,
  Tree, tree,
}