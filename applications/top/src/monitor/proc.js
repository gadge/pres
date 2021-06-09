import { roundD1 }     from '@aryth/math'
import { SP }          from '@texting/enum-chars'
import { AsyncLooper } from '@valjoux/linger'
import si              from 'systeminformation'

const KEY_TO_LABEL = {
  p: 'pid',
  c: 'cpu',
  m: 'mem',
}
const LABEL_TO_INDEX = {
  'pid': 0,
  'cpu': 2,
  'mem': 3,
}
const HEADERS = [ 'PID', 'Command', '%CPU', '%MEM' ]


export class Proc extends AsyncLooper {
  selectedLabel = 'cpu'
  resetIndex = false
  reverse = false
  constructor(table) {
    super(si.processes)
    /** @type {DataTable} */
    this.table = table
  }
  set readKey(ch) {
    if (this.selectedLabel === KEY_TO_LABEL[ch]) {
      this.reverse = !this.reverse
    }
    else {
      this.selectedLabel = KEY_TO_LABEL[ch] || this.selectedLabel
    }
  }
  get headers() {
    const headers = HEADERS.slice()
    headers[LABEL_TO_INDEX[this.selectedLabel]] += this.reverse ? '▲' : '▼'
    return headers
  }
  async run() {
    const updateData = this.updateData.bind(this)
    this.table.screen.key([ 'm', 'c', 'p' ], async (ch, key) => {
      this.readKey = ch
      this.resetIndex = true
      await si.processes().then(updateData)
    })
    await this.setInterval(3000, updateData) // setInterval(updater, 3000)
  }
  updateData(data) {
    const key = this.selectedLabel
    data = data.list
      .sort((a, b) => b[key] - a[key])
      .map(({ command, cpu, mem, pid }) => [ pid, command, SP + roundD1(cpu), roundD1(mem), ])
    this.table.setData({ headers: this.headers, data: this.reverse ? data.reverse() : data, })
    if (this.resetIndex) this.resetIndex = void this.table.rows.select(0) // this.resetIndex switched to false
    this.table.screen.render()
  }
}

