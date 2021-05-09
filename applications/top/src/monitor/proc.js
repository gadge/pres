import { AsyncLooper } from '@valjoux/linger'
import si              from 'systeminformation'
import { utils }       from '../utils'

const colors = utils.colors
const pars = {
  p: 'pid',
  c: 'cpu',
  m: 'mem',
}

export class Proc {
  constructor(table) {
    this.table = table
    this.pSort = 'cpu'
    this.reIndex = false
    this.reverse = false
    // this |> Deco({ depth: 1 }) |> says['Proc created']
  }
  async run() {
    const self = this
    // const updater = () => si.processes(data => self.updateData(data))
    const looper = AsyncLooper.build(si.processes)
    // updater()
    // this.interval =
    const updater = self.updateData.bind(self)
    this.table.screen.key([ 'm', 'c', 'p' ], async (ch, key) => {
      if (pars[ch] === self.pSort) { self.reverse = !self.reverse }
      else { self.pSort = pars[ch] || self.pSort }
      self.reIndex = true
      // updater()
      await si.processes().then(updater)
    })
    await looper.setInterval(3000, updater) // setInterval(updater, 3000)
  }
  updateData(data) {
    const par = this.pSort
    data = data.list
      .sort((a, b) => b[par] - a[par])
      .map(p => [
        p.pid,
        p.command, //.slice(0,10),
        ' ' + p.cpu?.toFixed(1),
        p.mem?.toFixed(1),
      ])
    const headers = [ 'PID', 'Command', '%CPU', '%MEM' ]
    headers[{
      pid: 0,
      cpu: 2,
      mem: 3,
    }[this.pSort]] += this.reverse ? '▲' : '▼'
    this.table.setData({
      headers: headers,
      data: this.reverse ? data.reverse() : data,
    })
    if (this.reIndex) {
      this.table.rows.select(0)
      this.reIndex = false
    }
    this.table.screen.render()
  }
}

