import { roundD1 } from '@aryth/math'
import { SP }      from '@texting/enum-chars'
import { Escape }  from '@valjoux/linger'
import si          from 'systeminformation'

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

export class Proc extends Escape {
  selectedLabel = 'cpu'
  resetIndex = false
  reverse = false
  on = true
  constructor() {
    super(si.processes)
  }
  set readKey(ch) {
    if (this.selectedLabel === KEY_TO_LABEL[ch]) { this.reverse = !this.reverse }
    else { this.selectedLabel = KEY_TO_LABEL[ch] ?? this.selectedLabel }
  }
  get head() {
    const head = HEADERS.slice()
    head[LABEL_TO_INDEX[this.selectedLabel]] += this.reverse ? '▲' : '▼'
    return head
  }
  async setInterval(ms, pipe) {
    await super.setInterval(ms, data => data|> this.dataToTable |> pipe) // setInterval(updater, 3000)
  }
  dataToTable(data) {
    const key = this.selectedLabel
    const rows = data.list
      .sort((a, b) => b[key] - a[key])
      .map(({ command, cpu, mem, pid }) => [ pid, command, SP + roundD1(cpu), roundD1(mem), ])
    return {
      head: this.head,
      rows: this.reverse ? rows.reverse() : rows,
    }
  }
  tryReset(dataTable) {
    if (this.resetIndex) this.resetIndex = void dataTable.rows.select(0) // this.resetIndex switched to false
  }
}

