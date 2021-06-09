import si        from 'systeminformation'
import { utils } from '../utils'

const colors = utils.colors

export class Disk {
  constructor(donut) {
    this.donut = donut
    si.fsSize(data => this.updateData(data))
    this.interval = setInterval(() => si.fsSize(data => this.updateData(data)), 10000)
  }
  updateData(data) {
    const disk = data[0]
    const label =
            utils.humanFileSize(disk.used, true) +
            ' of ' +
            utils.humanFileSize(disk.size, true)
    this.donut.setData([ {
      percent: disk.use / 100,
      label: label,
      color: colors[5],
    } ])
    this.donut.screen.render()
  }
}

