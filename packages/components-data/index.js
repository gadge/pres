import { List }      from './src/list'
import { Listbar }   from './src/listbar'
import { ListTable } from './src/listtable'
import { Table }     from './src/table'

const list = (options) => new List(options)
const listBar = (options) => new Listbar(options)
const listTable = (options) => new ListTable(options)
const table = (options) => new Table(options)

export {
  List, list,
  Listbar, listBar,
  ListTable, listTable,
  Table, table,
}