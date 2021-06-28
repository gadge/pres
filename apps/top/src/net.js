import { LF }           from '@texting/enum-chars'
import { Escape }       from '@valjoux/linger'
import { iso }          from '@vect/vector-init'
import si               from 'systeminformation'
import { queue, utils } from '../util'

export class Net extends Escape {
  seriesCollection = []
  on = true
  constructor() {
    super() // () => si.networkInterfaceDefault().then(interfaces => si.networkStats(interfaces))
  }
  initSeriesCollection() {
    return this.seriesCollection = [ iso(61, 0), iso(61, 0) ]
  }
  updateSeriesCollection(data) {
    const [ stat ] = data
    const rx_sec = Math.max(0, stat.rx_sec)
    const tx_sec = Math.max(0, stat.tx_sec)
    queue(this.seriesCollection[0], rx_sec)
    queue(this.seriesCollection[1], tx_sec)
    this.seriesCollection[0].title =
      'Receiving:      ' + utils.humanFileSize(rx_sec) + '/s ' + LF +
      'Total received: ' + utils.humanFileSize(stat['rx_bytes'])
    this.seriesCollection[1].title =
      'Transferring:      ' + utils.humanFileSize(tx_sec) + '/s ' + LF +
      'Total transferred: ' + utils.humanFileSize(stat['tx_bytes'])
    return this.seriesCollection
  }
  async setInterval(ms, pipe) {
    this.initSeriesCollection()
    const interfaces = await si.networkInterfaceDefault()
    this.conf = { fn: async () => await si.networkStats(interfaces) }
    await super.setInterval(ms, data => data |> this.updateSeriesCollection |> pipe)
  }
}

